import crypto from 'crypto';
import querystring from 'querystring';

import {AuthQuery} from '../auth/oauth/types';
import * as ShopifyErrors from '../error';
import type {Context} from '../context';

import safeCompare from './safe-compare';

export function stringifyQuery(query: AuthQuery): string {
  const orderedObj = Object.keys(query)
    .sort((val1, val2) => val1.localeCompare(val2))
    .reduce((obj: Record<string, string | undefined>, key: keyof AuthQuery) => {
      obj[key] = query[key];
      return obj;
    }, {});
  return querystring.stringify(orderedObj);
}

export function generateLocalHmac(
  {code, timestamp, state, shop, host}: AuthQuery,
  context: Context,
): string {
  const queryString = stringifyQuery({
    code,
    timestamp,
    state,
    shop,
    // eslint-disable-next-line @typescript-eslint/no-extra-parens
    ...(host && {host}),
  });
  return crypto
    .createHmac('sha256', context.API_SECRET_KEY)
    .update(queryString)
    .digest('hex');
}

/**
 * Uses the received query to validate the contained hmac value against the rest of the query content.
 *
 * @param query HTTP Request Query, containing the information to be validated.
 */
export default function validateHmac(
  query: AuthQuery,
  context: Context,
): boolean {
  if (!query.hmac) {
    throw new ShopifyErrors.InvalidHmacError(
      'Query does not contain an HMAC value.',
    );
  }
  const {hmac} = query;
  const localHmac = generateLocalHmac(query, context);

  return safeCompare(hmac as string, localHmac);
}
