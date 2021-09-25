"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
/**
 * Helper method to find and delete offline sessions by shop url.
 *
 * @param shop the shop url to find and delete a session for
 */
function deleteOfflineSession(shop, oAuth, sessionId) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            oAuth.context.throwIfUninitialized();
            // const sessionId = oAuth.getOfflineSessionId(shop);
            return [2 /*return*/, oAuth.context.SESSION_STORAGE.deleteSession(sessionId)];
        });
    });
}
exports.default = deleteOfflineSession;
