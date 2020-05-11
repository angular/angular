/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from './di';
import {ComponentRef} from './linker/component_factory';


/**
 * A [DI token](guide/glossary#di-token "DI token definition") representing a unique string ID, used
 * primarily for prefixing application attributes and CSS styles when
 * {@link ViewEncapsulation#Emulated ViewEncapsulation.Emulated} is being used.
 *
 * BY default, the value is randomly generated and assigned to the application by Angular.
 * To provide a custom ID value, use a DI provider <!-- TODO: provider --> to configure
 * the root {@link Injector} that uses this token.
 *
 * @publicApi
 */
export const APP_ID = new InjectionToken<string>('AppId');

export function _appIdRandomProviderFactory() {
  return `${_randomChar()}${_randomChar()}${_randomChar()}`;
}

/**
 * Providers that generate a random `APP_ID_TOKEN`.
 * @publicApi
 */
export const APP_ID_RANDOM_PROVIDER = {
  provide: APP_ID,
  useFactory: _appIdRandomProviderFactory,
  deps: <any[]>[],
};

function _randomChar(): string {
  return String.fromCharCode(97 + Math.floor(Math.random() * 25));
}

/**
 * A function that is executed when a platform is initialized.
 * @publicApi
 */
export const PLATFORM_INITIALIZER = new InjectionToken<Array<() => void>>('Platform Initializer');

/**
 * A token that indicates an opaque platform ID.
 * @publicApi
 */
export const PLATFORM_ID = new InjectionToken<Object>('Platform ID');

/**
 * A [DI token](guide/glossary#di-token "DI token definition") that provides a set of callbacks to
 * be called for every component that is bootstrapped.
 *
 * Each callback must take a `ComponentRef` instance and return nothing.
 *
 * `(componentRef: ComponentRef) => void`
 *
 * @publicApi
 */
export const APP_BOOTSTRAP_LISTENER =
    new InjectionToken<Array<(compRef: ComponentRef<any>) => void>>('appBootstrapListener');

/**
 * A [DI token](guide/glossary#di-token "DI token definition") that indicates the root directory of
 * the application
 * @publicApi
 */
export const PACKAGE_ROOT_URL = new InjectionToken<string>('Application Packages Root URL');
