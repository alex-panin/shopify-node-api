"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphqlClient = void 0;
var tslib_1 = require("tslib");
var error_1 = require("../../error");
var base_types_1 = require("../../base_types");
var http_client_1 = require("../http_client/http_client");
var types_1 = require("../http_client/types");
var ShopifyErrors = tslib_1.__importStar(require("../../error"));
var GraphqlClient = /** @class */ (function () {
    function GraphqlClient(domain, context, accessToken) {
        this.domain = domain;
        this.context = context;
        this.accessToken = accessToken;
        this.baseApiPath = '/admin/api';
        if (!this.context.IS_PRIVATE_APP && !accessToken) {
            throw new ShopifyErrors.MissingRequiredArgument('Missing access token when creating GraphQL client');
        }
        this.client = new http_client_1.HttpClient(this.domain, this.context);
    }
    GraphqlClient.prototype.query = function (params) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var accessTokenHeader, path, dataType;
            var _a;
            return tslib_1.__generator(this, function (_b) {
                if (params.data.length === 0) {
                    throw new error_1.MissingRequiredArgument('Query missing.');
                }
                accessTokenHeader = this.getAccessTokenHeader();
                params.extraHeaders = tslib_1.__assign((_a = {}, _a[accessTokenHeader.header] = accessTokenHeader.value, _a), params.extraHeaders);
                path = this.baseApiPath + "/" + this.context.API_VERSION + "/graphql.json";
                if (typeof params.data === 'object') {
                    dataType = types_1.DataType.JSON;
                }
                else {
                    dataType = types_1.DataType.GraphQL;
                }
                return [2 /*return*/, this.client.post(tslib_1.__assign({ path: path, type: dataType }, params))];
            });
        });
    };
    GraphqlClient.prototype.getAccessTokenHeader = function () {
        return {
            header: base_types_1.ShopifyHeader.AccessToken,
            value: this.context.IS_PRIVATE_APP
                ? this.context.API_SECRET_KEY
                : this.accessToken,
        };
    };
    return GraphqlClient;
}());
exports.GraphqlClient = GraphqlClient;
