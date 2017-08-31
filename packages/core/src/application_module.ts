/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ApplicationInitStatus} from './application_init';
import {ApplicationRef, ApplicationRef_, isDevMode} from './application_ref';
import {APP_ID_RANDOM_PROVIDER} from './application_tokens';
import {IterableDiffers, KeyValueDiffers, defaultIterableDiffers, defaultKeyValueDiffers} from './change_detection/change_detection';
import {Inject, Optional, SkipSelf} from './di/metadata';
import {LOCALE_ID} from './i18n/tokens';
import {Compiler} from './linker/compiler';
import {ConsoleLogger, LOGGER_OPTIONS, Logger, LoggerOptions, NoOpLogger} from './logger';
import {NgModule} from './metadata';

export function _iterableDiffersFactory() {
  return defaultIterableDiffers;
}

export function _keyValueDiffersFactory() {
  return defaultKeyValueDiffers;
}

export function _localeFactory(locale?: string): string {
  return locale || 'en-US';
}

export function _loggerFactory(options?: LoggerOptions): Logger {
  options = options || {};
  const enabled = options.enabled != null ? options.enabled : isDevMode();
  if (enabled) {
    const _console: Console = typeof console === 'object' ? console : <any>{};
    const debug = options.debug != null ? options.debug : true;
    return new ConsoleLogger(_console, debug);
  }
  return new NoOpLogger();
}

/**
 * This module includes the providers of @angular/core that are needed
 * to bootstrap components via `ApplicationRef`.
 *
 * @experimental
 */
@NgModule({
  providers: [
    ApplicationRef_,
    {provide: ApplicationRef, useExisting: ApplicationRef_},
    ApplicationInitStatus,
    Compiler,
    APP_ID_RANDOM_PROVIDER,
    {provide: IterableDiffers, useFactory: _iterableDiffersFactory},
    {provide: KeyValueDiffers, useFactory: _keyValueDiffersFactory},
    {
      provide: LOCALE_ID,
      useFactory: _localeFactory,
      deps: [[new Inject(LOCALE_ID), new Optional(), new SkipSelf()]]
    },
    {
      provide: Logger,
      useFactory: _loggerFactory,
      deps: [[new Inject(LOGGER_OPTIONS), new Optional()]]
    },
  ]
})
export class ApplicationModule {
  // Inject ApplicationRef to make it eager...
  constructor(appRef: ApplicationRef) {}
}
