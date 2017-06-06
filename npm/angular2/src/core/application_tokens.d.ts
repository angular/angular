/**
 * A DI Token representing a unique string id assigned to the application by Angular and used
 * primarily for prefixing application attributes and CSS styles when
 * {@link ViewEncapsulation#Emulated} is being used.
 *
 * If you need to avoid randomly generated value to be used as an application id, you can provide
 * a custom value via a DI provider <!-- TODO: provider --> configuring the root {@link Injector}
 * using this token.
 */
export declare const APP_ID: any;
/**
 * Providers that will generate a random APP_ID_TOKEN.
 */
export declare const APP_ID_RANDOM_PROVIDER: {
    provide: any;
    useFactory: () => string;
    deps: any[];
};
/**
 * A function that will be executed when a platform is initialized.
 */
export declare const PLATFORM_INITIALIZER: any;
/**
 * A function that will be executed when an application is initialized.
 */
export declare const APP_INITIALIZER: any;
/**
 * A token which indicates the root directory of the application
 */
export declare const PACKAGE_ROOT_URL: any;
