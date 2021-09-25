"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Session = void 0;
/**
 * Stores App information from logged in merchants so they can make authenticated requests to the Admin API.
 */
var Session = /** @class */ (function () {
    function Session(id, context) {
        this.id = id;
        this.context = context;
    }
    Session.cloneSession = function (session, newId, context) {
        var newSession = new Session(newId, context);
        newSession.shop = session.shop;
        newSession.state = session.state;
        newSession.scope = session.scope;
        newSession.expires = session.expires;
        newSession.isOnline = session.isOnline;
        newSession.accessToken = session.accessToken;
        newSession.onlineAccessInfo = session.onlineAccessInfo;
        return newSession;
    };
    Session.prototype.isActive = function () {
        var scopesUnchanged = this.context.SCOPES.equals(this.scope);
        if (scopesUnchanged &&
            this.accessToken &&
            (!this.expires || this.expires >= new Date())) {
            return true;
        }
        return false;
    };
    return Session;
}());
exports.Session = Session;
