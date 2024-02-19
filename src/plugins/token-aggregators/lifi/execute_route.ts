import axios from "axios";

import { get_signer } from "@aggregator-utils/provider";
import { approveAllow } from "@aggregator-utils/token_misc";
import { CHAIN_ID_MAP } from "@aggregator-utils/constants_global";
import { get_lifi_url } from "./constants_local";
import { TransactionRequest } from "./types";

/**
 * Checks the status of a transaction.
 * @param bridge Bridge name
 * @param fromChain The source chain ID.
 * @param toChain The destination chain ID.
 * @param txHash The transaction hash.
 * @returns The status of the transaction.
 */
const getStatus = async (bridge: string, fromChain: number, toChain: number, txHash: string) => {
    const lifi_url = get_lifi_url(fromChain);

    const result = await axios.get(`${lifi_url}/status`, {
        params: {
            bridge,
            fromChain,
            toChain,
            txHash,
        }
    });
    return result.data;
}

/**
 * Submits a swap transaction
 * @param fromChain The source chain ID.
 * @param toChain The destination chain ID.
 * @param fromToken The token to sell.
 * @param quote The quote from the LIFI protocol.
 * @returns The transaction hash.
 * @note NO LOW BALANCE CHECKS ON THE LIFI SMART CONTRACT
 */
export async function submit_order(fromChain: number, toChain: number, fromToken: string, quote: any) {

    const chain_name = CHAIN_ID_MAP[fromChain];
    const signer = get_signer(chain_name);

    const spenderAddress = quote.estimate.approvalAddress;
    const transactionRequest: TransactionRequest = quote.transactionRequest;
    const bridge = quote.tool;

    await approveAllow(
        chain_name,
        fromToken,
        spenderAddress,
    );

    const tx = await signer.sendTransaction(transactionRequest);

    await tx.wait();

    // Only needed for cross chain transfers
    if (fromChain !== toChain) {
        let result;
        do {
            result = await getStatus(bridge, fromChain, toChain, tx.hash);
        } while (result.status !== 'DONE' && result.status !== 'FAILED')
    }

    return tx.hash;
}