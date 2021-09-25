import ShopifyOAuth from 'src/auth/oauth';
import { WithSessionParams, WithSessionResponse } from './types';
export default function withSession({ clientType, isOnline, req, res, shop, oAuth, sessionId, }: WithSessionParams & {
    oAuth: ShopifyOAuth;
    sessionId: string;
}): Promise<WithSessionResponse>;
//# sourceMappingURL=with-session.d.ts.map