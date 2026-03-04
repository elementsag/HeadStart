"use client";

import { useReadContract, useReadContracts, useAccount } from "wagmi";
import { formatEther } from "viem";
import { CONTRACTS, FACTORY_ABI, LAUNCH_ABI, STAKING_ABI, ERC20_ABI } from "./contracts";

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
const factoryAbi = FACTORY_ABI as any;
const launchAbi = LAUNCH_ABI as any;
const stakingAbi = STAKING_ABI as any;
const erc20Abi = ERC20_ABI as any;

/**
 * Hook to read all launches from factory and their on-chain details.
 * Uses getLaunchInfo() on each launch contract (individual eth_calls)
 * to avoid multicall dependency which may not be available on Hedera.
 */
export function useLaunches() {
    // Step 1: Get the launch count
    const {
        data: countData,
        isLoading: countLoading,
        error: countError,
    } = useReadContract({
        address: factoryAddress,
        abi: factoryAbi,
        functionName: "launchCount",
    });

    const count = countData ? Number(countData) : 0;

    // Step 2: Get each launch info from factory (individual calls, no multicall needed)
    // We use useReadContracts but Hedera may not have multicall3 — so we build
    // the calls and handle failures gracefully.
    const factoryCalls = Array.from({ length: count }, (_, i) => ({
        address: factoryAddress,
        abi: factoryAbi,
        functionName: "getLaunch" as const,
        args: [BigInt(i)],
    }));

    const {
        data: launchInfos,
        isLoading: infosLoading,
    } = useReadContracts({
        contracts: factoryCalls as any,
        query: { enabled: count > 0 },
    });

    // Step 3: For each launch address, call getLaunchInfo() which returns
    // all data in ONE eth_call per launch — avoids multicall3 issues on Hedera
    const launchAddresses: `0x${string}`[] = [];
    const stakingAddresses: string[] = [];
    const creators: string[] = [];
    const names: string[] = [];
    const symbols: string[] = [];
    const isGames: boolean[] = [];
    const gameUris: string[] = [];

    if (launchInfos) {
        for (const info of launchInfos) {
            if (info.status === "success" && info.result) {
                const r = info.result as any;
                launchAddresses.push((r.launchContract || r[0]) as `0x${string}`);
                stakingAddresses.push(r.stakingContract || r[1]);
                creators.push(r.creator || r[2]);
                names.push(r.name || r[3]);
                symbols.push(r.symbol || r[4]);
                isGames.push(r.isGame ?? r[5] ?? false);
                gameUris.push(r.gameUri || r[6] || "");
            }
        }
    }

    // Call getLaunchInfo() on each launch contract — returns everything in one eth_call
    const launchInfoCalls = launchAddresses.map((addr) => ({
        address: addr,
        abi: launchAbi,
        functionName: "getLaunchInfo" as const,
    }));

    // Also get extra fields not in getLaunchInfo
    const extraCalls = launchAddresses.flatMap((addr) => [
        { address: addr, abi: launchAbi, functionName: "getTimeRemaining" as const },
        { address: addr, abi: launchAbi, functionName: "getTokenPrice" as const },
        { address: addr, abi: launchAbi, functionName: "tokensForSale" as const },
        { address: addr, abi: launchAbi, functionName: "tokensForLP" as const },
        { address: addr, abi: launchAbi, functionName: "tokensForStaking" as const },
    ]);

    const {
        data: launchInfoData,
        isLoading: infoLoading,
    } = useReadContracts({
        contracts: launchInfoCalls as any,
        query: { enabled: launchAddresses.length > 0, refetchInterval: 15_000 },
    });

    const {
        data: extraData,
        isLoading: extraLoading,
    } = useReadContracts({
        contracts: extraCalls as any,
        query: { enabled: launchAddresses.length > 0, refetchInterval: 15_000 },
    });

    // Step 4: Merge everything
    const launches: LiveLaunchData[] = [];
    if (launchInfoData) {
        for (let i = 0; i < launchAddresses.length; i++) {
            const infoD = launchInfoData[i];
            if (!infoD || infoD.status !== "success" || !infoD.result) continue;

            // getLaunchInfo returns: (name, symbol, totalSupply, hardCap, softCap, totalRaised, launchEnd, state, contributorCount, tokenAddress, isGame, gameUri)
            const r = infoD.result as any;
            const rArr = Array.isArray(r) ? r : Object.values(r);

            const extraOffset = i * 5;
            const getExtra = (idx: number): bigint => {
                if (!extraData) return 0n;
                const d = extraData[extraOffset + idx];
                if (d && d.status === "success" && d.result !== undefined) return d.result as bigint;
                return 0n;
            };

            const totalSupplyVal = rArr[2] as bigint || 0n;
            const hardCapVal = rArr[3] as bigint || 0n;
            const softCapVal = rArr[4] as bigint || 0n;
            const totalRaisedVal = rArr[5] as bigint || 0n;
            const launchEndVal = rArr[6] as bigint || 0n;
            const stateVal = Number(rArr[7] || 0);
            const contributorCountVal = Number(rArr[8] || 0);
            const tokenAddrVal = (rArr[9] || "0x0000000000000000000000000000000000000000") as string;
            const tokenPriceVal = getExtra(1);

            launches.push({
                id: i,
                name: names[i] || (rArr[0] as string) || "",
                symbol: symbols[i] || (rArr[1] as string) || "",
                launchContract: launchAddresses[i],
                stakingContract: stakingAddresses[i] || "",
                creator: creators[i] || "",
                isGame: isGames[i] ?? false,
                gameUri: gameUris[i] || "",
                totalRaised: parseFloat(formatEther(totalRaisedVal)),
                hardCap: parseFloat(formatEther(hardCapVal)),
                softCap: parseFloat(formatEther(softCapVal)),
                contributors: contributorCountVal,
                timeRemaining: Number(getExtra(0)),
                state: stateVal,
                tokenPrice: parseFloat(formatEther(tokenPriceVal)),
                tokenAddress: tokenAddrVal,
                launchEnd: Number(launchEndVal),
                totalSupply: parseFloat(formatEther(totalSupplyVal)),
                tokensForSale: parseFloat(formatEther(getExtra(2))),
                tokensForLP: parseFloat(formatEther(getExtra(3))),
                tokensForStaking: parseFloat(formatEther(getExtra(4))),
            });
        }
    }

    return {
        launches,
        isLoading: countLoading || infosLoading || infoLoading || extraLoading,
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
        { address: addr, abi: launchAbi, functionName: "totalRaised" as const },
        { address: addr, abi: launchAbi, functionName: "hardCap" as const },
        { address: addr, abi: launchAbi, functionName: "softCap" as const },
        { address: addr, abi: launchAbi, functionName: "contributorCount" as const },
        { address: addr, abi: launchAbi, functionName: "getTimeRemaining" as const },
        { address: addr, abi: launchAbi, functionName: "state" as const },
        { address: addr, abi: launchAbi, functionName: "getTokenPrice" as const },
        { address: addr, abi: launchAbi, functionName: "token" as const },
        ...(userAddress
            ? [
                { address: addr, abi: launchAbi, functionName: "contributions" as const, args: [userAddress] },
                { address: addr, abi: launchAbi, functionName: "hasClaimed" as const, args: [userAddress] },
            ]
            : []),
    ];

    return useReadContracts({
        contracts: contracts as any,
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
        { address: addr, abi: stakingAbi, functionName: "totalStaked" as const },
        { address: addr, abi: stakingAbi, functionName: "totalRewards" as const },
        { address: addr, abi: stakingAbi, functionName: "stakingEnd" as const },
        { address: addr, abi: stakingAbi, functionName: "totalStakers" as const },
        { address: addr, abi: stakingAbi, functionName: "getAPR" as const },
        { address: addr, abi: stakingAbi, functionName: "initialized" as const },
        // User-specific if connected
        ...(userAddress
            ? [
                { address: addr, abi: stakingAbi, functionName: "stakedBalance" as const, args: [userAddress] },
                { address: addr, abi: stakingAbi, functionName: "earned" as const, args: [userAddress] },
                { address: tokenAddresses[i], abi: erc20Abi, functionName: "balanceOf" as const, args: [userAddress] },
            ]
            : []),
    ]);

    const {
        data: stakingData,
        isLoading: stakingLoading,
    } = useReadContracts({
        contracts: stakingCalls as any,
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
