/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {OpaqueToken} from '../di/opaque_token';

/**
 * @experimental i18n support is experimental.
 */
export const LOCALE_ID = new OpaqueToken('LocaleId');

/**
 * @experimental i18n support is experimental.
 */
export const TRANSLATIONS = new OpaqueToken('Translations');

/**
 * @experimental i18n support is experimental.
 */
export const TRANSLATIONS_FORMAT = new OpaqueToken('TranslationsFormat');
