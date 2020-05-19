/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵMessageId, ɵParsedTranslation, ɵparseTranslation} from '@angular/localize';
import {extname} from 'path';
import {Diagnostics} from '../../../diagnostics';
import {ParsedTranslationBundle, TranslationParser} from './translation_parser';

/**
 * A translation parser that can parse JSON that has the form:
 *
 * ```
 * {
 *   "locale": "...",
 *   "translations": {
 *     "message-id": "Target message string",
 *     ...
 *   }
 * }
 * ```
 */
export class SimpleJsonTranslationParser implements TranslationParser<Object> {
  canParse(filePath: string, contents: string): Object|false {
    if (extname(filePath) !== '.json') {
      return false;
    }
    try {
      const json = JSON.parse(contents);
      return (typeof json.locale === 'string' && typeof json.translations === 'object') && json;
    } catch {
      return false;
    }
  }

  parse(_filePath: string, contents: string, json?: Object): ParsedTranslationBundle {
    const {locale: parsedLocale, translations} = json || JSON.parse(contents);
    const parsedTranslations: Record<ɵMessageId, ɵParsedTranslation> = {};
    for (const messageId in translations) {
      const targetMessage = translations[messageId];
      parsedTranslations[messageId] = ɵparseTranslation(targetMessage);
    }
    return {locale: parsedLocale, translations: parsedTranslations, diagnostics: new Diagnostics()};
  }
}
