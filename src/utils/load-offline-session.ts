import type {Session} from '../auth/session/session';
import {ShopifyOAuth} from '../auth/oauth';

/**
 * Helper method for quickly loading offline sessions by shop url.
 * By default, returns undefined if there is no session, or the session found is expired.
 * Optionally, pass a second argument for 'includeExpired' set to true to return expired sessions.
 *
 * @param shop the shop url to find the offline session for
 * @param includeExpired optionally include expired sessions, defaults to false
 */
export default async function loadOfflineSession(
  shop: string,
  includeExpired = false,
  oAuth: ShopifyOAuth,
  sessionId: string,
): Promise<Session | undefined> {
  oAuth.context.throwIfUninitialized();
  // const sessionId = oAuth.getOfflineSessionId(shop);
  const session = await oAuth.context.SESSION_STORAGE.loadSession(sessionId);
  const now = new Date();

  if (
    session &&
    !includeExpired &&
    session.expires &&
    session.expires.getTime() < now.getTime()
  ) {
    return undefined;
  }

  return session;
}
