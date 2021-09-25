"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var ShopifyErrors = tslib_1.__importStar(require("../error"));
/**
 * Finds and deletes the current user's session, based on the given request and response
 *
 * @param request  Current HTTP request
 * @param response Current HTTP response
 * @param isOnline Whether to load online (default) or offline sessions (optional)
 */
function deleteCurrentSession(request, response, isOnline, oAuth) {
    if (isOnline === void 0) { isOnline = true; }
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var sessionId;
        return tslib_1.__generator(this, function (_a) {
            oAuth.context.throwIfUninitialized();
            sessionId = oAuth.getCurrentSessionId(request, response, isOnline);
            if (!sessionId) {
                throw new ShopifyErrors.SessionNotFound('No active session found.');
            }
            return [2 /*return*/, oAuth.context.SESSION_STORAGE.deleteSession(sessionId)];
        });
    });
}
exports.default = deleteCurrentSession;
