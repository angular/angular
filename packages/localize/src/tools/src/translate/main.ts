#!/usr/bin/env node
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as glob from 'glob';
import {resolve} from 'path';
import * as yargs from 'yargs';

import {AssetTranslationHandler} from './asset_files/asset_translation_handler';
import {getOutputPathFn, OutputPathFn} from './output_path';
import {SourceFileTranslationHandler} from './source_files/source_file_translation_handler';
import {MissingTranslationStrategy} from './source_files/source_file_utils';
import {TranslationLoader} from './translation_files/translation_file_loader';
import {SimpleJsonTranslationParser} from './translation_files/translation_parsers/simple_json/simple_json_translation_parser';
import {Xliff1TranslationParser} from './translation_files/translation_parsers/xliff1/xliff1_translation_parser';
import {Xliff2TranslationParser} from './translation_files/translation_parsers/xliff2/xliff2_translation_parser';
import {Translator} from './translator';
import {Diagnostics} from '../diagnostics';

if (require.main === module) {
  const args = process.argv.slice(2);
  const options =
      yargs
          .option('r', {
            alias: 'root',
            required: true,
            describe:
                'The root path of the files to translate, either absolute or relative to the current working directory. E.g. `dist/en`.',
          })
          .option('s', {
            alias: 'source',
            required: true,
            describe:
                'A glob pattern indicating what files to translate, relative to the `root` path. E.g. `bundles/**/*`.',
          })

          .option('l', {
            alias: 'source-locale',
            describe:
                'The source locale of the application. If this is provided then a copy of the application will be created with no translation but just the `$localize` calls stripped out.',
          })

          .option('t', {
            alias: 'translations',
            required: true,
            describe:
                'A glob pattern indicating what translation files to load, either absolute or relative to the current working directory. E.g. `my_proj/src/locale/messages.*.xlf.',
          })
          .option('o', {
            alias: 'outputPath',
            required: true,
            describe:
                'A output path pattern to where the translated files will be written. The marker `{{LOCALE}}` will be replaced with the target locale. E.g. `dist/{{LOCALE}}`.'
          })
          .option('m', {
            alias: 'missingTranslation',
            describe: 'How to handle missing translations.',
            choices: ['error', 'warning', 'ignore'],
            default: 'warning',
          })
          .help()
          .parse(args);

  const sourceRootPath = options['r'];
  const sourceFilePaths =
      glob.sync(options['s'], {absolute: true, cwd: sourceRootPath, nodir: true});
  const translationFilePaths = glob.sync(options['t'], {absolute: true, nodir: true});
  const outputPathFn = getOutputPathFn(options['o']);
  const diagnostics = new Diagnostics();
  const missingTranslation: MissingTranslationStrategy = options['m'];
  const sourceLocale: string|undefined = options['l'];

  translateFiles({sourceRootPath, sourceFilePaths, translationFilePaths, outputPathFn, diagnostics,
                  missingTranslation, sourceLocale});

  diagnostics.messages.forEach(m => console.warn(`${m.type}: ${m.message}`));
  process.exit(diagnostics.hasErrors ? 1 : 0);
}

export interface TranslateFilesOptions {
  sourceRootPath: string;
  sourceFilePaths: string[];
  translationFilePaths: string[];
  outputPathFn: OutputPathFn;
  diagnostics: Diagnostics;
  missingTranslation: MissingTranslationStrategy;
  sourceLocale?: string;
}

export function translateFiles({sourceRootPath, sourceFilePaths, translationFilePaths, outputPathFn,
                                diagnostics, missingTranslation,
                                sourceLocale}: TranslateFilesOptions) {
  const translationLoader = new TranslationLoader([
    new Xliff2TranslationParser(),
    new Xliff1TranslationParser(),
    new SimpleJsonTranslationParser(),
  ]);

  const resourceProcessor = new Translator(
      [
        new SourceFileTranslationHandler({missingTranslation}),
        new AssetTranslationHandler(),
      ],
      diagnostics);

  const translations = translationLoader.loadBundles(translationFilePaths);
  sourceRootPath = resolve(sourceRootPath);
  resourceProcessor.translateFiles(
      sourceFilePaths, sourceRootPath, outputPathFn, translations, sourceLocale);
}
