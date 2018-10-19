/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {APP_INITIALIZER, ApplicationInitStatus} from './application_init';
import {ApplicationRef} from './application_ref';
import {APP_ID_RANDOM_PROVIDER} from './application_tokens';
import {IterableDiffers, KeyValueDiffers, defaultIterableDiffers, defaultKeyValueDiffers} from './change_detection/change_detection';
import {Console} from './console';
import {InjectionToken, Injector, StaticProvider} from './di';
import {Inject, Optional, SkipSelf} from './di/metadata';
import {ErrorHandler} from './error_handler';
import {LOCALE_ID} from './i18n/tokens';
import {ComponentFactoryResolver} from './linker';
import {Compiler} from './linker/compiler';
import {NgModule} from './metadata';
import {NgZone} from './zone';

export function _iterableDiffersFactory() {
  return defaultIterableDiffers;
}

export function _keyValueDiffersFactory() {
  return defaultKeyValueDiffers;
}

export function _localeFactory(locale?: string): string {
  return locale || 'en-US';
}

/**
 * A built-in [dependency injection token](guide/glossary#di-token)
 * that is used to configure the root injector for bootstrapping.
 */
export const APPLICATION_MODULE_PROVIDERS: StaticProvider[] = [
  {
    provide: ApplicationRef,
    useClass: ApplicationRef,
    deps:
        [NgZone, Console, Injector, ErrorHandler, ComponentFactoryResolver, ApplicationInitStatus]
  },
  {
    provide: ApplicationInitStatus,
    useClass: ApplicationInitStatus,
    deps: [[new Optional(), APP_INITIALIZER]]
  },
  {provide: Compiler, useClass: Compiler, deps: []},
  APP_ID_RANDOM_PROVIDER,
  {provide: IterableDiffers, useFactory: _iterableDiffersFactory, deps: []},
  {provide: KeyValueDiffers, useFactory: _keyValueDiffersFactory, deps: []},
  {
    provide: LOCALE_ID,
    useFactory: _localeFactory,
    deps: [[new Inject(LOCALE_ID), new Optional(), new SkipSelf()]]
  },
];

/**
 * Configures the root injector for an app with
 * providers of `@angular/core` dependencies that `ApplicationRef` needs
 * to bootstrap components.
 *
 * Re-exported by `BrowserModule`, which is included automatically in the root
 * `AppModule` when you create a new app with the CLI `new` command.
 *
 * @publicApi
 */
@NgModule({providers: APPLICATION_MODULE_PROVIDERS})
export class ApplicationModule {
  // Inject ApplicationRef to make it eager...
  constructor(appRef: ApplicationRef) {}
}
