"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildQuery = exports.buildCheckQuery = exports.WebhooksRegistry = void 0;
var tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/member-delimiter-style */
var crypto_1 = require("crypto");
var network_1 = require("@shopify/network");
var graphql_client_1 = require("../clients/graphql/graphql_client");
var base_types_1 = require("../base_types");
var utils_1 = tslib_1.__importDefault(require("../utils"));
var ShopifyErrors = tslib_1.__importStar(require("../error"));
var types_1 = require("./types");
function isSuccess(result, deliveryMethod, webhookId) {
    var endpoint;
    switch (deliveryMethod) {
        case types_1.DeliveryMethod.Http:
            endpoint = 'webhookSubscription';
            break;
        case types_1.DeliveryMethod.EventBridge:
            endpoint = 'eventBridgeWebhookSubscription';
            break;
        case types_1.DeliveryMethod.PubSub:
            endpoint = 'pubSubWebhookSubscription';
            break;
        default:
            return false;
    }
    endpoint += webhookId ? 'Update' : 'Create';
    return Boolean(result.data &&
        result.data[endpoint] &&
        result.data[endpoint].webhookSubscription);
}
// 2020-07 onwards
function versionSupportsEndpointField(context) {
    return utils_1.default.versionCompatible(base_types_1.ApiVersion.July20, context.API_VERSION);
}
function versionSupportsPubSub(context) {
    return utils_1.default.versionCompatible(base_types_1.ApiVersion.July21, context.API_VERSION);
}
function validateDeliveryMethod(deliveryMethod, context) {
    if (deliveryMethod === types_1.DeliveryMethod.EventBridge &&
        !versionSupportsEndpointField(context)) {
        throw new ShopifyErrors.UnsupportedClientType("EventBridge webhooks are not supported in API version \"" + context.API_VERSION + "\".");
    }
    else if (deliveryMethod === types_1.DeliveryMethod.PubSub &&
        !versionSupportsPubSub(context)) {
        throw new ShopifyErrors.UnsupportedClientType("Pub/Sub webhooks are not supported in API version \"" + context.API_VERSION + "\".");
    }
}
function buildCheckQuery(topic, context) {
    var query = "{\n    webhookSubscriptions(first: 1, topics: " + topic + ") {\n      edges {\n        node {\n          id\n          endpoint {\n            __typename\n            ... on WebhookHttpEndpoint {\n              callbackUrl\n            }\n            ... on WebhookEventBridgeEndpoint {\n              arn\n            }\n            " + (versionSupportsPubSub(context)
        ? '... on WebhookPubSubEndpoint { \
                    pubSubProject \
                    pubSubTopic \
                  }'
        : '') + "\n          }\n        }\n      }\n    }\n  }";
    var legacyQuery = "{\n    webhookSubscriptions(first: 1, topics: " + topic + ") {\n      edges {\n        node {\n          id\n          callbackUrl\n        }\n      }\n    }\n  }";
    return versionSupportsEndpointField(context) ? query : legacyQuery;
}
exports.buildCheckQuery = buildCheckQuery;
function buildQuery(topic, address, deliveryMethod, context, webhookId) {
    var _a;
    if (deliveryMethod === void 0) { deliveryMethod = types_1.DeliveryMethod.Http; }
    validateDeliveryMethod(deliveryMethod, context);
    var identifier;
    if (webhookId) {
        identifier = "id: \"" + webhookId + "\"";
    }
    else {
        identifier = "topic: " + topic;
    }
    var mutationName;
    var webhookSubscriptionArgs;
    var pubSubProject;
    var pubSubTopic;
    switch (deliveryMethod) {
        case types_1.DeliveryMethod.Http:
            mutationName = webhookId
                ? 'webhookSubscriptionUpdate'
                : 'webhookSubscriptionCreate';
            webhookSubscriptionArgs = "{callbackUrl: \"" + address + "\"}";
            break;
        case types_1.DeliveryMethod.EventBridge:
            mutationName = webhookId
                ? 'eventBridgeWebhookSubscriptionUpdate'
                : 'eventBridgeWebhookSubscriptionCreate';
            webhookSubscriptionArgs = "{arn: \"" + address + "\"}";
            break;
        case types_1.DeliveryMethod.PubSub:
            mutationName = webhookId
                ? 'pubSubWebhookSubscriptionUpdate'
                : 'pubSubWebhookSubscriptionCreate';
            _a = tslib_1.__read(address
                .replace(/^pubsub:\/\//, '')
                .split(':'), 2), pubSubProject = _a[0], pubSubTopic = _a[1];
            webhookSubscriptionArgs = "{pubSubProject: \"" + pubSubProject + "\",\n                                  pubSubTopic: \"" + pubSubTopic + "\"}";
            break;
    }
    return "\n    mutation webhookSubscription {\n      " + mutationName + "(" + identifier + ", webhookSubscription: " + webhookSubscriptionArgs + ") {\n        userErrors {\n          field\n          message\n        }\n        webhookSubscription {\n          id\n        }\n      }\n    }\n  ";
}
exports.buildQuery = buildQuery;
var WebhooksRegistry = /** @class */ (function () {
    function WebhooksRegistry() {
        this.webhookRegistry = [];
    }
    WebhooksRegistry.prototype.register = function (_a) {
        var path = _a.path, topic = _a.topic, accessToken = _a.accessToken, shop = _a.shop, context = _a.context, _b = _a.deliveryMethod, deliveryMethod = _b === void 0 ? types_1.DeliveryMethod.Http : _b, webhookHandler = _a.webhookHandler;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var client, address, checkResult, webhookId, mustRegister, node, endpointAddress, success, body, result;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        validateDeliveryMethod(deliveryMethod, context);
                        client = new graphql_client_1.GraphqlClient(shop, context, accessToken);
                        address = deliveryMethod === types_1.DeliveryMethod.Http
                            ? "https://" + context.HOST_NAME + path
                            : path;
                        return [4 /*yield*/, client.query({
                                data: buildCheckQuery(topic, context),
                            })];
                    case 1:
                        checkResult = (_c.sent());
                        mustRegister = true;
                        if (checkResult.body.data.webhookSubscriptions.edges.length) {
                            node = checkResult.body.data.webhookSubscriptions.edges[0].node;
                            endpointAddress = '';
                            if ('endpoint' in node) {
                                if (node.endpoint.__typename === 'WebhookHttpEndpoint') {
                                    endpointAddress = node.endpoint.callbackUrl;
                                }
                                else if (node.endpoint.__typename === 'WebhookEventBridgeEndpoint') {
                                    endpointAddress = node.endpoint.arn;
                                }
                            }
                            else {
                                endpointAddress = node.callbackUrl;
                            }
                            webhookId = node.id;
                            if (endpointAddress === address) {
                                mustRegister = false;
                            }
                        }
                        if (!mustRegister) return [3 /*break*/, 3];
                        return [4 /*yield*/, client.query({
                                data: buildQuery(topic, address, deliveryMethod, context, webhookId),
                            })];
                    case 2:
                        result = _c.sent();
                        success = isSuccess(result.body, deliveryMethod, webhookId);
                        body = result.body;
                        return [3 /*break*/, 4];
                    case 3:
                        success = true;
                        body = {};
                        _c.label = 4;
                    case 4:
                        if (success) {
                            // Remove this topic from the registry if it is already there
                            this.webhookRegistry = this.webhookRegistry.filter(function (item) { return item.topic !== topic; });
                            this.webhookRegistry.push({ path: path, topic: topic, webhookHandler: webhookHandler });
                        }
                        return [2 /*return*/, { success: success, result: body }];
                }
            });
        });
    };
    WebhooksRegistry.prototype.process = function (request, response, context) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var reqBody, promise;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                reqBody = '';
                promise = new Promise(function (resolve, reject) {
                    request.on('data', function (chunk) {
                        reqBody += chunk;
                    });
                    request.on('end', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                        var hmac, topic, domain, missingHeaders, statusCode, responseError, headers, generatedHash, graphqlTopic_1, webhookEntry, error_1;
                        return tslib_1.__generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!reqBody.length) {
                                        response.writeHead(network_1.StatusCode.BadRequest);
                                        response.end();
                                        return [2 /*return*/, reject(new ShopifyErrors.InvalidWebhookError('No body was received when processing webhook'))];
                                    }
                                    Object.entries(request.headers).map(function (_a) {
                                        var _b = tslib_1.__read(_a, 2), header = _b[0], value = _b[1];
                                        switch (header.toLowerCase()) {
                                            case base_types_1.ShopifyHeader.Hmac.toLowerCase():
                                                hmac = value;
                                                break;
                                            case base_types_1.ShopifyHeader.Topic.toLowerCase():
                                                topic = value;
                                                break;
                                            case base_types_1.ShopifyHeader.Domain.toLowerCase():
                                                domain = value;
                                                break;
                                        }
                                    });
                                    missingHeaders = [];
                                    if (!hmac) {
                                        missingHeaders.push(base_types_1.ShopifyHeader.Hmac);
                                    }
                                    if (!topic) {
                                        missingHeaders.push(base_types_1.ShopifyHeader.Topic);
                                    }
                                    if (!domain) {
                                        missingHeaders.push(base_types_1.ShopifyHeader.Domain);
                                    }
                                    if (missingHeaders.length) {
                                        response.writeHead(network_1.StatusCode.BadRequest);
                                        response.end();
                                        return [2 /*return*/, reject(new ShopifyErrors.InvalidWebhookError("Missing one or more of the required HTTP headers to process webhooks: [" + missingHeaders.join(', ') + "]"))];
                                    }
                                    headers = {};
                                    generatedHash = crypto_1.createHmac('sha256', context.API_SECRET_KEY)
                                        .update(reqBody, 'utf8')
                                        .digest('base64');
                                    if (!utils_1.default.safeCompare(generatedHash, hmac)) return [3 /*break*/, 7];
                                    graphqlTopic_1 = topic
                                        .toUpperCase()
                                        .replace(/\//g, '_');
                                    webhookEntry = this.webhookRegistry.find(function (entry) { return entry.topic === graphqlTopic_1; });
                                    if (!webhookEntry) return [3 /*break*/, 5];
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, webhookEntry.webhookHandler(graphqlTopic_1, domain, reqBody)];
                                case 2:
                                    _a.sent();
                                    statusCode = network_1.StatusCode.Ok;
                                    return [3 /*break*/, 4];
                                case 3:
                                    error_1 = _a.sent();
                                    statusCode = network_1.StatusCode.InternalServerError;
                                    responseError = error_1;
                                    return [3 /*break*/, 4];
                                case 4: return [3 /*break*/, 6];
                                case 5:
                                    statusCode = network_1.StatusCode.Forbidden;
                                    responseError = new ShopifyErrors.InvalidWebhookError("No webhook is registered for topic " + topic);
                                    _a.label = 6;
                                case 6: return [3 /*break*/, 8];
                                case 7:
                                    statusCode = network_1.StatusCode.Forbidden;
                                    responseError = new ShopifyErrors.InvalidWebhookError("Could not validate request for topic " + topic);
                                    _a.label = 8;
                                case 8:
                                    response.writeHead(statusCode, headers);
                                    response.end();
                                    if (responseError) {
                                        return [2 /*return*/, reject(responseError)];
                                    }
                                    else {
                                        return [2 /*return*/, resolve()];
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                });
                return [2 /*return*/, promise];
            });
        });
    };
    WebhooksRegistry.prototype.isWebhookPath = function (path) {
        return Boolean(this.webhookRegistry.find(function (entry) { return entry.path === path; }));
    };
    return WebhooksRegistry;
}());
exports.WebhooksRegistry = WebhooksRegistry;