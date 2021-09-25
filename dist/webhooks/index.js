"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopifyWebhooks = void 0;
var registry_1 = require("./registry");
var ShopifyWebhooks = /** @class */ (function () {
    function ShopifyWebhooks(context) {
        this.Registry = new registry_1.WebhooksRegistry(context);
    }
    return ShopifyWebhooks;
}());
exports.ShopifyWebhooks = ShopifyWebhooks;
exports.default = ShopifyWebhooks;
