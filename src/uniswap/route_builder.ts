import {
    AlphaRouter,
    SwapOptionsSwapRouter02,
    SwapRoute,
} from '@uniswap/smart-order-router'

import { TradeType, CurrencyAmount, Percent, Token, Ether } from '@uniswap/sdk-core'
import { TOKEN_MAP } from './constants_local';
import { create_router, create_swap_options } from './config';
/**
 * Builds a swap route using the AlphaRouter from the @uniswap/smart-order-router package.
 * @param chainId - The chain ID of the network.
 * @param fromToken - The symbol or address of the token to swap from.
 * @param toToken - The symbol or address of the token to swap to.
 * @param amount - The amount of the fromToken to swap.
 * @returns A Promise that resolves to a SwapRoute object.
 * @throws An error if the fromToken or toToken is invalid, or if the private or public key is missing.
 */
export async function build_route(chainId: number, fromToken: string, toToken: string, amount: string): Promise<SwapRoute> {

    // Validate the input parameters
    if (!TOKEN_MAP[chainId][fromToken] && fromToken !== 'ETH') {
        throw new Error('Invalid from_token');
    }

    if (!TOKEN_MAP[chainId][toToken] && toToken !== 'ETH') {
        throw new Error('Invalid to_token');
    }

    // Create a router for the input chain with the Alchemy provider
    // using the default configuring in config.ts
    const router: AlphaRouter = create_router(chainId);
    const options: SwapOptionsSwapRouter02 = create_swap_options();

    let from_token: Token | Ether;
    if (fromToken === 'ETH') {
        from_token = Ether.onChain(chainId);
    } else {
        from_token = TOKEN_MAP[chainId][fromToken];
    }

    let to_token: Token | Ether;
    if (toToken === 'ETH') {
        to_token = Ether.onChain(chainId);
    } else {
        to_token = TOKEN_MAP[chainId][toToken];
    }

    const route: SwapRoute = await router.route(
        CurrencyAmount.fromRawAmount(
            from_token,
            amount
        ),
        to_token,
        TradeType.EXACT_INPUT,
        options
    ).catch((error) => {
        console.log(error);
    }).then((route) => {
        if (!route) {
            throw new Error('Route not found');
        }
        return route;
    });

    return route;
};