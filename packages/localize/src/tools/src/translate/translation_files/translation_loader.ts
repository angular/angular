/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Diagnostics} from '../../diagnostics';
import {FileUtils} from '../../file_utils';
import {TranslationBundle} from '../translator';
import {TranslationParser} from './translation_parsers/translation_parser';

/**
 * Use this class to load a collection of translation files from disk.
 */
export class TranslationLoader {
  constructor(
      private translationParsers: TranslationParser[],
      /** @deprecated */ private diagnostics?: Diagnostics) {}

  /**
   * Load and parse the translation files into a collection of `TranslationBundles`.
   *
   * If there is a locale provided in `translationFileLocales` then this is used rather than the
   * locale extracted from the file itself.
   * If there is neither a provided locale nor a locale parsed from the file, then an error is
   * thrown.
   * If there are both a provided locale and a locale parsed from the file, and they are not the
   * same, then a warning is reported .
   *
   * @param translationFilePaths An array of absolute paths to the translation files.
   * @param translationFileLocales An array of locales for each of the translation files.
   */
  loadBundles(translationFilePaths: string[], translationFileLocales: (string|undefined)[]):
      TranslationBundle[] {
    return translationFilePaths.map((filePath, index) => {
      const fileContents = FileUtils.readFile(filePath);
      for (const translationParser of this.translationParsers) {
        const result = translationParser.canParse(filePath, fileContents);
        if (!result) {
          continue;
        }

        const {locale: parsedLocale, translations, diagnostics} =
            translationParser.parse(filePath, fileContents);
        if (diagnostics.hasErrors) {
          throw new Error(diagnostics.formatDiagnostics(
              `The translation file "${filePath}" could not be parsed.`));
        }

        const providedLocale = translationFileLocales[index];
        const locale = providedLocale || parsedLocale;
        if (locale === undefined) {
          throw new Error(
              `The translation file "${filePath}" does not contain a target locale and no explicit locale was provided for this file.`);
        }

        if (parsedLocale !== undefined && providedLocale !== undefined &&
            parsedLocale !== providedLocale) {
          diagnostics.warn(
              `The provided locale "${providedLocale}" does not match the target locale "${parsedLocale}" found in the translation file "${filePath}".`);
        }

        // If we were passed a diagnostics object then copy the messages over to it.
        if (this.diagnostics) {
          this.diagnostics.messages.push(...diagnostics.messages);
        }

        return {locale, translations, diagnostics};
      }
      throw new Error(
          `There is no "TranslationParser" that can parse this translation file: ${filePath}.`);
    });
  }
}
