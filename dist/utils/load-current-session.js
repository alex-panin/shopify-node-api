"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
/**
 * Loads the current user's session, based on the given request and response.
 *
 * @param request  Current HTTP request
 * @param response Current HTTP response
 * @param isOnline Whether to load online (default) or offline sessions (optional)
 */
function loadCurrentSession(request, response, isOnline, oAuth, sessionId) {
    if (isOnline === void 0) { isOnline = true; }
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var session;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    oAuth.context.throwIfUninitialized();
                    // const sessionId = oAuth.getCurrentSessionId(request, response, isOnline);
                    if (!sessionId) {
                        return [2 /*return*/, Promise.resolve(undefined)];
                    }
                    return [4 /*yield*/, oAuth.context.SESSION_STORAGE.loadSession(sessionId)];
                case 1:
                    session = _a.sent();
                    return [2 /*return*/, session];
            }
        });
    });
}
exports.default = loadCurrentSession;
