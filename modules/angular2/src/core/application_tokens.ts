import {OpaqueToken, Provider} from 'angular2/src/core/di';
import {CONST_EXPR, Math, StringWrapper} from 'angular2/src/facade/lang';

/**
 *  @internal
 */
export const APP_COMPONENT_REF_PROMISE = CONST_EXPR(new OpaqueToken('Promise<ComponentRef>'));

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
export const APP_COMPONENT: OpaqueToken = CONST_EXPR(new OpaqueToken('AppComponent'));

/**
 * A DI Token representing a unique string id assigned to the application by Angular and used
 * primarily for prefixing application attributes and CSS styles when
 * {@link ViewEncapsulation#Emulated} is being used.
 *
 * If you need to avoid randomly generated value to be used as an application id, you can provide
 * a custom value via a DI provider <!-- TODO: provider --> configuring the root {@link Injector}
 * using this token.
 */
export const APP_ID: OpaqueToken = CONST_EXPR(new OpaqueToken('AppId'));

function _appIdRandomProviderFactory() {
  return `${_randomChar()}${_randomChar()}${_randomChar()}`;
}

/**
 * Providers that will generate a random APP_ID_TOKEN.
 */
export const APP_ID_RANDOM_PROVIDER: Provider =
    CONST_EXPR(new Provider(APP_ID, {useFactory: _appIdRandomProviderFactory, deps: []}));

function _randomChar(): string {
  return StringWrapper.fromCharCode(97 + Math.floor(Math.random() * 25));
}

/**
 * A function that will be executed when a platform is initialized.
 */
export const PLATFORM_INITIALIZER: OpaqueToken =
    CONST_EXPR(new OpaqueToken("Platform Initializer"));

/**
 * A function that will be executed when an application is initialized.
 */
export const APP_INITIALIZER: OpaqueToken = CONST_EXPR(new OpaqueToken("Application Initializer"));

/**
 * A token which indicates the root directory of the application
 */
export const PACKAGE_ROOT_URL: OpaqueToken =
    CONST_EXPR(new OpaqueToken("Application Packages Root URL"));
