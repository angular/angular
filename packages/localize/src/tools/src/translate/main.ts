#!/usr/bin/env node
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {getFileSystem, NodeJSFileSystem, setFileSystem, relativeFrom} from '@angular/compiler-cli/src/ngtsc/file_system';
import * as glob from 'glob';
import * as yargs from 'yargs';

import {DiagnosticHandlingStrategy, Diagnostics} from '../diagnostics';
import {AssetTranslationHandler} from './asset_files/asset_translation_handler';
import {getOutputPathFn, OutputPathFn} from './output_path';
import {SourceFileTranslationHandler} from './source_files/source_file_translation_handler';
import {TranslationLoader} from './translation_files/translation_loader';
import {ArbTranslationParser} from './translation_files/translation_parsers/arb_translation_parser';
import {SimpleJsonTranslationParser} from './translation_files/translation_parsers/simple_json_translation_parser';
import {Xliff1TranslationParser} from './translation_files/translation_parsers/xliff1_translation_parser';
import {Xliff2TranslationParser} from './translation_files/translation_parsers/xliff2_translation_parser';
import {XtbTranslationParser} from './translation_files/translation_parsers/xtb_translation_parser';
import {Translator} from './translator';

if (require.main === module) {
  process.title = 'Angular Localization Message Translator (localize-translate)';
  const args = process.argv.slice(2);
  const options =
      yargs
          .option('r', {
            alias: 'root',
            required: true,
            describe:
                'The root path of the files to translate, either absolute or relative to the current working directory. E.g. `dist/en`.',
            type: 'string',
          })
          .option('s', {
            alias: 'source',
            required: true,
            describe:
                'A glob pattern indicating what files to translate, relative to the `root` path. E.g. `bundles/**/*`.',
            type: 'string',
          })

          .option('l', {
            alias: 'source-locale',
            describe:
                'The source locale of the application. If this is provided then a copy of the application will be created with no translation but just the `$localize` calls stripped out.',
            type: 'string',
          })

          .option('t', {
            alias: 'translations',
            required: true,
            array: true,
            describe:
                'A list of paths to the translation files to load, either absolute or relative to the current working directory.\n' +
                'E.g. `-t src/locale/messages.en.xlf src/locale/messages.fr.xlf src/locale/messages.de.xlf`.\n' +
                'If you want to merge multiple translation files for each locale, then provide the list of files in an array.\n' +
                'Note that the arrays must be in double quotes if you include any whitespace within the array.\n' +
                'E.g. `-t "[src/locale/messages.en.xlf, src/locale/messages-2.en.xlf]" [src/locale/messages.fr.xlf,src/locale/messages-2.fr.xlf]`',
            type: 'string',
          })

          .option('target-locales', {
            array: true,
            describe:
                'A list of target locales for the translation files, which will override any target locale parsed from the translation file.\n' +
                'E.g. "-t en fr de".',
            type: 'string',
          })

          .option('o', {
            alias: 'outputPath',
            required: true,
            describe: 'A output path pattern to where the translated files will be written.\n' +
                'The path must be either absolute or relative to the current working directory.\n' +
                'The marker `{{LOCALE}}` will be replaced with the target locale. E.g. `dist/{{LOCALE}}`.',
            type: 'string',
          })

          .option('m', {
            alias: 'missingTranslation',
            describe: 'How to handle missing translations.',
            choices: ['error', 'warning', 'ignore'],
            default: 'warning',
            type: 'string',
          })

          .option('d', {
            alias: 'duplicateTranslation',
            describe: 'How to handle duplicate translations.',
            choices: ['error', 'warning', 'ignore'],
            default: 'warning',
            type: 'string',
          })

          .strict()
          .help()
          .parse(args);

  const fs = new NodeJSFileSystem();
  setFileSystem(fs);

  const sourceRootPath = options.r;
  const sourceFilePaths = glob.sync(options.s, {cwd: sourceRootPath, nodir: true});
  const translationFilePaths: (string|string[])[] = convertArraysFromArgs(options.t);
  const outputPathFn = getOutputPathFn(fs, fs.resolve(options.o));
  const diagnostics = new Diagnostics();
  const missingTranslation = options.m as DiagnosticHandlingStrategy;
  const duplicateTranslation = options.d as DiagnosticHandlingStrategy;
  const sourceLocale: string|undefined = options.l;
  const translationFileLocales: string[] = options['target-locales'] || [];

  translateFiles({
    sourceRootPath,
    sourceFilePaths,
    translationFilePaths,
    translationFileLocales,
    outputPathFn,
    diagnostics,
    missingTranslation,
    duplicateTranslation,
    sourceLocale
  });

  diagnostics.messages.forEach(m => console.warn(`${m.type}: ${m.message}`));
  process.exit(diagnostics.hasErrors ? 1 : 0);
}

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
  translationFilePaths: (string|string[])[];
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
  translationFileLocales: (string|undefined)[];
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
  sourceLocale
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
      duplicateTranslation, diagnostics);

  const resourceProcessor = new Translator(
      fs,
      [
        new SourceFileTranslationHandler(fs, {missingTranslation}),
        new AssetTranslationHandler(fs),
      ],
      diagnostics);

  // Convert all the `translationFilePaths` elements to arrays.
  const translationFilePathsArrays = translationFilePaths.map(
      filePaths =>
          Array.isArray(filePaths) ? filePaths.map(p => fs.resolve(p)) : [fs.resolve(filePaths)]);

  const translations =
      translationLoader.loadBundles(translationFilePathsArrays, translationFileLocales);
  sourceRootPath = fs.resolve(sourceRootPath);
  resourceProcessor.translateFiles(
      sourceFilePaths.map(relativeFrom), fs.resolve(sourceRootPath), outputPathFn, translations,
      sourceLocale);
}

/**
 * Parse each of the given string `args` and convert it to an array if it is of the form
 * `[abc, def, ghi]`, i.e. it is enclosed in square brackets with comma delimited items.
 * @param args The string to potentially convert to arrays.
 */
function convertArraysFromArgs(args: string[]): (string|string[])[] {
  return args.map(
      arg => (arg.startsWith('[') && arg.endsWith(']')) ?
          arg.slice(1, -1).split(',').map(arg => arg.trim()) :
          arg);
}
