#!/usr/bin/env node
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {setFileSystem, NodeJSFileSystem, AbsoluteFsPath, FileSystem, PathManipulation} from '@angular/compiler-cli/src/ngtsc/file_system';
import {ConsoleLogger, Logger, LogLevel} from '@angular/compiler-cli/src/ngtsc/logging';
import {ɵParsedMessage} from '@angular/localize';
import * as glob from 'glob';
import * as yargs from 'yargs';

import {Diagnostics, DiagnosticHandlingStrategy} from '../diagnostics';

import {checkDuplicateMessages} from './duplicates';
import {MessageExtractor} from './extraction';
import {TranslationSerializer} from './translation_files/translation_serializer';
import {ArbTranslationSerializer} from './translation_files/arb_translation_serializer';
import {SimpleJsonTranslationSerializer} from './translation_files/json_translation_serializer';
import {Xliff1TranslationSerializer} from './translation_files/xliff1_translation_serializer';
import {Xliff2TranslationSerializer} from './translation_files/xliff2_translation_serializer';
import {XmbTranslationSerializer} from './translation_files/xmb_translation_serializer';
import {FormatOptions, parseFormatOptions} from './translation_files/format_options';
import {LegacyMessageIdMigrationSerializer} from './translation_files/legacy_message_id_migration_serializer';

if (require.main === module) {
  process.title = 'Angular Localization Message Extractor (localize-extract)';
  const args = process.argv.slice(2);
  const options =
      yargs
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
            choices: [
              'xmb', 'xlf', 'xlif', 'xliff', 'xlf2', 'xlif2', 'xliff2', 'json', 'legacy-migrate'
            ],
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
          .parse(args);

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
}

export interface ExtractTranslationsOptions {
  /**
   * The locale of the source being processed.
   */
  sourceLocale: string;
  /**
   * The base path for other paths provided in these options.
   * This should either be absolute or relative to the current working directory.
   */
  rootPath: string;
  /**
   * An array of paths to files to search for translations. These should be relative to the
   * rootPath.
   */
  sourceFilePaths: string[];
  /**
   * The format of the translation file.
   */
  format: string;
  /**
   * A path to where the translation file will be written. This should be relative to the rootPath.
   */
  outputPath: string;
  /**
   * The logger to use for diagnostic messages.
   */
  logger: Logger;
  /**
   * Whether to generate source information in the output files by following source-map mappings
   * found in the source file.
   */
  useSourceMaps: boolean;
  /**
   * Whether to use the legacy id format for messages that were extracted from Angular templates
   */
  useLegacyIds: boolean;
  /**
   * How to handle messages with the same id but not the same text.
   */
  duplicateMessageHandling: DiagnosticHandlingStrategy;
  /**
   * A collection of formatting options to pass to the translation file serializer.
   */
  formatOptions?: FormatOptions;
  /**
   * The file-system abstraction to use.
   */
  fileSystem: FileSystem;
}

export function extractTranslations({
  rootPath,
  sourceFilePaths,
  sourceLocale,
  format,
  outputPath: output,
  logger,
  useSourceMaps,
  useLegacyIds,
  duplicateMessageHandling,
  formatOptions = {},
  fileSystem: fs,
}: ExtractTranslationsOptions) {
  const basePath = fs.resolve(rootPath);
  const extractor = new MessageExtractor(fs, logger, {basePath, useSourceMaps});

  const messages: ɵParsedMessage[] = [];
  for (const file of sourceFilePaths) {
    messages.push(...extractor.extractMessages(file));
  }

  const diagnostics = checkDuplicateMessages(fs, messages, duplicateMessageHandling, basePath);
  if (diagnostics.hasErrors) {
    throw new Error(diagnostics.formatDiagnostics('Failed to extract messages'));
  }

  const outputPath = fs.resolve(rootPath, output);
  const serializer = getSerializer(
      format, sourceLocale, fs.dirname(outputPath), useLegacyIds, formatOptions, fs, diagnostics);
  const translationFile = serializer.serialize(messages);
  fs.ensureDir(fs.dirname(outputPath));
  fs.writeFile(outputPath, translationFile);

  if (diagnostics.messages.length) {
    logger.warn(diagnostics.formatDiagnostics('Messages extracted with warnings'));
  }
}

function getSerializer(
    format: string, sourceLocale: string, rootPath: AbsoluteFsPath, useLegacyIds: boolean,
    formatOptions: FormatOptions = {}, fs: PathManipulation,
    diagnostics: Diagnostics): TranslationSerializer {
  switch (format) {
    case 'xlf':
    case 'xlif':
    case 'xliff':
      return new Xliff1TranslationSerializer(
          sourceLocale, rootPath, useLegacyIds, formatOptions, fs);
    case 'xlf2':
    case 'xlif2':
    case 'xliff2':
      return new Xliff2TranslationSerializer(
          sourceLocale, rootPath, useLegacyIds, formatOptions, fs);
    case 'xmb':
      return new XmbTranslationSerializer(rootPath, useLegacyIds, fs);
    case 'json':
      return new SimpleJsonTranslationSerializer(sourceLocale);
    case 'arb':
      return new ArbTranslationSerializer(sourceLocale, rootPath, fs);
    case 'legacy-migrate':
      return new LegacyMessageIdMigrationSerializer(diagnostics);
  }
  throw new Error(`No translation serializer can handle the provided format: ${format}`);
}
