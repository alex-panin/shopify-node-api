import jwt from 'jsonwebtoken';

import type {Context} from '../context';
import * as ShopifyErrors from '../error';

import validateShop from './shop-validator';

interface JwtPayload {
  iss: string;
  dest: string;
  aud: string;
  sub: string;
  exp: number;
  nbf: number;
  iat: number;
  jti: string;
  sid: string;
}

/**
 * Decodes the given session token, and extracts the session information from it
 *
 * @param token Received session token
 */
function decodeSessionToken(token: string, context: Context): JwtPayload {
  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, context.API_SECRET_KEY, {
      algorithms: ['HS256'],
    }) as JwtPayload;
  } catch (error) {
    throw new ShopifyErrors.InvalidJwtError(
      `Failed to parse session token '${token}': ${error.message}`,
    );
  }

  // The exp and nbf fields are validated by the JWT library

  if (payload.aud !== context.API_KEY) {
    throw new ShopifyErrors.InvalidJwtError(
      'Session token had invalid API key',
    );
  }

  if (!validateShop(payload.dest.replace(/^https:\/\//, ''))) {
    throw new ShopifyErrors.InvalidJwtError('Session token had invalid shop');
  }

  return payload;
}

export default decodeSessionToken;

export {decodeSessionToken, JwtPayload};
