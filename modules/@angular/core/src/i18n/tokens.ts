/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from '../di/injection_token';

/**
 * @experimental i18n support is experimental.
 */
export const LOCALE_ID = new InjectionToken<string>('LocaleId');

/**
 * @experimental i18n support is experimental.
 */
export const TRANSLATIONS = new InjectionToken<string>('Translations');

/**
 * @experimental i18n support is experimental.
 */
export const TRANSLATIONS_FORMAT = new InjectionToken<string>('TranslationsFormat');

/**
 * @experimental i18n support is experimental.
 */
export enum MissingTranslationStrategy {
  Error,
  Warning,
  Ignore,
}
