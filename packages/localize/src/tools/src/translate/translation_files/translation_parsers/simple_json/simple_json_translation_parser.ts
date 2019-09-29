/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {extname} from 'path';
import {MessageId, ParsedTranslation, parseTranslation} from '../../../../utils';
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
    const parsedTranslations: Record<MessageId, ParsedTranslation> = {};
    for (const messageId in translations) {
      const targetMessage = translations[messageId];
      parsedTranslations[messageId] = parseTranslation(targetMessage);
    }
    return {locale, translations: parsedTranslations};
  }
}
