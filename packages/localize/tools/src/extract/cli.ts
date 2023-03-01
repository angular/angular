#!/usr/bin/env node
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ConsoleLogger, LogLevel, NodeJSFileSystem, setFileSystem} from '@angular/compiler-cli/private/localize';
import glob from 'glob';
import yargs from 'yargs';

import {DiagnosticHandlingStrategy} from '../diagnostics';
import {parseFormatOptions} from './translation_files/format_options';
import {extractTranslations} from './index';

process.title = 'Angular Localization Message Extractor (localize-extract)';
const args = process.argv.slice(2);
const options =
    yargs(args)
        .option('l', {
          alias: 'locale',
          describe: 'The locale of the source being processed',
          default: 'en',
          type: 'string',
        })
        .option('r', {
          alias: 'root',
          default: '.',
          describe: 'The root path for other paths provided in these options.\n' +
              'This should either be absolute or relative to the current working directory.',
          type: 'string',
        })
        .option('s', {
          alias: 'source',
          required: true,
          describe:
              'A glob pattern indicating what files to search for translations, e.g. `./dist/**/*.js`.\n' +
              'This should be relative to the root path.',
          type: 'string',
        })
        .option('f', {
          alias: 'format',
          required: true,
          choices:
              ['xmb', 'xlf', 'xlif', 'xliff', 'xlf2', 'xlif2', 'xliff2', 'json', 'legacy-migrate'],
          describe: 'The format of the translation file.',
          type: 'string',
        })
        .option('formatOptions', {
          describe:
              'Additional options to pass to the translation file serializer, in the form of JSON formatted key-value string pairs:\n' +
              'For example: `--formatOptions {"xml:space":"preserve"}.\n' +
              'The meaning of the options is specific to the format being serialized.',
          type: 'string'
        })
        .option('o', {
          alias: 'outputPath',
          required: true,
          describe:
              'A path to where the translation file will be written. This should be relative to the root path.',
          type: 'string',
        })
        .option('loglevel', {
          describe: 'The lowest severity logging message that should be output.',
          choices: ['debug', 'info', 'warn', 'error'],
          type: 'string',
        })
        .option('useSourceMaps', {
          type: 'boolean',
          default: true,
          describe:
              'Whether to generate source information in the output files by following source-map mappings found in the source files',
        })
        .option('useLegacyIds', {
          type: 'boolean',
          default: true,
          describe:
              'Whether to use the legacy id format for messages that were extracted from Angular templates.',
        })
        .option('d', {
          alias: 'duplicateMessageHandling',
          describe: 'How to handle messages with the same id but different text.',
          choices: ['error', 'warning', 'ignore'],
          default: 'warning',
          type: 'string',
        })
        .strict()
        .help()
        .parseSync();

const fileSystem = new NodeJSFileSystem();
setFileSystem(fileSystem);

const rootPath = options.r;
const sourceFilePaths = glob.sync(options.s, {cwd: rootPath, nodir: true});
const logLevel = options.loglevel as (keyof typeof LogLevel) | undefined;
const logger = new ConsoleLogger(logLevel ? LogLevel[logLevel] : LogLevel.warn);
const duplicateMessageHandling = options.d as DiagnosticHandlingStrategy;
const formatOptions = parseFormatOptions(options.formatOptions);
const format = options.f;

extractTranslations({
  rootPath,
  sourceFilePaths,
  sourceLocale: options.l,
  format,
  outputPath: options.o,
  logger,
  useSourceMaps: options.useSourceMaps,
  useLegacyIds: format === 'legacy-migrate' || options.useLegacyIds,
  duplicateMessageHandling,
  formatOptions,
  fileSystem,
});
