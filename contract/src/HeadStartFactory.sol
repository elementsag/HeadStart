// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./HeadStartLaunch.sol";
import "./HeadStartStaking.sol";

/**
 * @title HeadStartFactory
 * @notice Factory contract to deploy new token launches on Hedera
 * @dev Creates launch contracts with bonding curve fundraising + LP creation + staking
 */
contract HeadStartFactory {
    // ═══════════════════════════════════════════════════════════════
    //                          STORAGE
    // ═══════════════════════════════════════════════════════════════

    address public owner;
    address public feeRecipient;
    uint256 public platformFeeBps = 250; // 2.5%
    uint256 public launchCount;

    struct LaunchInfo {
        address launchContract;
        address stakingContract;
        address creator;
        string name;
        string symbol;
        bool isGame;
        string gameUri;
        uint256 createdAt;
        bool active;
    }

    mapping(uint256 => LaunchInfo) public launches;
    mapping(address => uint256[]) public creatorLaunches;
    address[] public allLaunches;

    // ═══════════════════════════════════════════════════════════════
    //                          EVENTS
    // ═══════════════════════════════════════════════════════════════

    event LaunchCreated(
        uint256 indexed launchId,
        address indexed launchContract,
        address indexed stakingContract,
        address creator,
        string name,
        string symbol,
        bool isGame,
        string gameUri,
        uint256 hardCap,
        uint256 totalSupply
    );

    event OwnershipTransferred(address indexed oldOwner, address indexed newOwner);
    event FeeUpdated(uint256 oldFee, uint256 newFee);

    // ═══════════════════════════════════════════════════════════════
    //                         MODIFIERS
    // ═══════════════════════════════════════════════════════════════

    modifier onlyOwner() {
        require(msg.sender == owner, "HeadStartFactory: not owner");
        _;
    }

    // ═══════════════════════════════════════════════════════════════
    //                        CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════

    constructor(address _feeRecipient) {
        owner = msg.sender;
        feeRecipient = _feeRecipient;
    }

    // ═══════════════════════════════════════════════════════════════
    //                      CREATE LAUNCH
    // ═══════════════════════════════════════════════════════════════

    /**
     * @notice Create a new token launch with staking
     * @param _name Token name
     * @param _symbol Token symbol
     * @param _totalSupply Total supply of the token (in wei)
     * @param _hardCap Hard cap for the raise in HBAR (in wei)
     * @param _softCap Soft cap for the raise in HBAR (in wei)
     * @param _launchDuration Duration of the launch in seconds
     * @param _lpPercent Percentage of raised funds going to LP (in bps, e.g., 5000 = 50%)
     * @param _stakingRewardPercent Percentage of total supply allocated to staking rewards (in bps)
     * @param _stakingDuration Duration for the staking reward period
     * @param _dexRouter Address of the DEX router for LP creation (e.g., SaucerSwap)
     * @param _isGame Whether this launch is a Game (true) or a Project (false)
     * @param _gameUri Optional URI linking to the game's manifest or URL
     */
    function createLaunch(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        uint256 _hardCap,
        uint256 _softCap,
        uint256 _launchDuration,
        uint256 _lpPercent,
        uint256 _stakingRewardPercent,
        uint256 _stakingDuration,
        address _dexRouter,
        bool _isGame,
        string memory _gameUri
    ) external returns (uint256 launchId, address launchAddr, address stakingAddr) {
        require(_hardCap > 0, "HeadStartFactory: hardCap must be > 0");
        require(_softCap > 0 && _softCap <= _hardCap, "HeadStartFactory: invalid softCap");
        require(_totalSupply > 0, "HeadStartFactory: totalSupply must be > 0");
        require(_lpPercent <= 8000, "HeadStartFactory: lpPercent too high");
        require(_stakingRewardPercent <= 3000, "HeadStartFactory: staking reward too high");

        launchId = launchCount;

        // Deploy staking contract
        HeadStartStaking staking = new HeadStartStaking(
            _stakingDuration
        );

        // Deploy launch contract
        HeadStartLaunch launch = new HeadStartLaunch(
            _name,
            _symbol,
            _totalSupply,
            _hardCap,
            _softCap,
            _launchDuration,
            _lpPercent,
            _stakingRewardPercent,
            platformFeeBps,
            feeRecipient,
            address(staking),
            _dexRouter,
            msg.sender,
            _isGame,
            _gameUri
        );

        // Set the token address in staking after launch deploys it
        stakingAddr = address(staking);
        launchAddr = address(launch);

        // Transfer staking ownership to launch contract 
        staking.transferOwnership(launchAddr);

        launches[launchId] = LaunchInfo({
            launchContract: launchAddr,
            stakingContract: stakingAddr,
            creator: msg.sender,
            name: _name,
            symbol: _symbol,
            isGame: _isGame,
            gameUri: _gameUri,
            createdAt: block.timestamp,
            active: true
        });

        creatorLaunches[msg.sender].push(launchId);
        allLaunches.push(launchAddr);
        launchCount++;

        emit LaunchCreated(
            launchId,
            launchAddr,
            stakingAddr,
            msg.sender,
            _name,
            _symbol,
            _isGame,
            _gameUri,
            _hardCap,
            _totalSupply
        );
    }

    // ═══════════════════════════════════════════════════════════════
    //                          VIEWS
    // ═══════════════════════════════════════════════════════════════

    function getLaunch(uint256 _launchId) external view returns (LaunchInfo memory) {
        return launches[_launchId];
    }

    function getCreatorLaunches(address _creator) external view returns (uint256[] memory) {
        return creatorLaunches[_creator];
    }

    function getAllLaunches() external view returns (address[] memory) {
        return allLaunches;
    }

    function getLaunchCount() external view returns (uint256) {
        return launchCount;
    }

    // ═══════════════════════════════════════════════════════════════
    //                         ADMIN
    // ═══════════════════════════════════════════════════════════════

    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        feeRecipient = _feeRecipient;
    }

    function setPlatformFee(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= 1000, "HeadStartFactory: fee too high"); // max 10%
        uint256 old = platformFeeBps;
        platformFeeBps = _feeBps;
        emit FeeUpdated(old, _feeBps);
    }

    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "HeadStartFactory: zero address");
        emit OwnershipTransferred(owner, _newOwner);
        owner = _newOwner;
    }
}
