/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as fs from 'fs';
import * as glob from 'glob';
import {TranslationBundle} from './translation_bundle';
import {TranslationParser} from './translation_parser';

/**
 * Use this class to load a collection of translation files from disk.
 */
export class TranslationLoader {
  constructor(private translationParsers: TranslationParser[]) {}

  /**
   * Load and parse the translation files that match the `translationPath` glob pattern into a
   * collection of `TranslationBundles`.
   *
   * @param translationPath Absolute glob pattern path to the translation files.
   */
  loadBundles(translationPath: string): TranslationBundle[] {
    const translationFiles = glob.sync(translationPath, {absolute: true, nodir: true});
    return translationFiles.map(filePath => {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      for (const translationParser of this.translationParsers) {
        if (translationParser.canParse(filePath, fileContents)) {
          return translationParser.parse(filePath, fileContents);
        }
      }
      throw new Error(`Unable to parse translation file: ${filePath}`);
    });
  }
}
