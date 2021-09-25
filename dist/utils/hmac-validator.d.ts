import { AuthQuery } from '../auth/oauth/types';
import type { Context } from '../context';
export declare function stringifyQuery(query: AuthQuery): string;
export declare function generateLocalHmac({ code, timestamp, state, shop, host }: AuthQuery, context: Context): string;
/**
 * Uses the received query to validate the contained hmac value against the rest of the query content.
 *
 * @param query HTTP Request Query, containing the information to be validated.
 */
export default function validateHmac(query: AuthQuery, context: Context): boolean;
//# sourceMappingURL=hmac-validator.d.ts.map