import {Context} from './context';
import * as ShopifyErrors from './error';
import ShopifySession from './auth/session';
import ShopifyClients from './clients';
import ShopifyUtils from './utils';
import ShopifyWebhooks from './webhooks';
import {ShopifyOAuth} from './auth/oauth/oauth';

// export const Shopify = {
//   Context,
//   Auth: ShopifyAuth,
//   Session: ShopifySession,
//   Clients: ShopifyClients,
//   Utils: ShopifyUtils,
//   Webhooks: ShopifyWebhooks,
//   Errors: ShopifyErrors,
// };

class Shopify {
  public Context: Context;
  public Auth: ShopifyOAuth;
  public Webhooks: ShopifyWebhooks;
  public Clients: typeof ShopifyClients;
  public Session: typeof ShopifySession;
  public Utils: typeof ShopifyUtils;
  public Errors: typeof ShopifyErrors;

  constructor() {
    const context = new Context();

    this.Context = context;
    this.Auth = new ShopifyOAuth(context);
    this.Webhooks = new ShopifyWebhooks(context);

    this.Clients = ShopifyClients;
    this.Session = ShopifySession;
    this.Utils = ShopifyUtils;
    this.Errors = ShopifyErrors;
  }
}

export default Shopify;
export * from './types';
