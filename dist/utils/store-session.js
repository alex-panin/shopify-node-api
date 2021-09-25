"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
/**
 * Stores the current user's session.
 *
 * @param Session Session object
 */
function storeSession(session, context) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            context.throwIfUninitialized();
            return [2 /*return*/, context.SESSION_STORAGE.storeSession(session)];
        });
    });
}
exports.default = storeSession;
