import { Context } from './context';
import * as ShopifyErrors from './error';
import ShopifySession from './auth/session';
import ShopifyClients from './clients';
import ShopifyUtils from './utils';
import ShopifyWebhooks from './webhooks';
import { ShopifyOAuth } from './auth/oauth/oauth';
declare class Shopify {
    Context: Context;
    Auth: ShopifyOAuth;
    Webhooks: ShopifyWebhooks;
    Clients: typeof ShopifyClients;
    Session: typeof ShopifySession;
    Utils: typeof ShopifyUtils;
    Errors: typeof ShopifyErrors;
    constructor();
}
export default Shopify;
export * from './types';
//# sourceMappingURL=index.d.ts.map