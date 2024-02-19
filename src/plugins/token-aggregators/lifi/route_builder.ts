import { validate_chain, validate_tokens, validate_keys } from '@aggregator-utils/inp_validator';
import { get_lifi_url } from './constants_local';
import { LiFiTransaction } from './types';

/**
 * Builds a route for a swap transaction.
 * @param fromChain The source chain ID.
 * @param toChain The destination chain ID.
 * @param fromToken The token to sell.
 * @param toToken The token to buy.
 * @param fromAmount The amount to sell.
 * @returns The LIFI route.
 * @note Test without rate limiting at : https://apidocs.li.fi/reference/get_quote
 */
export async function build_route(fromChain: number, toChain: number, fromToken: string, toToken: string, fromAmount: string) {
    validate_chain('LIFI', fromChain, toChain);
    validate_tokens(fromToken, toToken, fromChain === toChain);

    const fromAddress = validate_keys().public;
    const lifi_url = get_lifi_url(fromChain);

    const queryParams = new URLSearchParams({
        fromChain: fromChain.toString(),
        toChain: toChain.toString(),
        fromToken: fromToken,
        toToken: toToken,
        fromAmount: fromAmount,
        fromAddress: fromAddress,
        order: 'RECOMMENDED'
    });

    const url = `${lifi_url}/quote?${queryParams.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`);
    }

    const data: LiFiTransaction = await response.json();
    return data;
}