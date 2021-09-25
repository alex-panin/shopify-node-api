import ShopifyOAuth from 'src/auth/oauth';

import * as ShopifyErrors from '../error';
import {Session} from '../auth/session';
import {GraphqlClient} from '../clients/graphql';
import {RestClient} from '../clients/rest';

import {WithSessionParams, WithSessionResponse} from './types';
import loadOfflineSession from './load-offline-session';
import loadCurrentSession from './load-current-session';

export default async function withSession({
  clientType,
  isOnline,
  req,
  res,
  shop,
  oAuth,
  sessionId,
}: WithSessionParams & {
  oAuth: ShopifyOAuth;
  sessionId: string;
}): Promise<WithSessionResponse> {
  oAuth.context.throwIfUninitialized();

  let session: Session | undefined;
  if (isOnline) {
    if (!req || !res) {
      throw new ShopifyErrors.MissingRequiredArgument(
        'Please pass in both the "request" and "response" objects.',
      );
    }

    session = await loadCurrentSession(req, res, undefined, oAuth, sessionId);
  } else {
    if (!shop) {
      throw new ShopifyErrors.MissingRequiredArgument(
        'Please pass in a value for "shop"',
      );
    }

    session = await loadOfflineSession(shop, undefined, oAuth, sessionId);
  }

  if (!session) {
    throw new ShopifyErrors.SessionNotFound('No session found.');
  } else if (!session.accessToken) {
    throw new ShopifyErrors.InvalidSession(
      'Requested session does not contain an accessToken.',
    );
  }

  let client: RestClient | GraphqlClient;
  switch (clientType) {
    case 'rest':
      client = new RestClient(session.shop, oAuth.context, session.accessToken);
      return {
        client,
        session,
      };
    case 'graphql':
      client = new GraphqlClient(
        session.shop,
        oAuth.context,
        session.accessToken,
      );
      return {
        client,
        session,
      };
    default:
      throw new ShopifyErrors.UnsupportedClientType(
        `"${clientType}" is an unsupported clientType. Please use "rest" or "graphql".`,
      );
  }
}
