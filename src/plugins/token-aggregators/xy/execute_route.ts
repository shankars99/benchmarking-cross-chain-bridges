import { get_signer } from "@aggregator-utils/provider";
import { CHAIN_ID_MAP } from "@aggregator-utils/constants_global";

import { XYRoute, XYTx } from "./types";
import { approveAllow } from "@aggregator-utils/token_misc";
import { URL_SWAP } from "./constants_local";
import { validate_keys } from "@aggregator-utils/inp_validator";

/**
 * Submits a swap transaction
 * @param sourceChain The source chain ID.
 * @param fromToken The token to sell.
 * @param quote The quote from the XY protocol.
 * @returns The transaction hash.
 */
export async function submit_order(sourceChain: number, fromToken: string, quote: XYRoute) {
    const chain_name = CHAIN_ID_MAP[sourceChain];
    const signer = get_signer(chain_name);
    const PUB_KEY = validate_keys().public;

    const xyTx: XYTx = {
        srcChainId: sourceChain,
        srcQuoteTokenAddress: quote.srcQuoteTokenAddress,
        srcQuoteTokenAmount: quote.srcQuoteTokenAmount,
        dstChainId: quote.dstChainId,
        dstQuoteTokenAddress: quote.dstQuoteTokenAddress,
        slippage: quote.slippage * 100,
        receiver: PUB_KEY,
        affiliate: "0x0000000000000000000000000000000000000000",
        commissionRate: 0,
        bridgeProvider: quote.bridgeDescription.provider,
        srcBridgeTokenAddress: quote.bridgeDescription.srcBridgeTokenAddress,
        dstBridgeTokenAddress: quote.bridgeDescription.dstBridgeTokenAddress,
        srcSwapProvider: quote.srcSwapDescription.provider,
    };

    if (quote.dstSwapDescription) {
        xyTx.dstSwapProvider = quote.dstSwapDescription.provider;
    }

    const spender_address = quote.bridgeDescription.bridgeContractAddress
    const swapTx = await createSwapTx(xyTx);

    try {
        await approveAllow(chain_name, fromToken, spender_address);

        const transactionRequest = {
            to: swapTx.tx.to,
            data: swapTx.tx.data,
            value: swapTx.tx.value,
            from: signer.address
        };

        const tx = await signer.sendTransaction(transactionRequest);
        await tx.wait();

        return tx;
    } catch (error) {
        throw error;
    }
}

/**
 * Creates a swap transaction.
 * @param xyTx The XY transaction.
 * @returns The swap transaction.
 */
async function createSwapTx(xyTx: XYTx) {
    const queryTxParams = new URLSearchParams({
        srcChainId: xyTx.srcChainId.toString(),
        srcQuoteTokenAddress: xyTx.srcQuoteTokenAddress,
        srcQuoteTokenAmount: xyTx.srcQuoteTokenAmount,
        dstChainId: xyTx.dstChainId.toString(),
        dstQuoteTokenAddress: xyTx.dstQuoteTokenAddress,
        slippage: xyTx.slippage.toString(),
        receiver: xyTx.receiver,
        affiliate: xyTx.affiliate,
        commissionRate: xyTx.commissionRate.toString(),
        bridgeProvider: xyTx.bridgeProvider,
        srcBridgeTokenAddress: xyTx.srcBridgeTokenAddress,
        dstBridgeTokenAddress: xyTx.dstBridgeTokenAddress,
        srcSwapProvider: xyTx.srcSwapProvider
    });

    if (xyTx.dstSwapProvider) {
        queryTxParams.append('dstSwapProvider', xyTx.dstSwapProvider);
    }

    const txUrl = `${URL_SWAP}${queryTxParams.toString()}`;

    const response = await fetch(txUrl);

    if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`);
    }

    const data: any = await response.json();
    return data;
}