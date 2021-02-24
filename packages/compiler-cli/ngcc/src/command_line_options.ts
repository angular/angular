#!/usr/bin/env node
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as yargs from 'yargs';

import {setFileSystem, NodeJSFileSystem} from '../../src/ngtsc/file_system';
import {ConsoleLogger, LogLevel} from '../../src/ngtsc/logging';
import {NgccOptions} from './ngcc_options';

export function parseCommandLineOptions(args: string[]): NgccOptions {
  const options =
      yargs
          .option('s', {
            alias: 'source',
            describe:
                'A path (relative to the working directory) of the `node_modules` folder to process.',
            default: './node_modules',
            type: 'string',
          })
          .option('f', {alias: 'formats', hidden: true, array: true, type: 'string'})
          .option('p', {
            alias: 'properties',
            array: true,
            describe:
                'An array of names of properties in package.json to compile (e.g. `module` or `main`)\n' +
                'Each of these properties should hold the path to a bundle-format.\n' +
                'If provided, only the specified properties are considered for processing.\n' +
                'If not provided, all the supported format properties (e.g. fesm2015, fesm5, es2015, esm2015, esm5, main, module) in the package.json are considered.',
            type: 'string',
          })
          .option('t', {
            alias: 'target',
            describe:
                'A relative path (from the `source` path) to a single entry-point to process (plus its dependencies).\n' +
                'If this property is provided then `error-on-failed-entry-point` is forced to true.\n' +
                'This option overrides the `--use-program-dependencies` option.',
            type: 'string',
          })
          .option('use-program-dependencies', {
            type: 'boolean',
            describe:
                'If this property is provided then the entry-points to process are parsed from the program defined by the loaded tsconfig.json. See `--tsconfig`.\n' +
                'This option is overridden by the `--target` option.',
          })
          .option('first-only', {
            describe:
                'If specified then only the first matching package.json property will be compiled.\n' +
                'This option is overridden by `--typings-only`.',
            type: 'boolean',
          })
          .option('typings-only', {
            describe:
                'If specified then only the typings files are processed, and no JS source files will be modified.\n' +
                'Setting this option will force `--first-only` to be set, since only one format is needed to process the typings',
            type: 'boolean',
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
            type: 'string',
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

  if (options.f?.length) {
    console.error(
        'The formats option (-f/--formats) has been removed. Consider the properties option (-p/--properties) instead.');
    process.exit(1);
  }

  const fs = new NodeJSFileSystem();
  setFileSystem(fs);

  const baseSourcePath = fs.resolve(options.s || './node_modules');
  const propertiesToConsider = options.p;
  const targetEntryPointPath = options.t;
  const compileAllFormats = !options['first-only'];
  const typingsOnly = options['typings-only'];
  const createNewEntryPointFormats = options['create-ivy-entry-points'];
  const logLevel = options.l as keyof typeof LogLevel | undefined;
  const enableI18nLegacyMessageIdFormat = options['legacy-message-ids'];
  const invalidateEntryPointManifest = options['invalidate-entry-point-manifest'];
  const errorOnFailedEntryPoint = options['error-on-failed-entry-point'];
  const findEntryPointsFromTsConfigProgram = options['use-program-dependencies'];
  // yargs is not so great at mixed string+boolean types, so we have to test tsconfig against a
  // string "false" to capture the `tsconfig=false` option.
  // And we have to convert the option to a string to handle `no-tsconfig`, which will be `false`.
  const tsConfigPath = `${options.tsconfig}` === 'false' ? null : options.tsconfig;

  const logger = logLevel && new ConsoleLogger(LogLevel[logLevel]);

  return {
    basePath: baseSourcePath,
    propertiesToConsider,
    targetEntryPointPath,
    typingsOnly,
    compileAllFormats,
    createNewEntryPointFormats,
    logger,
    enableI18nLegacyMessageIdFormat,
    async: options.async,
    invalidateEntryPointManifest,
    errorOnFailedEntryPoint,
    tsConfigPath,
    findEntryPointsFromTsConfigProgram,
  };
}
