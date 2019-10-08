/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {FileUtils} from '../../file_utils';
import {TranslationBundle} from '../translator';
import {TranslationParser} from './translation_parsers/translation_parser';

/**
 * Use this class to load a collection of translation files from disk.
 */
export class TranslationLoader {
  constructor(private translationParsers: TranslationParser[]) {}

  /**
   * Load and parse the translation files into a collection of `TranslationBundles`.
   *
   * @param translationFilePaths A collection of absolute paths to the translation files.
   */
  loadBundles(translationFilePaths: string[]): TranslationBundle[] {
    return translationFilePaths.map(filePath => {
      const fileContents = FileUtils.readFile(filePath);
      for (const translationParser of this.translationParsers) {
        if (translationParser.canParse(filePath, fileContents)) {
          return translationParser.parse(filePath, fileContents);
        }
      }
      throw new Error(`Unable to parse translation file: ${filePath}`);
    });
  }
}
