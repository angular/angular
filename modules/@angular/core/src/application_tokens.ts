import {OpaqueToken} from './di';
import {Math, StringWrapper} from '../src/facade/lang';

/**
 * A DI Token representing a unique string id assigned to the application by Angular and used
 * primarily for prefixing application attributes and CSS styles when
 * {@link ViewEncapsulation#Emulated} is being used.
 *
 * If you need to avoid randomly generated value to be used as an application id, you can provide
 * a custom value via a DI provider <!-- TODO: provider --> configuring the root {@link Injector}
 * using this token.
 */
export const APP_ID: any = /*@ts2dart_const*/ new OpaqueToken('AppId');

function _appIdRandomProviderFactory() {
  return `${_randomChar()}${_randomChar()}${_randomChar()}`;
}

/**
 * Providers that will generate a random APP_ID_TOKEN.
 */
export const APP_ID_RANDOM_PROVIDER =
    /*@ts2dart_const*/ /* @ts2dart_Provider */ {
      provide: APP_ID,
      useFactory: _appIdRandomProviderFactory,
      deps: []
    };

function _randomChar(): string {
  return StringWrapper.fromCharCode(97 + Math.floor(Math.random() * 25));
}

/**
 * A function that will be executed when a platform is initialized.
 */
export const PLATFORM_INITIALIZER: any =
    /*@ts2dart_const*/ new OpaqueToken("Platform Initializer");

/**
 * A function that will be executed when an application is initialized.
 */
export const APP_INITIALIZER: any =
    /*@ts2dart_const*/ new OpaqueToken("Application Initializer");

/**
 * A token which indicates the root directory of the application
 */
export const PACKAGE_ROOT_URL: any =
    /*@ts2dart_const*/ new OpaqueToken("Application Packages Root URL");
