/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵMessageId, ɵParsedTranslation} from '@angular/localize/private';
import {Diagnostics} from '../../../diagnostics';

/**
 * Indicates that a parser can parse a given file, with a hint that can be used to speed up actual
 * parsing.
 */
export interface CanParseAnalysis<Hint> {
  canParse: true;
  diagnostics: Diagnostics;
  hint: Hint;
}

/**
 * Indicates that a parser cannot parse a given file with diagnostics as why this is.
 * */
export interface CannotParseAnalysis {
  canParse: false;
  diagnostics: Diagnostics;
}

/**
 * Information about whether a `TranslationParser` can parse a given file.
 */
export type ParseAnalysis<Hint> = CanParseAnalysis<Hint>|CannotParseAnalysis;

/**
 * An object that holds translations that have been parsed from a translation file.
 */
export interface ParsedTranslationBundle {
  locale: string|undefined;
  translations: Record<ɵMessageId, ɵParsedTranslation>;
  diagnostics: Diagnostics;
}

/**
 * Implement this interface to provide a class that can parse the contents of a translation file.
 *
 * The `canParse()` method can return a hint that can be used by the `parse()` method to speed up
 * parsing. This allows the parser to do significant work to determine if the file can be parsed
 * without duplicating the work when it comes to actually parsing the file.
 *
 * Example usage:
 *
 * ```
 * const parser: TranslationParser = getParser();
 * const result = parser.canParse(filePath, content);
 * if (result) {
 *   return parser.parse(filePath, content, result);
 * }
 * ```
 */
export interface TranslationParser<Hint = true> {
  /**
   * Can this parser parse the given file?
   *
   * @deprecated Use `analyze()` instead
   *
   * @param filePath The absolute path to the translation file.
   * @param contents The contents of the translation file.
   * @returns A hint, which can be used in doing the actual parsing, if the file can be parsed by
   * this parser; false otherwise.
   */
  canParse(filePath: string, contents: string): Hint|false;

  /**
   * Analyze the file to see if this parser can parse the given file.
   *
   * @param filePath The absolute path to the translation file.
   * @param contents The contents of the translation file.
   * @returns Information indicating whether the file can be parsed by this parser.
   */
  analyze(filePath: string, contents: string): ParseAnalysis<Hint>;

  /**
   * Parses the given file, extracting the target locale and translations.
   *
   * Note that this method should not throw an error. Check the `bundle.diagnostics` property for
   * potential parsing errors and warnings.
   *
   * @param filePath The absolute path to the translation file.
   * @param contents The contents of the translation file.
   * @param hint A value that can be used by the parser to speed up parsing of the file. This will
   * have been provided as the return result from calling `canParse()`.
   * @returns The translation bundle parsed from the file.
   * @throws No errors. If there was a problem with parsing the bundle will contain errors
   * in the `diagnostics` property.
   */
  parse(filePath: string, contents: string, hint: Hint): ParsedTranslationBundle;
  /**
   * Parses the given file, extracting the target locale and translations.
   *
   * @deprecated This overload is kept for backward compatibility. Going forward use the Hint
   * returned from `canParse()` so that this method can avoid duplicating effort.
   *
   * @param filePath The absolute path to the translation file.
   * @param contents The contents of the translation file.
   * @returns The translation bundle parsed from the file.
   * @throws An error if there was a problem parsing this file.
   */
  parse(filePath: string, contents: string): ParsedTranslationBundle;
}
