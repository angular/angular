/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵMessageId, ɵParsedTranslation, ɵparseTranslation} from '@angular/localize';
import {extname} from 'path';
import {TranslationBundle} from '../../../translator';
import {TranslationParser} from '../translation_parser';

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
export class SimpleJsonTranslationParser implements TranslationParser {
  canParse(filePath: string, _contents: string): boolean { return (extname(filePath) === '.json'); }

  parse(_filePath: string, contents: string): TranslationBundle {
    const {locale, translations} = JSON.parse(contents);
    const parsedTranslations: Record<ɵMessageId, ɵParsedTranslation> = {};
    for (const messageId in translations) {
      const targetMessage = translations[messageId];
      parsedTranslations[messageId] = ɵparseTranslation(targetMessage);
    }
    return {locale, translations: parsedTranslations};
  }
}
