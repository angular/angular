/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {APP_INITIALIZER, ApplicationInitStatus} from './application_init';
import {ApplicationRef} from './application_ref';
import {APP_ID_RANDOM_PROVIDER} from './application_tokens';
import {defaultIterableDiffers, defaultKeyValueDiffers, IterableDiffers, KeyValueDiffers} from './change_detection/change_detection';
import {Injector, StaticProvider} from './di';
import {Inject, Optional, SkipSelf} from './di/metadata';
import {ErrorHandler} from './error_handler';
import {DEFAULT_LOCALE_ID, USD_CURRENCY_CODE} from './i18n/localization';
import {DEFAULT_CURRENCY_CODE, LOCALE_ID} from './i18n/tokens';
import {ivyEnabled} from './ivy_switch';
import {ComponentFactoryResolver} from './linker';
import {Compiler} from './linker/compiler';
import {NgModule} from './metadata';
import {SCHEDULER} from './render3/component_ref';
import {setLocaleId} from './render3/i18n/i18n_locale_id';
import {NgZone} from './zone';

declare const $localize: {locale?: string};

export function _iterableDiffersFactory() {
  return defaultIterableDiffers;
}

export function _keyValueDiffersFactory() {
  return defaultKeyValueDiffers;
}

export function _localeFactory(locale?: string): string {
  locale = locale || getGlobalLocale();
  if (ivyEnabled) {
    setLocaleId(locale);
  }
  return locale;
}

/**
 * Work out the locale from the potential global properties.
 *
 * * Closure Compiler: use `goog.LOCALE`.
 * * Ivy enabled: use `$localize.locale`
 */
export function getGlobalLocale(): string {
  if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode &&
      typeof goog !== 'undefined' && goog.LOCALE !== 'en') {
    // * The default `goog.LOCALE` value is `en`, while Angular used `en-US`.
    // * In order to preserve backwards compatibility, we use Angular default value over
    //   Closure Compiler's one.
    return goog.LOCALE;
  } else {
    // KEEP `typeof $localize !== 'undefined' && $localize.locale` IN SYNC WITH THE LOCALIZE
    // COMPILE-TIME INLINER.
    //
    // * During compile time inlining of translations the expression will be replaced
    //   with a string literal that is the current locale. Other forms of this expression are not
    //   guaranteed to be replaced.
    //
    // * During runtime translation evaluation, the developer is required to set `$localize.locale`
    //   if required, or just to provide their own `LOCALE_ID` provider.
    return (ivyEnabled && typeof $localize !== 'undefined' && $localize.locale) ||
        DEFAULT_LOCALE_ID;
  }
}

/**
 * A built-in [dependency injection token](guide/glossary#di-token)
 * that is used to configure the root injector for bootstrapping.
 */
export const APPLICATION_MODULE_PROVIDERS: StaticProvider[] = [
  {
    provide: ApplicationRef,
    useClass: ApplicationRef,
    deps: [NgZone, Injector, ErrorHandler, ComponentFactoryResolver, ApplicationInitStatus]
  },
  {provide: SCHEDULER, deps: [NgZone], useFactory: zoneSchedulerFactory},
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
  {provide: DEFAULT_CURRENCY_CODE, useValue: USD_CURRENCY_CODE},
];

/**
 * Schedule work at next available slot.
 *
 * In Ivy this is just `requestAnimationFrame`. For compatibility reasons when bootstrapped
 * using `platformRef.bootstrap` we need to use `NgZone.onStable` as the scheduling mechanism.
 * This overrides the scheduling mechanism in Ivy to `NgZone.onStable`.
 *
 * @param ngZone NgZone to use for scheduling.
 */
export function zoneSchedulerFactory(ngZone: NgZone): (fn: () => void) => void {
  let queue: (() => void)[] = [];
  ngZone.onStable.subscribe(() => {
    while (queue.length) {
      queue.pop()!();
    }
  });
  return function(fn: () => void) {
    queue.push(fn);
  };
}

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
