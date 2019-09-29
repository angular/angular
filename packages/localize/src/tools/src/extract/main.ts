#!/usr/bin/env node
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as fs from 'fs';
import * as glob from 'glob';
import * as yargs from 'yargs';
import {resolve} from 'path';
import {writeFile} from '../utils';
import {Extractor} from './extractor';
import {TranslationSerializer} from './translation_files/translation_serializer';
import {JsonTranslationSerializer} from './translation_files/json_translation_serializer';
import {Xliff1TranslationSerializer} from './translation_files/xliff1_translation_serializer';
import {Xliff2TranslationSerializer} from './translation_files/xliff2_translation_serializer';
import {XmbTranslationSerializer} from './translation_files/xmb_translation_serializer';

if (require.main === module) {
  const args = process.argv.slice(2);
  const options =
      yargs
          .option('s', {
            alias: 'source',
            required: true,
            describe:
                'An glob pattern indicating what files to search for translations, e.g. `./dist/**/*.js`. This can be absolute or relative to the current working directory.',
          })
          .option('f', {
            alias: 'format',
            required: true,
            describe: 'The format of the translation file.',
          })
          .option('o', {
            alias: 'outputPath',
            required: true,
            describe:
                'A path to where the translation file will be written. This can be absolute or relative to the current working directory.'
          })
          .help()
          .parse(args);

  extractTranslations({
    sourceGlob: options['s'],
    format: options['f'],
    outputPath: options['o'],
  });
}

type TranslationFormat = 'json' | 'xmb' | 'xliff1' | 'xliff2';

export interface ExtractTranslationsOptions {
  sourceGlob: string;
  format: TranslationFormat;
  outputPath: string;
}

export function extractTranslations(
    {sourceGlob: source, format, outputPath: output}: ExtractTranslationsOptions) {
  const filesToProcess = glob.sync(resolve(source), {absolute: true, nodir: true});

  const extractor = new Extractor();
  filesToProcess.forEach(file => {
    const contents = fs.readFileSync(file, 'utf8');
    extractor.extractMessages(contents, file);
  });

  const serializer = getTranslationSerializer(format);
  const translationFile = serializer.renderFile(extractor.messages);

  writeFile(resolve(output), translationFile);
}

function getTranslationSerializer(format: TranslationFormat): TranslationSerializer {
  switch (format) {
    case 'json':
      return new JsonTranslationSerializer();
    case 'xliff1':
      return new Xliff1TranslationSerializer();
    case 'xliff2':
      return new Xliff2TranslationSerializer();
    case 'xmb':
      return new XmbTranslationSerializer();
  }
}