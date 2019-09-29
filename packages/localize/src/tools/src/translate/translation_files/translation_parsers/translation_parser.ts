/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {TranslationBundle} from '../../translator';

/**
 * Implement this interface to provide a class that can parse the contents of a translation file.
 */
export interface TranslationParser {
  /**
   * Returns true if this parser can parse the given file.
   *
   * @param filePath The absolute path to the translation file.
   * @param contents The contents of the translation file.
   */
  canParse(filePath: string, contents: string): boolean;

  /**
   * Parses the given file, extracting the target locale and translations.
   *
   * @param filePath The absolute path to the translation file.
   * @param contents The contents of the translation file.
   */
  parse(filePath: string, contents: string): TranslationBundle;
}
