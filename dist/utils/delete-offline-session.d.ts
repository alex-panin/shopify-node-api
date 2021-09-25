import { ShopifyOAuth } from '../auth/oauth';
/**
 * Helper method to find and delete offline sessions by shop url.
 *
 * @param shop the shop url to find and delete a session for
 */
export default function deleteOfflineSession(shop: string, oAuth: ShopifyOAuth, sessionId: string): Promise<boolean>;
//# sourceMappingURL=delete-offline-session.d.ts.map