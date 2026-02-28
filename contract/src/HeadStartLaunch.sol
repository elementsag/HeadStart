// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "./HeadStartStaking.sol";

/**
 * @title HeadStartLaunch
 * @notice Individual token launch contract with bonding curve fundraising
 * @dev Handles token creation, fundraising, LP creation on DEX, and staking setup
 */

// Minimal DEX Router interface (SaucerSwap / Uniswap V2 compatible)
interface IDEXRouter {
    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external payable returns (uint amountToken, uint amountETH, uint liquidity);

    function factory() external pure returns (address);
    function WETH() external pure returns (address);
}

interface IDEXFactory {
    function createPair(address tokenA, address tokenB) external returns (address pair);
    function getPair(address tokenA, address tokenB) external view returns (address pair);
}

interface IWETH {
    function deposit() external payable;
    function transfer(address to, uint value) external returns (bool);
}

contract HeadStartToken is ERC20 {
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        address _mintTo
    ) ERC20(_name, _symbol) {
        _mint(_mintTo, _totalSupply);
    }
}

contract HeadStartLaunch {
    // ═══════════════════════════════════════════════════════════════
    //                         ENUMS
    // ═══════════════════════════════════════════════════════════════

    enum LaunchState {
        ACTIVE,      // Accepting contributions
        SUCCEEDED,   // Hard cap reached or duration ended above soft cap
        FINALIZED,   // LP created, staking funded, tokens distributed
        FAILED,      // Soft cap not reached by deadline
        CANCELLED    // Creator cancelled before finalization
    }

    // ═══════════════════════════════════════════════════════════════
    //                         STORAGE
    // ═══════════════════════════════════════════════════════════════

    // Token
    HeadStartToken public token;
    string public name;
    string public symbol;
    uint256 public totalSupply;

    // Raise parameters
    uint256 public hardCap;
    uint256 public softCap;
    uint256 public launchEnd;
    uint256 public launchDuration;
    uint256 public totalRaised;
    LaunchState public state;

    // Distribution (in basis points)
    uint256 public lpPercent;           // % of raised HBAR going to LP
    uint256 public stakingRewardPercent; // % of total supply for staking
    uint256 public platformFeeBps;

    // Addresses
    address public creator;
    address public feeRecipient;
    address public stakingContract;
    address public dexRouter;
    address public lpPair;

    // Contributions
    mapping(address => uint256) public contributions;
    address[] public contributors;
    uint256 public contributorCount;

    // Token allocation
    uint256 public tokensForSale;       // Tokens allocated for contributors
    uint256 public tokensForLP;         // Tokens allocated for LP
    uint256 public tokensForStaking;    // Tokens allocated for staking rewards
    uint256 public tokensForCreator;    // Tokens allocated for creator

    // Project or Game
    bool public isGame;
    string public gameUri;

    // Claim & Withdraw tracking
    mapping(address => bool) public hasClaimed;
    uint256 public pendingCreatorHbar;

    // ═══════════════════════════════════════════════════════════════
    //                          EVENTS
    // ═══════════════════════════════════════════════════════════════

    event Contributed(address indexed contributor, uint256 amount, uint256 totalRaised);
    event LaunchFinalized(address indexed lpPair, uint256 lpHbar, uint256 lpTokens);
    event TokensClaimed(address indexed claimer, uint256 amount);
    event RefundClaimed(address indexed claimer, uint256 amount);
    event LaunchCancelled();
    event StateChanged(LaunchState oldState, LaunchState newState);

    // ═══════════════════════════════════════════════════════════════
    //                        MODIFIERS
    // ═══════════════════════════════════════════════════════════════

    modifier onlyCreator() {
        require(msg.sender == creator, "HeadStartLaunch: not creator");
        _;
    }

    modifier inState(LaunchState _state) {
        require(state == _state, "HeadStartLaunch: invalid state");
        _;
    }

    // ═══════════════════════════════════════════════════════════════
    //                       CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        uint256 _hardCap,
        uint256 _softCap,
        uint256 _launchDuration,
        uint256 _lpPercent,
        uint256 _stakingRewardPercent,
        uint256 _platformFeeBps,
        address _feeRecipient,
        address _stakingContract,
        address _dexRouter,
        address _creator,
        bool _isGame,
        string memory _gameUri
    ) {
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply;
        hardCap = _hardCap;
        softCap = _softCap;
        launchDuration = _launchDuration;
        launchEnd = block.timestamp + _launchDuration;
        lpPercent = _lpPercent;
        stakingRewardPercent = _stakingRewardPercent;
        platformFeeBps = _platformFeeBps;
        feeRecipient = _feeRecipient;
        stakingContract = _stakingContract;
        dexRouter = _dexRouter;
        creator = _creator;
        isGame = _isGame;
        gameUri = _gameUri;
        state = LaunchState.ACTIVE;

        // Calculate token allocations
        tokensForStaking = (_totalSupply * _stakingRewardPercent) / 10000;
        tokensForLP = (_totalSupply * _lpPercent) / 10000; // Match HBAR LP percentage
        tokensForCreator = (_totalSupply * 500) / 10000; // 5% for creator
        tokensForSale = _totalSupply - tokensForStaking - tokensForLP - tokensForCreator;

        // Deploy the token - mint all to this contract
        token = new HeadStartToken(_name, _symbol, _totalSupply, address(this));
    }

    // ═══════════════════════════════════════════════════════════════
    //                      CONTRIBUTE
    // ═══════════════════════════════════════════════════════════════

    /**
     * @notice Contribute HBAR to the token launch
     */
    function contribute() external payable inState(LaunchState.ACTIVE) {
        require(block.timestamp < launchEnd, "HeadStartLaunch: launch ended");
        require(msg.value > 0, "HeadStartLaunch: zero contribution");
        require(totalRaised + msg.value <= hardCap, "HeadStartLaunch: exceeds hard cap");

        if (contributions[msg.sender] == 0) {
            contributors.push(msg.sender);
            contributorCount++;
        }

        contributions[msg.sender] += msg.value;
        totalRaised += msg.value;

        emit Contributed(msg.sender, msg.value, totalRaised);

        // Auto-finalize if hard cap reached
        if (totalRaised >= hardCap) {
            _changeState(LaunchState.SUCCEEDED);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //                      FINALIZE
    // ═══════════════════════════════════════════════════════════════

    /**
     * @notice Check and update launch state after deadline
     */
    function checkState() external {
        if (state != LaunchState.ACTIVE) return;
        if (block.timestamp >= launchEnd) {
            if (totalRaised >= softCap) {
                _changeState(LaunchState.SUCCEEDED);
            } else {
                _changeState(LaunchState.FAILED);
            }
        }
    }

    /**
     * @notice Finalize the launch - create LP, fund staking, distribute tokens
     */
    function finalize() external inState(LaunchState.SUCCEEDED) {
        // Platform fee
        uint256 platformFee = (totalRaised * platformFeeBps) / 10000;
        uint256 remaining = totalRaised - platformFee;

        // Send platform fee
        if (platformFee > 0) {
            (bool feeSent, ) = payable(feeRecipient).call{value: platformFee}("");
            require(feeSent, "HeadStartLaunch: fee transfer failed");
        }

        // LP allocation
        uint256 hbarForLP = (remaining * lpPercent) / 10000;
        uint256 hbarForCreator = remaining - hbarForLP;

        // Create LP on DEX
        if (hbarForLP > 0 && dexRouter != address(0)) {
            IERC20(address(token)).approve(dexRouter, tokensForLP);
            
            try IDEXRouter(dexRouter).addLiquidityETH{value: hbarForLP}(
                address(token),
                tokensForLP,
                0, // accept any amount of tokens
                0, // accept any amount of HBAR
                address(this), // LP tokens stay in contract (locked)
                block.timestamp + 300
            ) returns (uint256 amountToken, uint256 amountETH, uint256 /* liquidity */) {
                // LP created successfully
                // Address [H-2]: Refund unspent HBAR and Tokens to creator
                if (hbarForLP > amountETH) {
                    hbarForCreator += (hbarForLP - amountETH);
                }
                if (tokensForLP > amountToken) {
                    tokensForCreator += (tokensForLP - amountToken);
                }
                
                // Address [M-1]: Retrieve LP pair
                lpPair = IDEXFactory(IDEXRouter(dexRouter).factory()).getPair(
                    address(token), 
                    IDEXRouter(dexRouter).WETH()
                );
            } catch {
                // Address [H-1]: If LP creation fails, send HBAR and tokens to creator instead
                hbarForCreator += hbarForLP;
                tokensForCreator += tokensForLP;
            }
        } else {
            hbarForCreator += hbarForLP;
            tokensForCreator += tokensForLP;
        }

        // Send remaining HBAR to creator
        if (hbarForCreator > 0) {
            (bool sent, ) = payable(creator).call{value: hbarForCreator}("");
            // Address [H-3]: Don't revert if creator transfer fails, store it for pulling
            if (!sent) {
                pendingCreatorHbar += hbarForCreator;
            }
        }

        // Fund staking contract
        if (tokensForStaking > 0 && stakingContract != address(0)) {
            IERC20(address(token)).approve(stakingContract, tokensForStaking);
            HeadStartStaking(stakingContract).initialize(
                address(token),
                tokensForStaking
            );
        }

        // Send creator tokens
        if (tokensForCreator > 0) {
            IERC20(address(token)).transfer(creator, tokensForCreator);
        }

        _changeState(LaunchState.FINALIZED);

        emit LaunchFinalized(lpPair, hbarForLP, tokensForLP);
    }

    // ═══════════════════════════════════════════════════════════════
    //                      CLAIM TOKENS
    // ═══════════════════════════════════════════════════════════════

    /**
     * @notice Claim tokens after successful finalization
     */
    function claimTokens() external inState(LaunchState.FINALIZED) {
        require(contributions[msg.sender] > 0, "HeadStartLaunch: no contribution");
        require(!hasClaimed[msg.sender], "HeadStartLaunch: already claimed");

        uint256 userShare = (contributions[msg.sender] * tokensForSale) / totalRaised;
        hasClaimed[msg.sender] = true;

        IERC20(address(token)).transfer(msg.sender, userShare);

        emit TokensClaimed(msg.sender, userShare);
    }

    /**
     * @notice Claim refund if launch failed
     */
    function claimRefund() external inState(LaunchState.FAILED) {
        uint256 amount = contributions[msg.sender];
        require(amount > 0, "HeadStartLaunch: no contribution");

        contributions[msg.sender] = 0;

        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "HeadStartLaunch: refund failed");

        emit RefundClaimed(msg.sender, amount);
    }

    /**
     * @notice Allow creator to withdraw pending HBAR if original transfer failed (Pull pattern)
     */
    function withdrawPendingHbar() external onlyCreator {
        uint256 amount = pendingCreatorHbar;
        require(amount > 0, "HeadStartLaunch: no pending HBAR");

        pendingCreatorHbar = 0;

        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "HeadStartLaunch: withdrawal failed");
    }

    // ═══════════════════════════════════════════════════════════════
    //                      CANCEL
    // ═══════════════════════════════════════════════════════════════

    /**
     * @notice Creator can cancel the launch before finalization
     */
    function cancel() external onlyCreator inState(LaunchState.ACTIVE) {
        _changeState(LaunchState.FAILED);
        emit LaunchCancelled();
    }

    // ═══════════════════════════════════════════════════════════════
    //                        VIEWS
    // ═══════════════════════════════════════════════════════════════

    function getContribution(address _contributor) external view returns (uint256) {
        return contributions[_contributor];
    }

    function getProgress() external view returns (uint256) {
        if (hardCap == 0) return 0;
        return (totalRaised * 10000) / hardCap;
    }

    function getTimeRemaining() external view returns (uint256) {
        if (block.timestamp >= launchEnd) return 0;
        return launchEnd - block.timestamp;
    }

    function getTokenPrice() external view returns (uint256) {
        if (tokensForSale == 0) return 0;
        return (totalRaised > 0 ? (totalRaised * 1e18) / tokensForSale : (hardCap * 1e18) / tokensForSale);
    }

    function getContributors() external view returns (address[] memory) {
        return contributors;
    }

    function getLaunchInfo() external view returns (
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        uint256 _hardCap,
        uint256 _softCap,
        uint256 _totalRaised,
        uint256 _launchEnd,
        LaunchState _state,
        uint256 _contributorCount,
        address _tokenAddress,
        bool _isGame,
        string memory _gameUri
    ) {
        return (
            name,
            symbol,
            totalSupply,
            hardCap,
            softCap,
            totalRaised,
            launchEnd,
            state,
            contributorCount,
            address(token),
            isGame,
            gameUri
        );
    }

    // ═══════════════════════════════════════════════════════════════
    //                       INTERNAL
    // ═══════════════════════════════════════════════════════════════

    function _changeState(LaunchState _newState) internal {
        LaunchState old = state;
        state = _newState;
        emit StateChanged(old, _newState);
    }

    receive() external payable {}
}
