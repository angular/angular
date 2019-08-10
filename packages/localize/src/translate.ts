/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {LocalizeFn} from './localize';
import {ParsedTranslation, TargetMessage, TranslationKey, parseTranslation, translate as _translate} from './utils/translations';

/**
 * We augment the `$localize` object to also store the translations.
 *
 * Note that because the TRANSLATIONS are attached to a global object, they will be shared between
 * all applications that are running in a single page of the browser.
 */
declare const $localize: LocalizeFn&{TRANSLATIONS: Record<string, ParsedTranslation>};

/**
 * Load translations for `$localize`.
 *
 * The given `translations` are processed and added to a lookup based on their translation key.
 * A new translation will overwrite a previous translation if it has the same key.
 *
 * @publicApi
 */
export function loadTranslations(translations: Record<TranslationKey, TargetMessage>) {
  // Ensure the translate function exists
  if (!$localize.translate) {
    $localize.translate = translate;
  }
  if (!$localize.TRANSLATIONS) {
    $localize.TRANSLATIONS = {};
  }
  Object.keys(translations).forEach(key => {
    $localize.TRANSLATIONS[key] = parseTranslation(translations[key]);
  });
}

/**
 * Remove all translations for `$localize`.
 *
 * @publicApi
 */
export function clearTranslations() {
  $localize.TRANSLATIONS = {};
}

/**
 * Translate the text of the given message, using the loaded translations.
 *
 * This function may reorder (or remove) substitutions as indicated in the matching translation.
 */
export function translate(messageParts: TemplateStringsArray, substitutions: readonly any[]):
    [TemplateStringsArray, readonly any[]] {
  return _translate($localize.TRANSLATIONS, messageParts, substitutions);
}
