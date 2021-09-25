import type {Context} from 'src/context';

import {WebhooksRegistry} from './registry';

class ShopifyWebhooks {
  public Registry: WebhooksRegistry;
  constructor(context: Context) {
    this.Registry = new WebhooksRegistry(context);
  }
}

export default ShopifyWebhooks;
export {ShopifyWebhooks};
