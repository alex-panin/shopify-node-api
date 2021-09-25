import { SessionStorage } from './auth/session/session_storage';
import { ApiVersion, ContextParams } from './base_types';
import { AuthScopes } from './auth/scopes';
interface ContextInterface extends ContextParams {
    SESSION_STORAGE: SessionStorage;
    SCOPES: AuthScopes;
    /**
     * Sets up the Shopify API Library to be able to integrate with Shopify and run authenticated commands.
     *
     * @param params Settings to update
     */
    initialize(params: ContextParams): void;
    /**
     * Throws error if context has not been initialized.
     */
    throwIfUninitialized(): void | never;
    /**
     * Throws error if the current app is private.
     */
    throwIfPrivateApp(message: string): void | never;
}
declare class Context implements ContextInterface {
    API_KEY: string;
    API_SECRET_KEY: string;
    SCOPES: AuthScopes;
    HOST_NAME: string;
    API_VERSION: ApiVersion;
    IS_EMBEDDED_APP: boolean;
    IS_PRIVATE_APP: boolean;
    SESSION_STORAGE: SessionStorage;
    LOG_FILE?: string | undefined;
    USER_AGENT_PREFIX?: string | undefined;
    PRIVATE_APP_STOREFRONT_ACCESS_TOKEN?: string | undefined;
    constructor();
    initialize(params: ContextParams): void;
    throwIfUninitialized(): void;
    throwIfPrivateApp(message: string): void;
}
export { Context, ContextInterface };
//# sourceMappingURL=context.d.ts.map