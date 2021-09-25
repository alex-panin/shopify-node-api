"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var context_1 = require("./context");
var ShopifyErrors = tslib_1.__importStar(require("./error"));
var session_1 = tslib_1.__importDefault(require("./auth/session"));
var clients_1 = tslib_1.__importDefault(require("./clients"));
var utils_1 = tslib_1.__importDefault(require("./utils"));
var webhooks_1 = tslib_1.__importDefault(require("./webhooks"));
var oauth_1 = require("./auth/oauth/oauth");
// export const Shopify = {
//   Context,
//   Auth: ShopifyAuth,
//   Session: ShopifySession,
//   Clients: ShopifyClients,
//   Utils: ShopifyUtils,
//   Webhooks: ShopifyWebhooks,
//   Errors: ShopifyErrors,
// };
var Shopify = /** @class */ (function () {
    function Shopify() {
        var context = new context_1.Context();
        this.Context = context;
        this.Auth = new oauth_1.ShopifyOAuth(context);
        this.Webhooks = new webhooks_1.default();
        this.Clients = clients_1.default;
        this.Session = session_1.default;
        this.Utils = utils_1.default;
        this.Errors = ShopifyErrors;
    }
    return Shopify;
}());
exports.default = Shopify;
tslib_1.__exportStar(require("./types"), exports);
