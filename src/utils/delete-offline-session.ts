import {ShopifyOAuth} from '../auth/oauth';

/**
 * Helper method to find and delete offline sessions by shop url.
 *
 * @param shop the shop url to find and delete a session for
 */
export default async function deleteOfflineSession(
  shop: string,
  oAuth: ShopifyOAuth,
  sessionId: string,
): Promise<boolean> {
  oAuth.context.throwIfUninitialized();

  // const sessionId = oAuth.getOfflineSessionId(shop);

  return oAuth.context.SESSION_STORAGE.deleteSession(sessionId);
}
