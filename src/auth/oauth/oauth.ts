import http from 'http';
import querystring from 'querystring';

import {v4 as uuidv4} from 'uuid';
import Cookies from 'cookies';

import {Context} from '../../context';
import nonce from '../../utils/nonce';
import validateHmac from '../../utils/hmac-validator';
import validateShop from '../../utils/shop-validator';
import safeCompare from '../../utils/safe-compare';
import decodeSessionToken from '../../utils/decode-session-token';
import {Session} from '../session';
import {HttpClient} from '../../clients/http_client/http_client';
import {DataType} from '../../clients/http_client/types';
import * as ShopifyErrors from '../../error';

import {
  AuthQuery,
  AccessTokenResponse,
  OnlineAccessResponse,
  OnlineAccessInfo,
} from './types';

/**
 * Uses the validation utils validateHmac, validateShop, and safeCompare to assess whether the callback is valid.
 *
 * @param query Current HTTP Request Query
 * @param session Current session
 */
function validQuery(query: AuthQuery, session: Session): boolean {
  return (
    validateHmac(query, session.context) &&
    validateShop(query.shop) &&
    safeCompare(query.state, session.state as string)
  );
}

class ShopifyOAuth {
  public SESSION_COOKIE_NAME = 'shopify_app_session';
  constructor(public context: Context) {}

  /**
   * Initializes a session and cookie for the OAuth process, and returns the necessary authorization url.
   *
   * @param request Current HTTP Request
   * @param response Current HTTP Response
   * @param shop Shop url: {shop}.myshopify.com
   * @param redirect Redirect url for callback
   * @param isOnline Boolean value. If true, appends 'per-user' grant options to authorization url to receive online access token.
   *                 During final oauth request, will receive back the online access token and current online session information.
   *                 Defaults to offline access.
   */
  public async beginAuth(
    request: http.IncomingMessage,
    response: http.ServerResponse,
    shop: string,
    redirectPath: string,
    isOnline = false,
    sessionId: string,
  ): Promise<string> {
    this.context.throwIfUninitialized();
    this.context.throwIfPrivateApp('Cannot perform OAuth for private apps');

    const cookies = new Cookies(request, response, {
      keys: [this.context.API_SECRET_KEY],
      secure: true,
    });

    const state = nonce();

    const session = new Session(isOnline ? uuidv4() : sessionId, this.context);
    session.shop = shop;
    session.state = state;
    session.isOnline = isOnline;

    const sessionStored = await this.context.SESSION_STORAGE.storeSession(
      session,
    );

    if (!sessionStored) {
      throw new ShopifyErrors.SessionStorageError(
        'OAuth Session could not be saved. Please check your session storage functionality.',
      );
    }

    cookies.set(this.SESSION_COOKIE_NAME, session.id, {
      signed: true,
      expires: new Date(Date.now() + 60000),
      sameSite: 'lax',
      secure: true,
    });

    /* eslint-disable @typescript-eslint/naming-convention */
    const query = {
      client_id: this.context.API_KEY,
      scope: this.context.SCOPES.toString(),
      redirect_uri: `https://${this.context.HOST_NAME}${redirectPath}`,
      state,
      'grant_options[]': isOnline ? 'per-user' : '',
    };
    /* eslint-enable @typescript-eslint/naming-convention */

    const queryString = querystring.stringify(query);

    return `https://${shop}/admin/oauth/authorize?${queryString}`;
  }

  /**
   * Validates the received callback query.
   * If valid, will make the subsequent request to update the current session with the appropriate access token.
   * Throws errors for missing sessions and invalid callbacks.
   *
   * @param request Current HTTP Request
   * @param response Current HTTP Response
   * @param query Current HTTP Request Query, containing the information to be validated.
   *              Depending on framework, this may need to be cast as "unknown" before being passed.
   */
  async validateAuthCallback(
    request: http.IncomingMessage,
    response: http.ServerResponse,
    query: AuthQuery,
  ): Promise<void> {
    this.context.throwIfUninitialized();
    this.context.throwIfPrivateApp('Cannot perform OAuth for private apps');

    const cookies = new Cookies(request, response, {
      keys: [this.context.API_SECRET_KEY],
      secure: true,
    });

    const sessionCookie = this.getCookieSessionId(request, response);
    if (!sessionCookie) {
      throw new ShopifyErrors.CookieNotFound(
        `Cannot complete OAuth process. Could not find an OAuth cookie for shop url: ${query.shop}`,
      );
    }

    const currentSession = await this.context.SESSION_STORAGE.loadSession(
      sessionCookie,
    );

    if (!currentSession) {
      throw new ShopifyErrors.SessionNotFound(
        `Cannot complete OAuth process. No session found for the specified shop url: ${query.shop}`,
      );
    }

    if (!validQuery(query, currentSession)) {
      throw new ShopifyErrors.InvalidOAuthError('Invalid OAuth callback.');
    }

    /* eslint-disable @typescript-eslint/naming-convention */
    const body = {
      client_id: this.context.API_KEY,
      client_secret: this.context.API_SECRET_KEY,
      code: query.code,
    };
    /* eslint-enable @typescript-eslint/naming-convention */

    const postParams = {
      path: '/admin/oauth/access_token',
      type: DataType.JSON,
      data: body,
    };

    const client = new HttpClient(currentSession.shop, this.context);

    const postResponse = await client.post(postParams);

    if (currentSession.isOnline) {
      const responseBody = postResponse.body as OnlineAccessResponse;
      const {access_token, scope, ...rest} = responseBody; // eslint-disable-line @typescript-eslint/naming-convention
      const sessionExpiration = new Date(
        Date.now() + responseBody.expires_in * 1000,
      );

      currentSession.accessToken = access_token;
      currentSession.expires = sessionExpiration;
      currentSession.scope = scope;
      currentSession.onlineAccessInfo = rest;
    } else {
      const responseBody = postResponse.body as AccessTokenResponse;
      currentSession.accessToken = responseBody.access_token;
      currentSession.scope = responseBody.scope;
    }

    // If this is an offline session, we're no longer interested in the cookie. If it is online in an embedded app, we
    // want the cookie session to expire a few seconds from now to give the app time to load itself to set up a JWT.
    // Otherwise, we want to leave the cookie session alone until the actual expiration.
    let oauthSessionExpiration = currentSession.expires;
    if (!currentSession.isOnline) {
      oauthSessionExpiration = new Date();
    } else if (this.context.IS_EMBEDDED_APP) {
      // If this is an online session for an embedded app, prepare a JWT session to be used going forward
      const onlineInfo = currentSession.onlineAccessInfo as OnlineAccessInfo;
      const jwtSessionId = this.getJwtSessionId(
        currentSession.shop,
        `${onlineInfo.associated_user.id}`,
      );

      const jwtSession = Session.cloneSession(
        currentSession,
        jwtSessionId,
        this.context,
      );

      await this.context.SESSION_STORAGE.storeSession(jwtSession);

      // Make sure the current OAuth session expires along with the cookie
      oauthSessionExpiration = new Date(Date.now() + 30000);
      currentSession.expires = oauthSessionExpiration;
    }

    cookies.set(this.SESSION_COOKIE_NAME, currentSession.id, {
      signed: true,
      expires: oauthSessionExpiration,
      sameSite: 'lax',
      secure: true,
    });

    const sessionStored = await this.context.SESSION_STORAGE.storeSession(
      currentSession,
    );

    if (!sessionStored) {
      throw new ShopifyErrors.SessionStorageError(
        'OAuth Session could not be saved. Please check your session storage functionality.',
      );
    }
  }

  /**
   * Loads the current session id from the session cookie.
   *
   * @param request HTTP request object
   * @param response HTTP response object
   */
  public getCookieSessionId(
    request: http.IncomingMessage,
    response: http.ServerResponse,
  ): string | undefined {
    const cookies = new Cookies(request, response, {
      secure: true,
      keys: [this.context.API_SECRET_KEY],
    });
    return cookies.get(this.SESSION_COOKIE_NAME, {signed: true});
  }

  /**
   * Builds a JWT session id from the current shop and user.
   *
   * @param shop Shopify shop domain
   * @param userId Current actor id
   */
  getJwtSessionId(shop: string, userId: string): string {
    return `${shop}_${userId}`;
  }

  /**
   * Builds an offline session id for the given shop.
   *
   * @param shop Shopify shop domain
   */
  getOfflineSessionId(shop: string): string {
    return `offline_${shop}`;
  }

  /**
   * Extracts the current session id from the request / response pair.
   *
   * @param request  HTTP request object
   * @param response HTTP response object
   * @param isOnline Whether to load online (default) or offline sessions (optional)
   */
  getCurrentSessionId(
    request: http.IncomingMessage,
    response: http.ServerResponse,
    isOnline = true,
  ): string | undefined {
    let currentSessionId: string | undefined;

    if (this.context.IS_EMBEDDED_APP) {
      const authHeader = request.headers.authorization;
      if (authHeader) {
        const matches = authHeader.match(/^Bearer (.+)$/);
        if (!matches) {
          throw new ShopifyErrors.MissingJwtTokenError(
            'Missing Bearer token in authorization header',
          );
        }

        const jwtPayload = decodeSessionToken(matches[1], this.context);
        const shop = jwtPayload.dest.replace(/^https:\/\//, '');
        if (isOnline) {
          currentSessionId = this.getJwtSessionId(shop, jwtPayload.sub);
        } else {
          currentSessionId = this.getOfflineSessionId(shop);
        }
      }
    }

    // Non-embedded apps will always load sessions using cookies. However, we fall back to the cookie session for
    // embedded apps to allow apps to load their skeleton page after OAuth, so they can set up App Bridge and get a new
    // JWT.
    if (!currentSessionId) {
      // We still want to get the offline session id from the cookie to make sure it's validated
      currentSessionId = this.getCookieSessionId(request, response);
    }

    return currentSessionId;
  }
}

export {ShopifyOAuth};
