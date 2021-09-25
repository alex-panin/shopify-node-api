import {ShopifyHeader} from '../../base_types';

import {GraphqlClient, AccessTokenHeader} from './graphql_client';

export class StorefrontClient extends GraphqlClient {
  protected baseApiPath = '/api';

  protected getAccessTokenHeader(): AccessTokenHeader {
    return {
      header: ShopifyHeader.StorefrontAccessToken,
      value: (this.context.IS_PRIVATE_APP
        ? this.context.PRIVATE_APP_STOREFRONT_ACCESS_TOKEN || this.accessToken
        : this.accessToken) as string,
    };
  }
}
