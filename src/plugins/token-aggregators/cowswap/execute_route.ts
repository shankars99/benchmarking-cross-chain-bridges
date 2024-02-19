import { ethers } from "ethers";
import {
    domain,
    Order,
    SigningScheme,
    signOrder,
} from "@gnosis.pm/gp-v2-contracts"

import { get_signer } from "@aggregator-utils/provider";
import { approveAllow } from "@aggregator-utils/token_misc";
import { CHAIN_ID_MAP } from "@aggregator-utils/constants_global";
import { validate_keys } from "@aggregator-utils/inp_validator";
import { COWOrderRequest, COWCreateOrder, COWSignOrder } from './types';

/**
 * Signs an order.
 * @param chainId The chain ID of the source chain.
 * @param order The order to sign.
 * @returns The signed order.
 */
export async function sign_order(chainId: number, order: Order): Promise<COWSignOrder> {
    const chain = CHAIN_ID_MAP[chainId];
    const [trader] = [get_signer(chain)];

    // domain(chainId, '0x9008D19f58AAbD9eD0D60971565AA8510560ab41') is the domain separator for the COW protocol. We get this from their website.
    const raw_signature = await signOrder(
        domain(chainId, '0x9008D19f58AAbD9eD0D60971565AA8510560ab41'),
        order,
        trader,
        SigningScheme.ETHSIGN
    );
    // Needed to turn the three part object into a single bytestring
    const signature = ethers.utils.joinSignature(raw_signature.data);
    return {
        signingScheme: "ethsign",
        signature: signature,
        publicKey: validate_keys().public
    }
}

/**
 * Submits an order to the COW protocol.
 * @param fromChain The source chain ID.
 * @param toChain The destination chain ID.
 * @param fromToken The token to sell.
 * @param orderRequest The order request.
 * @param order The signed order.
 * @returns The response from the COW protocol.
 */
export async function submit_order(fromChain: number, toChain: number, fromToken: string, orderRequest: COWOrderRequest, order: Order) {
    const sign_order_resp = await sign_order(fromChain, order);

    const createOrder: COWCreateOrder = {
        sellToken: orderRequest.sellToken,
        buyToken: orderRequest.buyToken,
        sellAmount: order.sellAmount,
        buyAmount: order.buyAmount,
        receiver: orderRequest.receiver,
        validTo: orderRequest.validTo,
        appData: orderRequest.appData,
        feeAmount: order.feeAmount,
        kind: order.kind,
        partiallyFillable: order.partiallyFillable,
        sellTokenBalance: orderRequest.sellTokenBalance,
        buyTokenBalance: orderRequest.buyTokenBalance,
        signingScheme: sign_order_resp.signingScheme,
        signature: sign_order_resp.signature,
        from: sign_order_resp.publicKey
    };

    const chain_name = CHAIN_ID_MAP[fromChain];

    await approveAllow(
        chain_name,
        fromToken,
        '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110',
    );

    const url = `https://api.cow.fi/${chain_name.toLowerCase()}/api/v1/orders`;

    const requestOptions: RequestInit = {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(createOrder)
    };

    const response = await fetch(url, requestOptions);

    const resp_data = await response.json();

    return resp_data;
}