import type { Context } from '../../context';
import { HttpClient } from '../http_client/http_client';
import { RequestReturn } from '../http_client/types';
import { GraphqlParams } from './types';
export interface AccessTokenHeader {
    header: string;
    value: string;
}
export declare class GraphqlClient {
    readonly domain: string;
    context: Context;
    readonly accessToken?: string | undefined;
    readonly client: HttpClient;
    protected baseApiPath: string;
    constructor(domain: string, context: Context, accessToken?: string | undefined);
    query(params: GraphqlParams): Promise<RequestReturn>;
    protected getAccessTokenHeader(): AccessTokenHeader;
}
//# sourceMappingURL=graphql_client.d.ts.map