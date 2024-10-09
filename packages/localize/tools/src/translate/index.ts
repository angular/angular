/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {getFileSystem, relativeFrom} from '@angular/compiler-cli/private/localize';

import {DiagnosticHandlingStrategy, Diagnostics} from '../diagnostics';
import {AssetTranslationHandler} from './asset_files/asset_translation_handler';
import {OutputPathFn} from './output_path';
import {SourceFileTranslationHandler} from './source_files/source_file_translation_handler';
import {TranslationLoader} from './translation_files/translation_loader';
import {ArbTranslationParser} from './translation_files/translation_parsers/arb_translation_parser';
import {SimpleJsonTranslationParser} from './translation_files/translation_parsers/simple_json_translation_parser';
import {Xliff1TranslationParser} from './translation_files/translation_parsers/xliff1_translation_parser';
import {Xliff2TranslationParser} from './translation_files/translation_parsers/xliff2_translation_parser';
import {XtbTranslationParser} from './translation_files/translation_parsers/xtb_translation_parser';
import {Translator} from './translator';

export interface TranslateFilesOptions {
  /**
   * The root path of the files to translate, either absolute or relative to the current working
   * directory. E.g. `dist/en`
   */
  sourceRootPath: string;
  /**
   * The files to translate, relative to the `root` path.
   */
  sourceFilePaths: string[];
  /**
   * An array of paths to the translation files to load, either absolute or relative to the current
   * working directory.
   *
   * For each locale to be translated, there should be an element in `translationFilePaths`.
   * Each element is either an absolute path to the translation file, or an array of absolute paths
   * to translation files, for that locale.
   *
   * If the element contains more than one translation file, then the translations are merged.
   *
   * If allowed by the `duplicateTranslation` property, when more than one translation has the same
   * message id, the message from the earlier translation file in the array is used.
   *
   * For example, if the files are `[app.xlf, lib-1.xlf, lib-2.xlif]` then a message that appears in
   * `app.xlf` will override the same message in `lib-1.xlf` or `lib-2.xlf`.
   */
  translationFilePaths: (string | string[])[];
  /**
   * A collection of the target locales for the translation files.
   *
   * If there is a locale provided in `translationFileLocales` then this is used rather than a
   * locale extracted from the file itself.
   * If there is neither a provided locale nor a locale parsed from the file, then an error is
   * thrown.
   * If there are both a provided locale and a locale parsed from the file, and they are not the
   * same, then a warning is reported.
   */
  translationFileLocales: (string | undefined)[];
  /**
   * A function that computes the output path of where the translated files will be
   * written. The marker `{{LOCALE}}` will be replaced with the target locale. E.g.
   * `dist/{{LOCALE}}`.
   */
  outputPathFn: OutputPathFn;
  /**
   * An object that will receive any diagnostics messages due to the processing.
   */
  diagnostics: Diagnostics;
  /**
   * How to handle missing translations.
   */
  missingTranslation: DiagnosticHandlingStrategy;
  /**
   * How to handle duplicate translations.
   */
  duplicateTranslation: DiagnosticHandlingStrategy;
  /**
   * The locale of the source files.
   * If this is provided then a copy of the application will be created with no translation but just
   * the `$localize` calls stripped out.
   */
  sourceLocale?: string;
}

export function translateFiles({
  sourceRootPath,
  sourceFilePaths,
  translationFilePaths,
  translationFileLocales,
  outputPathFn,
  diagnostics,
  missingTranslation,
  duplicateTranslation,
  sourceLocale,
}: TranslateFilesOptions) {
  const fs = getFileSystem();
  const translationLoader = new TranslationLoader(
    fs,
    [
      new Xliff2TranslationParser(),
      new Xliff1TranslationParser(),
      new XtbTranslationParser(),
      new SimpleJsonTranslationParser(),
      new ArbTranslationParser(),
    ],
    duplicateTranslation,
    diagnostics,
  );

  const resourceProcessor = new Translator(
    fs,
    [new SourceFileTranslationHandler(fs, {missingTranslation}), new AssetTranslationHandler(fs)],
    diagnostics,
  );

  // Convert all the `translationFilePaths` elements to arrays.
  const translationFilePathsArrays = translationFilePaths.map((filePaths) =>
    Array.isArray(filePaths) ? filePaths.map((p) => fs.resolve(p)) : [fs.resolve(filePaths)],
  );

  const translations = translationLoader.loadBundles(
    translationFilePathsArrays,
    translationFileLocales,
  );
  sourceRootPath = fs.resolve(sourceRootPath);
  resourceProcessor.translateFiles(
    sourceFilePaths.map(relativeFrom),
    fs.resolve(sourceRootPath),
    outputPathFn,
    translations,
    sourceLocale,
  );
}
