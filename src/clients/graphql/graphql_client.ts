import {MissingRequiredArgument} from '../../error';
import type {Context} from '../../context';
import {ShopifyHeader} from '../../base_types';
import {HttpClient} from '../http_client/http_client';
import {DataType, RequestReturn} from '../http_client/types';
import * as ShopifyErrors from '../../error';

import {GraphqlParams} from './types';

export interface AccessTokenHeader {
  header: string;
  value: string;
}

export class GraphqlClient {
  public readonly client: HttpClient;
  protected baseApiPath = '/admin/api';

  constructor(
    readonly domain: string,
    public context: Context,
    readonly accessToken?: string,
  ) {
    if (!this.context.IS_PRIVATE_APP && !accessToken) {
      throw new ShopifyErrors.MissingRequiredArgument(
        'Missing access token when creating GraphQL client',
      );
    }

    this.client = new HttpClient(this.domain, this.context);
  }

  async query(params: GraphqlParams): Promise<RequestReturn> {
    if (params.data.length === 0) {
      throw new MissingRequiredArgument('Query missing.');
    }

    const accessTokenHeader = this.getAccessTokenHeader();
    params.extraHeaders = {
      [accessTokenHeader.header]: accessTokenHeader.value,
      ...params.extraHeaders,
    };

    const path = `${this.baseApiPath}/${this.context.API_VERSION}/graphql.json`;

    let dataType: DataType.GraphQL | DataType.JSON;

    if (typeof params.data === 'object') {
      dataType = DataType.JSON;
    } else {
      dataType = DataType.GraphQL;
    }

    return this.client.post({path, type: dataType, ...params});
  }

  protected getAccessTokenHeader(): AccessTokenHeader {
    return {
      header: ShopifyHeader.AccessToken,
      value: this.context.IS_PRIVATE_APP
        ? this.context.API_SECRET_KEY
        : (this.accessToken as string),
    };
  }
}
