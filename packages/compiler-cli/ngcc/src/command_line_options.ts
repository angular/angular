#!/usr/bin/env node
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as yargs from 'yargs';

import {resolve, setFileSystem, CachedFileSystem, NodeJSFileSystem, FileSystem} from '../../src/ngtsc/file_system';
import {ConsoleLogger} from './logging/console_logger';
import {LogLevel, Logger} from './logging/logger';
import {PathMappings} from './utils';

/**
 * The options to configure the ngcc compiler for synchronous execution.
 */
export interface SyncNgccOptions {
  /** The absolute path to the `node_modules` folder that contains the packages to process. */
  basePath: string;

  /**
   * The path to the primary package to be processed. If not absolute then it must be relative to
   * `basePath`.
   *
   * All its dependencies will need to be processed too.
   *
   * If this property is provided then `errorOnFailedEntryPoint` is forced to true.
   */
  targetEntryPointPath?: string;

  /**
   * Which entry-point properties in the package.json to consider when processing an entry-point.
   * Each property should hold a path to the particular bundle format for the entry-point.
   * Defaults to all the properties in the package.json.
   */
  propertiesToConsider?: string[];

  /**
   * Whether to process all formats specified by (`propertiesToConsider`)  or to stop processing
   * this entry-point at the first matching format. Defaults to `true`.
   */
  compileAllFormats?: boolean;

  /**
   * Whether to create new entry-points bundles rather than overwriting the original files.
   */
  createNewEntryPointFormats?: boolean;

  /**
   * Provide a logger that will be called with log messages.
   */
  logger?: Logger;

  /**
   * Paths mapping configuration (`paths` and `baseUrl`), as found in `ts.CompilerOptions`.
   * These are used to resolve paths to locally built Angular libraries.
   *
   * Note that `pathMappings` specified here take precedence over any `pathMappings` loaded from a
   * TS config file.
   */
  pathMappings?: PathMappings;

  /**
   * Provide a file-system service that will be used by ngcc for all file interactions.
   */
  fileSystem?: FileSystem;

  /**
   * Whether the compilation should run and return asynchronously. Allowing asynchronous execution
   * may speed up the compilation by utilizing multiple CPU cores (if available).
   *
   * Default: `false` (i.e. run synchronously)
   */
  async?: false;

  /**
   * Set to true in order to terminate immediately with an error code if an entry-point fails to be
   * processed.
   *
   * If `targetEntryPointPath` is provided then this property is always true and cannot be
   * changed. Otherwise the default is false.
   *
   * When set to false, ngcc will continue to process entry-points after a failure. In which case it
   * will log an error and resume processing other entry-points.
   */
  errorOnFailedEntryPoint?: boolean;

  /**
   * Render `$localize` messages with legacy format ids.
   *
   * The default value is `true`. Only set this to `false` if you do not want legacy message ids to
   * be rendered. For example, if you are not using legacy message ids in your translation files
   * AND are not doing compile-time inlining of translations, in which case the extra message ids
   * would add unwanted size to the final source bundle.
   *
   * It is safe to leave this set to true if you are doing compile-time inlining because the extra
   * legacy message ids will all be stripped during translation.
   */
  enableI18nLegacyMessageIdFormat?: boolean;

  /**
   * Whether to invalidate any entry-point manifest file that is on disk. Instead, walk the
   * directory tree looking for entry-points, and then write a new entry-point manifest, if
   * possible.
   *
   * Default: `false` (i.e. the manifest will be used if available)
   */
  invalidateEntryPointManifest?: boolean;

  /**
   * An absolute path to a TS config file (e.g. `tsconfig.json`) or a directory containing one, that
   * will be used to configure module resolution with things like path mappings, if not specified
   * explicitly via the `pathMappings` property to `mainNgcc`.
   *
   * If `undefined`, ngcc will attempt to load a `tsconfig.json` file from the directory above the
   * `basePath`.
   *
   * If `null`, ngcc will not attempt to load any TS config file at all.
   */
  tsConfigPath?: string|null;
}

/**
 * The options to configure the ngcc compiler for asynchronous execution.
 */
export type AsyncNgccOptions = Omit<SyncNgccOptions, 'async'>&{async: true};

/**
 * The options to configure the ngcc compiler.
 */
export type NgccOptions = AsyncNgccOptions|SyncNgccOptions;

export function parseCommandLineOptions(args: string[]): NgccOptions {
  const options =
      yargs
          .option('s', {
            alias: 'source',
            describe:
                'A path (relative to the working directory) of the `node_modules` folder to process.',
            default: './node_modules'
          })
          .option('f', {alias: 'formats', hidden: true, array: true})
          .option('p', {
            alias: 'properties',
            array: true,
            describe:
                'An array of names of properties in package.json to compile (e.g. `module` or `es2015`)\n' +
                'Each of these properties should hold the path to a bundle-format.\n' +
                'If provided, only the specified properties are considered for processing.\n' +
                'If not provided, all the supported format properties (e.g. fesm2015, fesm5, es2015, esm2015, esm5, main, module) in the package.json are considered.'
          })
          .option('t', {
            alias: 'target',
            describe:
                'A relative path (from the `source` path) to a single entry-point to process (plus its dependencies).\n' +
                'If this property is provided then `error-on-failed-entry-point` is forced to true',
          })
          .option('first-only', {
            describe:
                'If specified then only the first matching package.json property will be compiled.',
            type: 'boolean'
          })
          .option('create-ivy-entry-points', {
            describe:
                'If specified then new `*_ivy_ngcc` entry-points will be added to package.json rather than modifying the ones in-place.\n' +
                'For this to work you need to have custom resolution set up (e.g. in webpack) to look for these new entry-points.\n' +
                'The Angular CLI does this already, so it is safe to use this option if the project is being built via the CLI.',
            type: 'boolean',
          })
          .option('legacy-message-ids', {
            describe: 'Render `$localize` messages with legacy format ids.\n' +
                'The default value is `true`. Only set this to `false` if you do not want legacy message ids to\n' +
                'be rendered. For example, if you are not using legacy message ids in your translation files\n' +
                'AND are not doing compile-time inlining of translations, in which case the extra message ids\n' +
                'would add unwanted size to the final source bundle.\n' +
                'It is safe to leave this set to true if you are doing compile-time inlining because the extra\n' +
                'legacy message ids will all be stripped during translation.',
            type: 'boolean',
            default: true,
          })
          .option('async', {
            describe:
                'Whether to compile asynchronously. This is enabled by default as it allows compilations to be parallelized.\n' +
                'Disabling asynchronous compilation may be useful for debugging.',
            type: 'boolean',
            default: true,
          })
          .option('l', {
            alias: 'loglevel',
            describe: 'The lowest severity logging message that should be output.',
            choices: ['debug', 'info', 'warn', 'error'],
          })
          .option('invalidate-entry-point-manifest', {
            describe:
                'If this is set then ngcc will not read an entry-point manifest file from disk.\n' +
                'Instead it will walk the directory tree as normal looking for entry-points, and then write a new manifest file.',
            type: 'boolean',
            default: false,
          })
          .option('error-on-failed-entry-point', {
            describe:
                'Set this option in order to terminate immediately with an error code if an entry-point fails to be processed.\n' +
                'If `-t`/`--target` is provided then this property is always true and cannot be changed. Otherwise the default is false.\n' +
                'When set to false, ngcc will continue to process entry-points after a failure. In which case it will log an error and resume processing other entry-points.',
            type: 'boolean',
            default: false,
          })
          .option('tsconfig', {
            describe:
                'A path to a tsconfig.json file that will be used to configure the Angular compiler and module resolution used by ngcc.\n' +
                'If not provided, ngcc will attempt to read a `tsconfig.json` file from the folder above that given by the `-s` option.\n' +
                'Set to false (via `--no-tsconfig`) if you do not want ngcc to use any `tsconfig.json` file.',
            type: 'string',
          })
          .strict()
          .help()
          .parse(args);

  if (options['f'] && options['f'].length) {
    console.error(
        'The formats option (-f/--formats) has been removed. Consider the properties option (-p/--properties) instead.');
    process.exit(1);
  }

  setFileSystem(new CachedFileSystem(new NodeJSFileSystem()));

  const baseSourcePath = resolve(options['s'] || './node_modules');
  const propertiesToConsider: string[] = options['p'];
  const targetEntryPointPath = options['t'] ? options['t'] : undefined;
  const compileAllFormats = !options['first-only'];
  const createNewEntryPointFormats = options['create-ivy-entry-points'];
  const logLevel = options['l'] as keyof typeof LogLevel | undefined;
  const enableI18nLegacyMessageIdFormat = options['legacy-message-ids'];
  const invalidateEntryPointManifest = options['invalidate-entry-point-manifest'];
  const errorOnFailedEntryPoint = options['error-on-failed-entry-point'];
  // yargs is not so great at mixed string+boolean types, so we have to test tsconfig against a
  // string "false" to capture the `tsconfig=false` option.
  // And we have to convert the option to a string to handle `no-tsconfig`, which will be `false`.
  const tsConfigPath = `${options['tsconfig']}` === 'false' ? null : options['tsconfig'];

  const logger = logLevel && new ConsoleLogger(LogLevel[logLevel]);

  return {
    basePath: baseSourcePath,
    propertiesToConsider,
    targetEntryPointPath,
    compileAllFormats,
    createNewEntryPointFormats,
    logger,
    enableI18nLegacyMessageIdFormat,
    async: options['async'],
    invalidateEntryPointManifest,
    errorOnFailedEntryPoint,
    tsConfigPath
  };
}