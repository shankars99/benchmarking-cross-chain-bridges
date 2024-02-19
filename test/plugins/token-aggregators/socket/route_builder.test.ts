import { expect } from 'chai';
import fs from 'fs';

import { build_route } from '@benchmarking-bridge-aggregators/plugins/token-aggregators/socket/route_builder';
import { SocketQuote } from '@socket.tech/socket-v2-sdk';

const amount = (1 * 10 ** 18).toString();
const multiTx = true;
describe('Socket:Router', () => {
    describe('build_route', () => {
        it('should return a route for a ETHEREUM WETH to MATIC WMATIC multi swap route', (done) => {
            const fromChain = 1;
            const toChain = 137;
            const fromToken = 'WETH';
            const toToken = 'WMATIC';

            build_route(fromChain, toChain, fromToken, toToken, amount, multiTx).then((route: SocketQuote) => {
                expect(route.route.routeId).to.not.equal(undefined);
                fs.writeFileSync('run-data/token-routes/socket-route-cross-chain-multiTx.json', JSON.stringify(route));
                done();
            }
            ).catch((error) => {
                done(error);
            });
        });

        it('should return a route for a ETHEREUM WETH to USDC multi swap route', (done) => {
            const fromChain = 1;
            const toChain = 1;
            const fromToken = 'WETH';
            const toToken = 'USDC';

            build_route(fromChain, toChain, fromToken, toToken, amount, multiTx).then((route: SocketQuote) => {
                expect(route.route.routeId).to.not.equal(undefined);
                fs.writeFileSync('run-data/token-routes/socket-route-same-chain-multiTx.json', JSON.stringify(route));
                done();
            }
            ).catch((error) => {
                done(error);
            });
        });

        it('should return a route for a ETHEREUM WETH to USDC single swap route', (done) => {
            const fromChain = 1;
            const toChain = 1;
            const fromToken = 'WETH';
            const toToken = 'USDC';

            build_route(fromChain, toChain, fromToken, toToken, amount, !multiTx).then((route: SocketQuote) => {
                expect(route.route.routeId).to.not.equal(undefined);
                fs.writeFileSync('run-data/token-routes/socket-route-same-chain-singleTx.json', JSON.stringify(route));
                done();
            }
            ).catch((error) => {
                done(error);
            });
        });

        it('should fail to return a route for a ETHEREUM DOGECOIN to USDC swap route', (done) => {
            const fromChain = 1;
            const toChain = 137;
            const fromToken = 'DOGECOIN';
            const toToken = 'USDC';

            build_route(fromChain, toChain, fromToken, toToken, amount, multiTx).then((route) => {
                expect(route.route.routeId).to.not.equal(undefined);
                done();
            }
            ).catch((error) => {
                expect(error.message).to.equal('Invalid from_token: DOGECOIN');
                done();
            });
        });

        it('should fail a GOERLI WETH to USDC swap route', (done) => {
            const fromChain = 5;
            const toChain = 5;
            const fromToken = 'WETH';
            const toToken = 'USDC';

            build_route(fromChain, toChain, fromToken, toToken, amount, multiTx).then((route) => {
                expect(route.route.routeId).to.not.equal(undefined);
                done();
            }
            ).catch((error) => {
                expect(error.message).to.equal('Invalid chain_id: 5 for protocol: SOCKET');
                done();
            });
        });
    });
});