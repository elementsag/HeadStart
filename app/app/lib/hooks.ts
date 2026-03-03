"use client";

import { useReadContract, useReadContracts, useAccount } from "wagmi";
import { formatEther } from "viem";
import { CONTRACTS, FACTORY_ABI as _FACTORY_ABI, LAUNCH_ABI as _LAUNCH_ABI, STAKING_ABI as _STAKING_ABI, ERC20_ABI as _ERC20_ABI } from "./contracts";

// Cast human-readable ABIs to any for wagmi compat
const FACTORY_ABI = _FACTORY_ABI as any;
const LAUNCH_ABI = _LAUNCH_ABI as any;
const STAKING_ABI = _STAKING_ABI as any;
const ERC20_ABI = _ERC20_ABI as any;

// ═══════════════════════════════════════════════════════════════
//                    LAUNCH LIST HOOK
// ═══════════════════════════════════════════════════════════════

export interface LiveLaunchData {
    id: number;
    name: string;
    symbol: string;
    launchContract: string;
    stakingContract: string;
    creator: string;
    isGame: boolean;
    gameUri: string;
    totalRaised: number;
    hardCap: number;
    softCap: number;
    contributors: number;
    timeRemaining: number;
    state: number;
    tokenPrice: number;
    tokenAddress: string;
    launchEnd: number;
    totalSupply: number;
    tokensForSale: number;
    tokensForLP: number;
    tokensForStaking: number;
}

const factoryAddress = CONTRACTS.FACTORY as `0x${string}`;

/**
 * Hook to read the launch count from the factory
 */
export function useLaunchCount() {
    return useReadContract({
        address: factoryAddress,
        abi: FACTORY_ABI,
        functionName: "launchCount",
    });
}

/**
 * Hook to read all launches from factory and their on-chain details
 */
export function useLaunches() {
    // Step 1: Get the launch count
    const {
        data: countData,
        isLoading: countLoading,
        error: countError,
    } = useReadContract({
        address: factoryAddress,
        abi: FACTORY_ABI,
        functionName: "launchCount",
    });

    const count = countData ? Number(countData) : 0;

    // Step 2: Build calls to get each launch from factory
    const factoryCalls = Array.from({ length: count }, (_, i) => ({
        address: factoryAddress,
        abi: FACTORY_ABI,
        functionName: "getLaunch" as const,
        args: [BigInt(i)],
    }));

    const {
        data: launchInfos,
        isLoading: infosLoading,
    } = useReadContracts({
        contracts: factoryCalls,
        query: { enabled: count > 0 },
    });

    // Step 3: For each launch address, read its on-chain state
    const launchAddresses: `0x${string}`[] = [];
    if (launchInfos) {
        for (const info of launchInfos) {
            if (info.status === "success" && info.result) {
                const r = info.result as any;
                launchAddresses.push(r.launchContract || r[0]);
            }
        }
    }

    // Build multicall for detailed launch data
    const detailCalls = launchAddresses.flatMap((addr) => [
        { address: addr, abi: LAUNCH_ABI, functionName: "totalRaised" as const },
        { address: addr, abi: LAUNCH_ABI, functionName: "hardCap" as const },
        { address: addr, abi: LAUNCH_ABI, functionName: "softCap" as const },
        { address: addr, abi: LAUNCH_ABI, functionName: "contributorCount" as const },
        { address: addr, abi: LAUNCH_ABI, functionName: "getTimeRemaining" as const },
        { address: addr, abi: LAUNCH_ABI, functionName: "state" as const },
        { address: addr, abi: LAUNCH_ABI, functionName: "getTokenPrice" as const },
        { address: addr, abi: LAUNCH_ABI, functionName: "token" as const },
        { address: addr, abi: LAUNCH_ABI, functionName: "launchEnd" as const },
        { address: addr, abi: LAUNCH_ABI, functionName: "totalSupply" as const },
        { address: addr, abi: LAUNCH_ABI, functionName: "tokensForSale" as const },
        { address: addr, abi: LAUNCH_ABI, functionName: "tokensForLP" as const },
        { address: addr, abi: LAUNCH_ABI, functionName: "tokensForStaking" as const },
    ]);

    const {
        data: detailData,
        isLoading: detailsLoading,
    } = useReadContracts({
        contracts: detailCalls,
        query: { enabled: launchAddresses.length > 0 },
    });

    // Step 4: Merge everything
    const launches: LiveLaunchData[] = [];
    if (launchInfos && detailData) {
        const fieldsPerLaunch = 13;
        for (let i = 0; i < launchAddresses.length; i++) {
            const info = launchInfos[i];
            if (info.status !== "success" || !info.result) continue;
            const r = info.result as any;

            const offset = i * fieldsPerLaunch;
            const getValue = (idx: number): bigint => {
                const d = detailData[offset + idx];
                if (d && d.status === "success" && d.result !== undefined) return d.result as bigint;
                return 0n;
            };
            const getAddr = (idx: number): string => {
                const d = detailData[offset + idx];
                if (d && d.status === "success" && d.result !== undefined) return d.result as string;
                return "0x0000000000000000000000000000000000000000";
            };

            const hardCap = getValue(1);
            const tokenPrice = getValue(6);

            launches.push({
                id: i,
                name: r.name || r[3],
                symbol: r.symbol || r[4],
                launchContract: r.launchContract || r[0],
                stakingContract: r.stakingContract || r[1],
                creator: r.creator || r[2],
                isGame: r.isGame ?? r[5] ?? false,
                gameUri: r.gameUri || r[6] || "",
                totalRaised: parseFloat(formatEther(getValue(0))),
                hardCap: parseFloat(formatEther(hardCap)),
                softCap: parseFloat(formatEther(getValue(2))),
                contributors: Number(getValue(3)),
                timeRemaining: Number(getValue(4)),
                state: Number(getValue(5)),
                tokenPrice: parseFloat(formatEther(tokenPrice)),
                tokenAddress: getAddr(7),
                launchEnd: Number(getValue(8)),
                totalSupply: parseFloat(formatEther(getValue(9))),
                tokensForSale: parseFloat(formatEther(getValue(10))),
                tokensForLP: parseFloat(formatEther(getValue(11))),
                tokensForStaking: parseFloat(formatEther(getValue(12))),
            });
        }
    }

    return {
        launches,
        isLoading: countLoading || infosLoading || detailsLoading,
        error: countError,
        count,
    };
}

// ═══════════════════════════════════════════════════════════════
//                   SINGLE LAUNCH DETAIL HOOK
// ═══════════════════════════════════════════════════════════════

export function useLaunchDetail(launchAddress: string) {
    const { address: userAddress } = useAccount();
    const addr = launchAddress as `0x${string}`;

    const contracts = [
        { address: addr, abi: LAUNCH_ABI, functionName: "totalRaised" as const },
        { address: addr, abi: LAUNCH_ABI, functionName: "hardCap" as const },
        { address: addr, abi: LAUNCH_ABI, functionName: "softCap" as const },
        { address: addr, abi: LAUNCH_ABI, functionName: "contributorCount" as const },
        { address: addr, abi: LAUNCH_ABI, functionName: "getTimeRemaining" as const },
        { address: addr, abi: LAUNCH_ABI, functionName: "state" as const },
        { address: addr, abi: LAUNCH_ABI, functionName: "getTokenPrice" as const },
        { address: addr, abi: LAUNCH_ABI, functionName: "token" as const },
        ...(userAddress
            ? [
                { address: addr, abi: LAUNCH_ABI, functionName: "contributions" as const, args: [userAddress] },
                { address: addr, abi: LAUNCH_ABI, functionName: "hasClaimed" as const, args: [userAddress] },
            ]
            : []),
    ];

    return useReadContracts({
        contracts,
        query: {
            enabled: !!launchAddress,
            refetchInterval: 10_000, // Refresh every 10s
        },
    });
}

// ═══════════════════════════════════════════════════════════════
//                    STAKING POOLS HOOK
// ═══════════════════════════════════════════════════════════════

export interface LiveStakingPool {
    tokenName: string;
    tokenSymbol: string;
    stakingAddress: string;
    tokenAddress: string;
    totalStaked: number;
    userStaked: number;
    userEarned: number;
    apr: number;
    totalRewards: number;
    stakingEnd: number;
    totalStakers: number;
    tokenBalance: number;
    initialized: boolean;
    launchName: string;
}

export function useStakingPools() {
    const { address: userAddress } = useAccount();

    // Step 1: Get all launches
    const { launches, isLoading: launchesLoading } = useLaunches();

    // Step 2: For each launch, read staking contract info
    const stakingAddresses = launches.map((l) => l.stakingContract as `0x${string}`);
    const tokenAddresses = launches.map((l) => l.tokenAddress as `0x${string}`);

    const stakingCalls = stakingAddresses.flatMap((addr, i) => [
        { address: addr, abi: STAKING_ABI, functionName: "totalStaked" as const },
        { address: addr, abi: STAKING_ABI, functionName: "totalRewards" as const },
        { address: addr, abi: STAKING_ABI, functionName: "stakingEnd" as const },
        { address: addr, abi: STAKING_ABI, functionName: "totalStakers" as const },
        { address: addr, abi: STAKING_ABI, functionName: "getAPR" as const },
        { address: addr, abi: STAKING_ABI, functionName: "initialized" as const },
        // User-specific if connected
        ...(userAddress
            ? [
                { address: addr, abi: STAKING_ABI, functionName: "stakedBalance" as const, args: [userAddress] },
                { address: addr, abi: STAKING_ABI, functionName: "earned" as const, args: [userAddress] },
                { address: tokenAddresses[i], abi: ERC20_ABI, functionName: "balanceOf" as const, args: [userAddress] },
            ]
            : []),
    ]);

    const {
        data: stakingData,
        isLoading: stakingLoading,
    } = useReadContracts({
        contracts: stakingCalls,
        query: {
            enabled: stakingAddresses.length > 0,
            refetchInterval: 15_000,
        },
    });

    // Step 3: Build pools
    const pools: LiveStakingPool[] = [];
    const fieldsPerPool = userAddress ? 9 : 6;

    if (stakingData) {
        for (let i = 0; i < launches.length; i++) {
            const launch = launches[i];
            const offset = i * fieldsPerPool;

            const getValue = (idx: number): bigint => {
                const d = stakingData[offset + idx];
                if (d && d.status === "success" && d.result !== undefined) return d.result as bigint;
                return 0n;
            };
            const getBool = (idx: number): boolean => {
                const d = stakingData[offset + idx];
                if (d && d.status === "success" && d.result !== undefined) return d.result as boolean;
                return false;
            };

            const isInit = getBool(5);

            pools.push({
                launchName: launch.name,
                tokenName: launch.name,
                tokenSymbol: launch.symbol,
                stakingAddress: launch.stakingContract,
                tokenAddress: launch.tokenAddress,
                totalStaked: parseFloat(formatEther(getValue(0))),
                totalRewards: parseFloat(formatEther(getValue(1))),
                stakingEnd: Number(getValue(2)),
                totalStakers: Number(getValue(3)),
                apr: Number(getValue(4)),
                initialized: isInit,
                userStaked: userAddress ? parseFloat(formatEther(getValue(6))) : 0,
                userEarned: userAddress ? parseFloat(formatEther(getValue(7))) : 0,
                tokenBalance: userAddress ? parseFloat(formatEther(getValue(8))) : 0,
            });
        }
    }

    return {
        pools,
        isLoading: launchesLoading || stakingLoading,
    };
}
