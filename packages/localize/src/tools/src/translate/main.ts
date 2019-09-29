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
import {getOutputPathFn} from './output_path';
import {SourceFileTranslationHandler} from './source_files/source_file_translation_handler';
import {TranslationLoader} from './translation_files/translation_file_loader';
import {SimpleJsonTranslationParser} from './translation_files/translation_parsers/simple_json/simple_json_translation_parser';
import {Xliff1TranslationParser} from './translation_files/translation_parsers/xliff1/xliff1_translation_parser';
import {Xliff2TranslationParser} from './translation_files/translation_parsers/xliff2/xliff2_translation_parser';
import {Translator} from './translator';

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
                'A output path pattern to where the translated files will be written. The marker `{{LOCALE}}` will be replaced with the target locale. E.g. `dist/{{LOCALE}}`'
          })
          .help()
          .parse(args);

  translateFiles({
    sourceRootPath: options['r'],
    sourceGlob: options['s'],
    translationGlob: options['t'],
    outputPattern: options['o']
  });
}

export interface TranslateFilesOptions {
  sourceRootPath: string;
  sourceGlob: string;
  translationGlob: string;
  outputPattern: string;
}

export function translateFiles(
    {sourceRootPath, sourceGlob, translationGlob, outputPattern}: TranslateFilesOptions) {
  const translationLoader = new TranslationLoader([
    new Xliff2TranslationParser(),
    new Xliff1TranslationParser(),
    new SimpleJsonTranslationParser(),
  ]);

  const resourceProcessor = new Translator([
    new SourceFileTranslationHandler(),
    new AssetTranslationHandler(),
  ]);

  const translations = translationLoader.loadBundles(translationGlob);
  sourceRootPath = resolve(sourceRootPath);
  const filesToProcess = glob.sync(sourceGlob, {absolute: true, cwd: sourceRootPath, nodir: true});
  resourceProcessor.translateFiles(
      filesToProcess, sourceRootPath, getOutputPathFn(outputPattern), translations);
}