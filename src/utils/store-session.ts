import type {Context} from '../context';
import {Session} from '../auth/session';

/**
 * Stores the current user's session.
 *
 * @param Session Session object
 */
export default async function storeSession(
  session: Session,
  context: Context,
): Promise<boolean> {
  context.throwIfUninitialized();

  return context.SESSION_STORAGE.storeSession(session);
}
