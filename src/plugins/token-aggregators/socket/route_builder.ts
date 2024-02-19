import dotenv from 'dotenv';
dotenv.config();

import { validate_api_key, validate_chain, validate_tokens, validate_keys } from '@aggregator-utils/inp_validator'
import { TOKEN_MAP } from './constants_local'

import { Socket, Path, SocketQuote } from "@socket.tech/socket-v2-sdk";

/**
 * Builds a route for a swap transaction.
 * @param from_chain_id The source chain ID.
 * @param to_chain_id The destination chain ID.
 * @param from_token The token to sell.
 * @param to_token The token to buy.
 * @param amount The amount to sell.
 * @param multiTx Whether to use a single or multi transaction.
 * @returns The Socket route.
 */
export async function build_route(from_chain_id: number, to_chain_id: number, from_token: string, to_token: string, amount: string, multiTx: boolean): Promise<SocketQuote> {

    const SOCKET_API_KEY = validate_api_key('SOCKET');
    validate_chain('SOCKET', from_chain_id, to_chain_id);
    validate_tokens(from_token, to_token, from_chain_id === to_chain_id);
    const user_address = validate_keys().public;

    const from_token_address = TOKEN_MAP[from_chain_id][from_token];
    const to_token_address = TOKEN_MAP[to_chain_id][to_token];

    const socket = new Socket({
        apiKey: SOCKET_API_KEY,
        defaultQuotePreferences: {
            singleTxOnly: !multiTx,
        },
    });

    const tokenList = await socket.getTokenList({
        fromChainId: from_chain_id,
        toChainId: to_chain_id,
    });

    const fromToken = tokenList.from.tokenByAddress(from_token_address);
    const toToken = tokenList.to.tokenByAddress(to_token_address);

    const path = new Path({ fromToken, toToken });

    const quote: SocketQuote = await socket.getBestQuote(
        {
            path: path,
            amount,
            address: user_address,
        },
        {
            bridgeWithGas: false,
            singleTxOnly: !multiTx
        }
    );

    if (!quote) {
        throw new Error("no quote available");
    }

    return quote;
}