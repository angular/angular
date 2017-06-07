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
export const I18N_VERSION = new InjectionToken<I18nVersion>('I18nVersion');

/**
 * @experimental i18n support is experimental.
 */
export enum I18nVersion {
  // up to angular v4
  Version0 = 0,
  // version from v5.0:
  // - all serializers now use the same digest function
  // - ph and ICU expressions are ignored by digest to generate the id
  Version1 = 1
}

/**
 * @experimental i18n support is experimental.
 */
export enum MissingTranslationStrategy {
  Error,
  Warning,
  Ignore,
}
