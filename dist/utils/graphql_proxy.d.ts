/// <reference types="node" />
import http from 'http';
import ShopifyOAuth from 'src/auth/oauth';
export default function graphqlProxy(userReq: http.IncomingMessage, userRes: http.ServerResponse, oAuth: ShopifyOAuth, sessionId: string): Promise<void>;
//# sourceMappingURL=graphql_proxy.d.ts.map