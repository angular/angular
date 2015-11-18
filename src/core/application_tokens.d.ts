import { OpaqueToken, Provider } from 'angular2/src/core/di';
/**
 * An {@link angular2/di/OpaqueToken} representing the application root type in the {@link
 * Injector}.
 *
 * ```
 * @Component(...)
 * class MyApp {
 *   ...
 * }
 *
 * bootstrap(MyApp).then((appRef:ApplicationRef) {
 *   expect(appRef.injector.get(appComponentTypeToken)).toEqual(MyApp);
 * });
 *
 * ```
 */
export declare const APP_COMPONENT: OpaqueToken;
/**
 * A DI Token representing a unique string id assigned to the application by Angular and used
 * primarily for prefixing application attributes and CSS styles when
 * {@link ViewEncapsulation#Emulated} is being used.
 *
 * If you need to avoid randomly generated value to be used as an application id, you can provide
 * a custom value via a DI provider <!-- TODO: provider --> configuring the root {@link Injector}
 * using this token.
 */
export declare const APP_ID: OpaqueToken;
/**
 * Providers that will generate a random APP_ID_TOKEN.
 */
export declare const APP_ID_RANDOM_PROVIDER: Provider;
