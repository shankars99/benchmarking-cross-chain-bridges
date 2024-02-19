import dotenv from 'dotenv';
dotenv.config();

import { SUPPORTED_CHAINS, SUPPORTED_TOKENS, CHAIN_ID_MAP, CHAIN, CHAIN_MAP, KEY_PAIR } from './constants_global';

let { KEY_PUBLIC, KEY_PRIVATE, SOCKET_API_KEY } = process.env;

/**
 * Validates the chain IDs for a given protocol.
 *
 * @param protocol_name - The name of the protocol.
 * @param source_chain_id - The ID of the source chain.
 * @param to_chain_id - The ID of the target chain (optional, defaults to source_chain_id).
 * @param tx_chain_id - The ID of the transaction chain (optional, defaults to -1).
 * @returns An array containing the source chain and target chain.
 * @throws Error if the chain IDs are invalid.
 */
export function validate_chain(protocol_name: string, source_chain_id: number, to_chain_id: number = source_chain_id, tx_chain_id: number = -1): CHAIN[] {
    if (!SUPPORTED_CHAINS[protocol_name].includes(CHAIN_ID_MAP[source_chain_id])) {
        throw new Error(`Invalid chain_id: ${source_chain_id} for protocol: ${protocol_name}`);
    } else if (!SUPPORTED_CHAINS[protocol_name].includes(CHAIN_ID_MAP[to_chain_id])) {
        throw new Error(`Invalid chain_id: ${to_chain_id} for protocol: ${protocol_name}`);
    }

    if (tx_chain_id !== source_chain_id && tx_chain_id !== to_chain_id && tx_chain_id !== -1) {
        throw new Error(`Invalid tx_chain_id: ${tx_chain_id}`);
    }

    return [CHAIN_MAP[source_chain_id], CHAIN_MAP[to_chain_id]];
}

/**
 * Validates the tokens for a given protocol.
 *
 * @param from_token - The token to swap from.
 * @param to_token - The token to swap to.
 * @param same_chain - Whether the swap is on the same chain.
 * @returns Boolean indicating whether the tokens are valid.
 * @throws Error if the tokens are invalid.
 */

export function validate_tokens(from_token: string, to_token: string, same_chain: boolean): boolean {
    if (!SUPPORTED_TOKENS.includes(from_token)) {
        throw new Error(`Invalid from_token: ${from_token}`);
    } else if (!SUPPORTED_TOKENS.includes(to_token)) {
        throw new Error(`Invalid to_token: ${to_token}`);
    } else if (from_token === to_token && same_chain) {
        // checks if function call expects same chain swap or not
        throw new Error(`from_token and to_token cannot be the same on same chain swap`);
    }

    return true;
}

/**
 * Validates the key pair.
 *
 * @returns The key pair.
 * @throws Error if the key pair is invalid.
 */
export function validate_keys(): KEY_PAIR {
    if (!KEY_PUBLIC) {
        throw new Error('Missing public key');
    }

    if (!KEY_PRIVATE) {
        throw new Error('Missing private key');
    }

    return { public: KEY_PUBLIC, private: KEY_PRIVATE };
}

/**
 * Validates the amount.
 *
 * @param amount - The amount to swap.
 * @returns The amount.
 * @throws Error if the amount is invalid.
 */
export function validate_amount(amount: string): string {
    if (parseInt(amount) > 0) {
        throw new Error('Amount need to be greater than 0')
    };

    return amount;
}

/**
 * Validates the API key.
 *
 * @param protocol_name - The name of the protocol.
 * @returns The API key.
 * @throws Error if the API key is invalid.
 */
export function validate_api_key(protocol_name: string): string {
    let api_key = '';
    switch (protocol_name) {
        case 'SOCKET':
            if (!SOCKET_API_KEY) {
                throw new Error('Missing Socket API Key. Get it from the Socket Docs.');
            } else {
                api_key = SOCKET_API_KEY;
            }
            break;
        default:
            throw new Error(`Invalid protocol name: ${protocol_name}`);
    }

    return api_key;
}

/**
 * Validates the RPC URL.
 *
 * @param network - The name of the network.
 * @returns The RPC URL.
 * @throws Error if the RPC URL is invalid.
 */
export function validate_rpc_url(network: string): string {
    if (!network) {
        throw new Error('Missing network');
    }

    const rpc_url: string | undefined = process.env['RPC_' + network.toUpperCase()];

    if (!rpc_url) {
        throw new Error(`RPC URL not found for ${network}`);
    }

    return rpc_url;
}
