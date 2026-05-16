"use client";

import { useState, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createStorage, cookieStorage } from "wagmi";
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { getSupportedChains } from "@/lib/chain-registry";
import type { Chain } from "viem/chains";
import "@rainbow-me/rainbowkit/styles.css";

interface WalletProviderProps {
  children: ReactNode;
  initialState?: any;
}

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
const hasWalletConnectProjectId =
  !!walletConnectProjectId && walletConnectProjectId !== "YOUR_PROJECT_ID";

export function WalletProvider({
  children,
  initialState,
}: WalletProviderProps) {
  const [queryClient] = useState(() => new QueryClient());
  const [config] = useState(() => {
    const supportedChains = getSupportedChains().map(c => c.chain) as [Chain, ...Chain[]];
    return getDefaultConfig({
      appName: "Omeswap",
      projectId: walletConnectProjectId || "walletconnect-disabled",
      chains: supportedChains,
      wallets: [
        {
          groupName: "Recommended",
          wallets: hasWalletConnectProjectId
            ? [metaMaskWallet, coinbaseWallet, walletConnectWallet]
            : [injectedWallet, metaMaskWallet, coinbaseWallet],
        },
      ],
      storage: createStorage({
        storage: cookieStorage,
      }),
    });
  });

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
