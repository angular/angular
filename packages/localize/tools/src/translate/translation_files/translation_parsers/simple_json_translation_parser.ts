/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {MessageId, ɵParsedTranslation, ɵparseTranslation} from '../../../../../index';
import {extname} from 'path';

import {Diagnostics} from '../../../diagnostics';

import {ParseAnalysis, ParsedTranslationBundle, TranslationParser} from './translation_parser';

interface SimpleJsonFile {
  locale: string;
  translations: {[messageId: string]: string};
}

/**
 * A translation parser that can parse JSON that has the form:
 *
 * ```json
 * {
 *   "locale": "...",
 *   "translations": {
 *     "message-id": "Target message string",
 *     ...
 *   }
 * }
 * ```
 *
 * @see SimpleJsonTranslationSerializer
 * @publicApi used by CLI
 */
export class SimpleJsonTranslationParser implements TranslationParser<SimpleJsonFile> {
  analyze(filePath: string, contents: string): ParseAnalysis<SimpleJsonFile> {
    const diagnostics = new Diagnostics();
    // For this to be parsable, the extension must be `.json` and the contents must include "locale"
    // and "translations" keys.
    if (
      extname(filePath) !== '.json' ||
      !(contents.includes('"locale"') && contents.includes('"translations"'))
    ) {
      diagnostics.warn('File does not have .json extension.');
      return {canParse: false, diagnostics};
    }
    try {
      const json = JSON.parse(contents) as SimpleJsonFile;
      if (json.locale === undefined) {
        diagnostics.warn('Required "locale" property missing.');
        return {canParse: false, diagnostics};
      }
      if (typeof json.locale !== 'string') {
        diagnostics.warn('The "locale" property is not a string.');
        return {canParse: false, diagnostics};
      }
      if (json.translations === undefined) {
        diagnostics.warn('Required "translations" property missing.');
        return {canParse: false, diagnostics};
      }
      if (typeof json.translations !== 'object') {
        diagnostics.warn('The "translations" is not an object.');
        return {canParse: false, diagnostics};
      }
      return {canParse: true, diagnostics, hint: json};
    } catch (e) {
      diagnostics.warn('File is not valid JSON.');
      return {canParse: false, diagnostics};
    }
  }

  parse(_filePath: string, contents: string, json?: SimpleJsonFile): ParsedTranslationBundle {
    const {locale: parsedLocale, translations} = json || (JSON.parse(contents) as SimpleJsonFile);
    const parsedTranslations: Record<MessageId, ɵParsedTranslation> = {};
    for (const messageId in translations) {
      const targetMessage = translations[messageId];
      parsedTranslations[messageId] = ɵparseTranslation(targetMessage);
    }
    return {locale: parsedLocale, translations: parsedTranslations, diagnostics: new Diagnostics()};
  }
}
