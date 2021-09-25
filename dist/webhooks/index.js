"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopifyWebhooks = void 0;
var registry_1 = require("./registry");
var ShopifyWebhooks = /** @class */ (function () {
    function ShopifyWebhooks() {
        this.Registry = new registry_1.WebhooksRegistry();
    }
    return ShopifyWebhooks;
}());
exports.ShopifyWebhooks = ShopifyWebhooks;
exports.default = ShopifyWebhooks;
