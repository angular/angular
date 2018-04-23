/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {APP_ID_RANDOM_PROVIDER} from './application_tokens';
import {IterableDiffers, KeyValueDiffers, defaultIterableDiffers, defaultKeyValueDiffers} from './change_detection/change_detection';
import {Inject, Optional, SkipSelf} from './di/metadata';
import {APP_ROOT} from './di/scope';
import {LOCALE_ID} from './i18n/tokens';
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

/**
 * @experimental
 */
@NgModule({
  providers: [
    APP_ID_RANDOM_PROVIDER,
    // wen-workers need this value to be here since WorkerApp is defined
    // ontop of this application
    {provide: APP_ROOT, useValue: true},
    {provide: IterableDiffers, useFactory: _iterableDiffersFactory},
    {provide: KeyValueDiffers, useFactory: _keyValueDiffersFactory},
    {
      provide: LOCALE_ID,
      useFactory: _localeFactory,
      deps: [[new Inject(LOCALE_ID), new Optional(), new SkipSelf()]]
    },
  ]
})
export class ApplicationModule {
}
