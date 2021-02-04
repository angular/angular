/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵMessageId, ɵparseTranslation, ɵSourceLocation, ɵSourceMessage} from '@angular/localize';
import {Diagnostics} from '../../../diagnostics';
import {ParseAnalysis, ParsedTranslationBundle, TranslationParser} from './translation_parser';

export interface ArbJsonObject extends Record<ɵMessageId, ɵSourceMessage|ArbMetadata> {
  '@@locale': string;
}

export interface ArbMetadata {
  type?: 'text'|'image'|'css';
  description?: string;
  ['x-locations']?: ArbLocation[];
}

export interface ArbLocation {
  start: {line: number, column: number};
  end: {line: number, column: number};
  file: string;
}

/**
 * A translation parser that can parse JSON formatted as an Application Resource Bundle (ARB).
 *
 * See https://github.com/google/app-resource-bundle/wiki/ApplicationResourceBundleSpecification
 *
 * ```
 * {
 *   "@@locale": "en-US",
 *   "message-id": "Target message string",
 *   "@message-id": {
 *     "type": "text",
 *     "description": "Some description text",
 *     "x-locations": [
 *       {
 *         "start": {"line": 23, "column": 145},
 *         "end": {"line": 24, "column": 53},
 *         "file": "some/file.ts"
 *       },
 *       ...
 *     ]
 *   },
 *   ...
 * }
 * ```
 */
export class ArbTranslationParser implements TranslationParser<ArbJsonObject> {
  /**
   * @deprecated
   */
  canParse(filePath: string, contents: string): ArbJsonObject|false {
    const result = this.analyze(filePath, contents);
    return result.canParse && result.hint;
  }

  analyze(_filePath: string, contents: string): ParseAnalysis<ArbJsonObject> {
    const diagnostics = new Diagnostics();
    if (!contents.includes('"@@locale"')) {
      return {canParse: false, diagnostics};
    }
    try {
      // We can parse this file if it is valid JSON and contains the `"@@locale"` property.
      return {canParse: true, diagnostics, hint: this.tryParseArbFormat(contents)};
    } catch {
      diagnostics.warn('File is not valid JSON.');
      return {canParse: false, diagnostics};
    }
  }

  parse(_filePath: string, contents: string, arb: ArbJsonObject = this.tryParseArbFormat(contents)):
      ParsedTranslationBundle {
    const bundle: ParsedTranslationBundle = {
      locale: arb['@@locale'],
      translations: {},
      diagnostics: new Diagnostics()
    };

    for (const messageId of Object.keys(arb)) {
      if (messageId.startsWith('@')) {
        // Skip metadata keys
        continue;
      }
      const targetMessage = arb[messageId] as string;
      bundle.translations[messageId] = ɵparseTranslation(targetMessage);
    }
    return bundle;
  }

  private tryParseArbFormat(contents: string): ArbJsonObject {
    const json = JSON.parse(contents) as ArbJsonObject;
    if (typeof json['@@locale'] !== 'string') {
      throw new Error('Missing @@locale property.');
    }
    return json;
  }
}
