import { BaseNode } from "../BaseNode";
import type {
  HandleDef,
  ConfigField,
  ExecutionContext,
} from "@/types/agent-builder-canvas";
import { ethers } from "ethers";
import { useTransactionStore } from "@/store/transaction-store";
import { getChainConfig, getDefaultChainId } from "@/lib/chain-registry";
import { normalizeWalletAddress } from "@/lib/onboarding";
import {
  JAINE_DEX_ID,
  JAINE_DEX_NAME,
  JAINE_MARKET_ID,
  JAINE_POOL_FEE,
  JAINE_V3_ROUTER_ADDRESS,
  isJaineTokenPair,
} from "@/lib/dex/jaine";
import { getDexMarketConfig } from "@/lib/dex/markets";

const ROUTER_ABI = [
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function swapExactAVAXForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
  "function swapExactTokensForAVAX(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
];

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
];

const JAINE_ROUTER_ABI = [
  "function exactInputSingle((address tokenIn,address tokenOut,uint24 fee,address recipient,uint256 deadline,uint256 amountIn,uint256 amountOutMinimum,uint160 sqrtPriceLimitX96) params) external payable returns (uint256 amountOut)",
];

// Resolved once at module load from the chain registry
const _config = getChainConfig(getDefaultChainId());
const _nativeSymbol = _config.chain.nativeCurrency.symbol;
const _v1Routers = _config.dexRouters.filter((r) => r.type === "uniswapV2");
const _jaineRouter = _config.dexRouters.find((r) => r.id === JAINE_DEX_ID);
const _dexNames = [
  ..._v1Routers.map((r) => r.name),
  ...(_jaineRouter ? [_jaineRouter.name] : []),
];
const _defaultDex = _dexNames[0] ?? JAINE_DEX_NAME;
const _tokenSymbols = Object.keys(_config.tokens);

function normalizeTokenKey(value: string) {
  if (_config.tokens[value]) return value;
  const upper = value.toUpperCase();
  if (upper === "USDC.E") return "USDC";
  if (upper === "0G" || upper === "OG") return "W0G";
  return value;
}

function isJaineDex(value: string) {
  const normalized = value.toLowerCase();
  return normalized === JAINE_DEX_ID || normalized === JAINE_DEX_NAME.toLowerCase();
}

function decimalString(value: number, decimals: number) {
  if (!Number.isFinite(value) || value <= 0) return "0";
  return value.toFixed(Math.min(decimals, 18));
}

async function fetchJainePriceUsd() {
  const fallback = getDexMarketConfig(JAINE_MARKET_ID).fallback.priceUsd;

  try {
    const response = await fetch(`/api/dex/markets?id=${encodeURIComponent(JAINE_MARKET_ID)}`);
    if (!response.ok) return fallback;

    const payload = (await response.json()) as { market?: { priceUsd?: number } };
    const price = payload.market?.priceUsd;
    return typeof price === "number" && Number.isFinite(price) && price > 0 ? price : fallback;
  } catch {
    return fallback;
  }
}

export class SwapNode extends BaseNode {
  readonly type = "swap";
  readonly label = "Swap";
  readonly description = `Executes a token swap on ${_dexNames.join(" or ") || JAINE_DEX_NAME}`;
  readonly icon = "Repeat2";
  readonly category = "action" as const;
  readonly color = "border-green-500";
  readonly bgColor = "bg-green-950";

  readonly handles: HandleDef[] = [
    {
      id: "signal",
      label: "Execute",
      position: "left",
      type: "target",
      dataType: "signal",
    },
    {
      id: "txHash",
      label: "Tx Hash",
      position: "right",
      type: "source",
      dataType: "string",
    },
  ];

  readonly configSchema: ConfigField[] = [
    {
      key: "dex",
      label: "DEX",
      type: "select",
      options: _dexNames.length ? _dexNames : [JAINE_DEX_NAME],
      default: _defaultDex,
    },
    {
      key: "tokenIn",
      label: "Token In",
      type: "select",
      // Native coin is only available on generic V2-style routers.
      options: [_nativeSymbol, ..._tokenSymbols],
      default: "USDC",
    },
    {
      key: "tokenOut",
      label: "Token Out",
      type: "select",
      options: _tokenSymbols,
      default: "W0G",
    },
    {
      key: "amountIn",
      label: "Amount In",
      type: "number",
      default: 0.1,
    },
    {
      key: "slippage",
      label: "Slippage %",
      type: "number",
      default: 0.5,
    },
  ];

  async execute(
    inputs: Record<string, unknown>,
    context: ExecutionContext,
  ): Promise<Record<string, unknown>> {
    if (!inputs.signal) {
      context.addLog("[Swap] Skipped: no execution signal received", "warn");
      return { txHash: null };
    }
    if (!context.signer || !context.walletAddress)
      throw new Error("Wallet not connected");

    const dex = (this.config.dex as string) || _defaultDex;
    const tokenIn = normalizeTokenKey((this.config.tokenIn as string) || "USDC");
    const tokenOut = normalizeTokenKey((this.config.tokenOut as string) || "W0G");
    const configuredAmount = this.config.amountIn ?? this.config.amount ?? 0.1;
    const amountIn = Number(configuredAmount);
    const slippage = (this.config.slippage as number) || 0.5;

    if (!Number.isFinite(amountIn) || amountIn <= 0) {
      throw new Error("Swap amount must be greater than 0");
    }

    const outToken = _config.tokens[tokenOut];
    if (!outToken) throw new Error(`Unknown token out: ${tokenOut}`);

    const signer = context.signer as ethers.Signer;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
    const slippageBps = BigInt(Math.floor((1 - slippage / 100) * 10000));

    context.addLog(
      `[Swap] ${amountIn} ${tokenIn} -> ${tokenOut} on ${dex} (slippage: ${slippage}%)`,
    );

    let tx;

    if (isJaineDex(dex)) {
      if (tokenIn === _nativeSymbol) {
        throw new Error("Jaine uses wrapped W0G. Select W0G instead of native 0G.");
      }

      const inToken = _config.tokens[tokenIn];
      if (!inToken) throw new Error(`Unknown token in: ${tokenIn}`);
      if (!isJaineTokenPair(inToken.address, outToken.address)) {
        throw new Error("Jaine currently supports the W0G/USDC.e market in this app.");
      }

      const amountInWei = ethers.parseUnits(
        amountIn.toString(),
        inToken.decimals,
      );
      const priceUsd = await fetchJainePriceUsd();
      const estimatedOut = tokenIn === "W0G" ? amountIn * priceUsd : amountIn / priceUsd;
      const amountOutMin = ethers.parseUnits(
        decimalString(estimatedOut * (1 - slippage / 100), outToken.decimals),
        outToken.decimals,
      );

      const tokenContract = new ethers.Contract(
        inToken.address,
        ERC20_ABI,
        signer,
      );
      const allowance = await tokenContract.allowance(
        context.walletAddress,
        JAINE_V3_ROUTER_ADDRESS,
      );
      if (allowance < amountInWei) {
        context.addLog(`[Swap] Approving ${inToken.symbol}...`);
        const approveTx = await tokenContract.approve(
          JAINE_V3_ROUTER_ADDRESS,
          ethers.MaxUint256,
        );
        await approveTx.wait();
        context.addLog("[Swap] Approved");
      }

      const router = new ethers.Contract(JAINE_V3_ROUTER_ADDRESS, JAINE_ROUTER_ABI, signer);
      tx = await router.exactInputSingle({
        tokenIn: inToken.address,
        tokenOut: outToken.address,
        fee: JAINE_POOL_FEE,
        recipient: context.walletAddress,
        deadline,
        amountIn: amountInWei,
        amountOutMinimum: amountOutMin,
        sqrtPriceLimitX96: 0n,
      });
    } else {
      const routerEntry = _v1Routers.find((r) => r.name === dex);
      if (!routerEntry) throw new Error(`Unknown DEX: ${dex}`);
      const routerAddress = routerEntry.routerAddress;
      const router = new ethers.Contract(routerAddress, ROUTER_ABI, signer);

      // Native coin -> ERC-20.
      if (tokenIn === _nativeSymbol) {
        const amountInWei = ethers.parseEther(amountIn.toString());
        const path = [_config.nativeWrapped, outToken.address];
        const amounts = await router.getAmountsOut(amountInWei, path);
        const amountOutMin = (amounts[1] * slippageBps) / BigInt(10000);

        tx = await router.swapExactAVAXForTokens(
          amountOutMin,
          path,
          context.walletAddress,
          deadline,
          { value: amountInWei },
        );

      // ERC-20 -> ERC-20.
      } else {
        const inToken = _config.tokens[tokenIn];
        if (!inToken) throw new Error(`Unknown token in: ${tokenIn}`);

        const amountInWei = ethers.parseUnits(
          amountIn.toString(),
          inToken.decimals,
        );
        const path = [inToken.address, outToken.address];
        const amounts = await router.getAmountsOut(amountInWei, path);
        const amountOutMin = (amounts[1] * slippageBps) / BigInt(10000);

        const tokenContract = new ethers.Contract(
          inToken.address,
          ERC20_ABI,
          signer,
        );
        const allowance = await tokenContract.allowance(
          context.walletAddress,
          routerAddress,
        );
        if (allowance < amountInWei) {
          context.addLog(`[Swap] Approving ${tokenIn}...`);
          const approveTx = await tokenContract.approve(
            routerAddress,
            ethers.MaxUint256,
          );
          await approveTx.wait();
          context.addLog("[Swap] Approved");
        }

        tx = await router.swapExactTokensForTokens(
          amountInWei,
          amountOutMin,
          path,
          context.walletAddress,
          deadline,
        );
      }
    }

    context.addLog(`[Swap] Tx submitted: ${tx.hash}`);
    await tx.wait();
    context.addLog(`[Swap] Confirmed!`);

    if (
      context.activationId &&
      context.strategyVersionId &&
      context.walletAddress &&
      typeof fetch !== "undefined"
    ) {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "x-wallet-address": normalizeWalletAddress(context.walletAddress),
        };
        void fetch("/api/receipts", {
          method: "POST",
          headers,
          body: JSON.stringify({
            activation_id: context.activationId,
            strategy_version_id: context.strategyVersionId,
            mode: "live",
            asset_pair: `${tokenIn}/${tokenOut}`,
            signal: { type: "swap", tokenIn, tokenOut, amountIn },
            execution_request: {
              dex,
              amountIn,
              slippage,
            },
            execution_result: { txHash: tx.hash },
            status: "confirmed",
            tx_hash: tx.hash,
          }),
        });
      } catch {
        /* non-critical */
      }
    }

    // Record in global transaction store
    try {
      useTransactionStore.getState().addTransaction({
        type: "SWAP",
        fromToken: tokenIn,
        toToken: tokenOut,
        fromAmount: amountIn,
        toAmount: 0, // exact output not easily available from tx
        txHash: tx.hash,
        walletAddress: context.walletAddress,
        timestamp: Date.now(),
        source: "agent-builder",
        dex: dex,
      });
    } catch {
      /* non-critical */
    }

    return { txHash: tx.hash };
  }
}
