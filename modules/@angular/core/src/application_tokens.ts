/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StringWrapper} from '../src/facade/lang';

import {OpaqueToken} from './di';


/**
 * A DI Token representing a unique string id assigned to the application by Angular and used
 * primarily for prefixing application attributes and CSS styles when
 * {@link ViewEncapsulation#Emulated} is being used.
 *
 * If you need to avoid randomly generated value to be used as an application id, you can provide
 * a custom value via a DI provider <!-- TODO: provider --> configuring the root {@link Injector}
 * using this token.
 * @experimental
 */
export const APP_ID: any = new OpaqueToken('AppId');

export function _appIdRandomProviderFactory() {
  return `${_randomChar()}${_randomChar()}${_randomChar()}`;
}

/**
 * Providers that will generate a random APP_ID_TOKEN.
 * @experimental
 */
export const APP_ID_RANDOM_PROVIDER = {
  provide: APP_ID,
  useFactory: _appIdRandomProviderFactory,
  deps: <any[]>[],
};

function _randomChar(): string {
  return StringWrapper.fromCharCode(97 + Math.floor(Math.random() * 25));
}

/**
 * A function that will be executed when a platform is initialized.
 * @experimental
 */
export const PLATFORM_INITIALIZER: any = new OpaqueToken('Platform Initializer');

/**
 * All callbacks provided via this token will be called for every component that is bootstrapped.
 * Signature of the callback:
 *
 * `(componentRef: ComponentRef) => void`.
 *
 * @experimental
 */
export const APP_BOOTSTRAP_LISTENER = new OpaqueToken('appBootstrapListener');

/**
 * A token which indicates the root directory of the application
 * @experimental
 */
export const PACKAGE_ROOT_URL: any = new OpaqueToken('Application Packages Root URL');
