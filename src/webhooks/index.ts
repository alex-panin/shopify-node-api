import {WebhooksRegistry} from './registry';

class ShopifyWebhooks {
  public Registry: WebhooksRegistry;
  constructor() {
    this.Registry = new WebhooksRegistry();
  }
}

export default ShopifyWebhooks;
export {ShopifyWebhooks};
