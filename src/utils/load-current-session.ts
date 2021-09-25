import http from 'http';

import {ShopifyOAuth} from '../auth/oauth/oauth';
import {Session} from '../auth/session';

/**
 * Loads the current user's session, based on the given request and response.
 *
 * @param request  Current HTTP request
 * @param response Current HTTP response
 * @param isOnline Whether to load online (default) or offline sessions (optional)
 */
export default async function loadCurrentSession(
  request: http.IncomingMessage,
  response: http.ServerResponse,
  isOnline = true,
  oAuth: ShopifyOAuth,
  sessionId: string,
): Promise<Session | undefined> {
  oAuth.context.throwIfUninitialized();

  // const sessionId = oAuth.getCurrentSessionId(request, response, isOnline);
  if (!sessionId) {
    return Promise.resolve(undefined);
  }
  const session = await oAuth.context.SESSION_STORAGE.loadSession(sessionId);
  return session;
}
