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

import {CopyResourceHandler} from './resource_processing/copy_resource_handler';
import {InlineResourceHandler} from './resource_processing/inline_resource_handler';
import {getOutputPathFn} from './resource_processing/output_path';
import {ResourceProcessor} from './resource_processing/resource_processor';
import {SimpleJsonTranslationParser} from './translation_files/simple_json_translation_parser';
import {TranslationLoader} from './translation_files/translation_loader';
import {XliffTranslationParser} from './translation_files/xliff_translation_parser';

export interface InliningOptions {
  sourceRootPath: string;
  sourceGlob: string;
  translationGlob: string;
  outputPattern: string;
}

export function translateResources(
    {sourceRootPath, sourceGlob, translationGlob, outputPattern}: InliningOptions) {
  const translationLoader =
      new TranslationLoader([new XliffTranslationParser(), new SimpleJsonTranslationParser()]);
  const resourceProcessor =
      new ResourceProcessor([new InlineResourceHandler(), new CopyResourceHandler()]);

  const translations = translationLoader.loadBundles(translationGlob);
  sourceRootPath = resolve(sourceRootPath);
  const filesToProcess = glob.sync(sourceGlob, {absolute: true, cwd: sourceRootPath, nodir: true});
  resourceProcessor.processResources(
      filesToProcess, sourceRootPath, getOutputPathFn(outputPattern), translations);
}

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
                'A output path pattern to where the translated files will be written. The marker `${locale}` will be replaced with the target locale. E.g. `dist/${locale}`'
          })
          .help()
          .parse(args);

  translateResources({
    sourceRootPath: options['r'],
    sourceGlob: options['s'],
    translationGlob: options['t'],
    outputPattern: options['o']
  });
}