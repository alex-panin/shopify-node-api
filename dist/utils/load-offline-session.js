"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
/**
 * Helper method for quickly loading offline sessions by shop url.
 * By default, returns undefined if there is no session, or the session found is expired.
 * Optionally, pass a second argument for 'includeExpired' set to true to return expired sessions.
 *
 * @param shop the shop url to find the offline session for
 * @param includeExpired optionally include expired sessions, defaults to false
 */
function loadOfflineSession(shop, includeExpired, oAuth, sessionId) {
    if (includeExpired === void 0) { includeExpired = false; }
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var session, now;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    oAuth.context.throwIfUninitialized();
                    return [4 /*yield*/, oAuth.context.SESSION_STORAGE.loadSession(sessionId)];
                case 1:
                    session = _a.sent();
                    now = new Date();
                    if (session &&
                        !includeExpired &&
                        session.expires &&
                        session.expires.getTime() < now.getTime()) {
                        return [2 /*return*/, undefined];
                    }
                    return [2 /*return*/, session];
            }
        });
    });
}
exports.default = loadOfflineSession;
