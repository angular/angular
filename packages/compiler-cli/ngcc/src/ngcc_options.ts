/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as os from 'os';

import {absoluteFrom, AbsoluteFsPath, FileSystem, getFileSystem, PathManipulation} from '../../src/ngtsc/file_system';
import {ConsoleLogger, Logger, LogLevel} from '../../src/ngtsc/logging';
import {ParsedConfiguration, readConfiguration} from '../../src/perform_compile';

import {SUPPORTED_FORMAT_PROPERTIES} from './packages/entry_point';
import {getPathMappingsFromTsConfig, PathMappings} from './path_mappings';
import {FileWriter} from './writing/file_writer';
import {InPlaceFileWriter} from './writing/in_place_file_writer';
import {NewEntryPointFileWriter} from './writing/new_entry_point_file_writer';
import {PackageJsonUpdater} from './writing/package_json_updater';

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
   * Whether to only process the typings files for this entry-point.
   *
   * This is useful when running ngcc only to provide typings files to downstream tooling such as
   * the Angular Language Service or ng-packagr. Defaults to `false`.
   *
   * If this is set to `true` then `compileAllFormats` is forced to `false`.
   */
  typingsOnly?: boolean;

  /**
   * Whether to process all formats specified by (`propertiesToConsider`)  or to stop processing
   * this entry-point at the first matching format.
   *
   * Defaults to `true`, but is forced to `false` if `typingsOnly` is `true`.
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

  /**
   * Use the program defined in the loaded tsconfig.json (if available - see
   * `tsConfigPath` option) to identify the entry-points that should be processed.
   * If this is set to `true` then only the entry-points reachable from the given
   * program (and their dependencies) will be processed.
   */
  findEntryPointsFromTsConfigProgram?: boolean;
}

/**
 * The options to configure the ngcc compiler for asynchronous execution.
 */
export type AsyncNgccOptions = Omit<SyncNgccOptions, 'async'>&{async: true};

/**
 * The options to configure the ngcc compiler.
 */
export type NgccOptions = AsyncNgccOptions|SyncNgccOptions;

export type OptionalNgccOptionKeys =
    'targetEntryPointPath'|'tsConfigPath'|'pathMappings'|'findEntryPointsFromTsConfigProgram';
export type RequiredNgccOptions = Required<Omit<NgccOptions, OptionalNgccOptionKeys>>;
export type OptionalNgccOptions = Pick<NgccOptions, OptionalNgccOptionKeys>;
export type SharedSetup = {
  fileSystem: FileSystem; absBasePath: AbsoluteFsPath; projectPath: AbsoluteFsPath;
  tsConfig: ParsedConfiguration | null;
  getFileWriter(pkgJsonUpdater: PackageJsonUpdater): FileWriter;
};

/**
 * Instantiate common utilities that are always used and fix up options with defaults, as necessary.
 *
 * NOTE: Avoid eagerly instantiating anything that might not be used when running sync/async.
 */
export function getSharedSetup(options: NgccOptions): SharedSetup&RequiredNgccOptions&
    OptionalNgccOptions {
  const fileSystem = getFileSystem();
  const absBasePath = absoluteFrom(options.basePath);
  const projectPath = fileSystem.dirname(absBasePath);
  const tsConfig =
      options.tsConfigPath !== null ? getTsConfig(options.tsConfigPath || projectPath) : null;

  let {
    basePath,
    targetEntryPointPath,
    propertiesToConsider = SUPPORTED_FORMAT_PROPERTIES,
    typingsOnly = false,
    compileAllFormats = true,
    createNewEntryPointFormats = false,
    logger = new ConsoleLogger(LogLevel.info),
    pathMappings = getPathMappingsFromTsConfig(fileSystem, tsConfig, projectPath),
    async = false,
    errorOnFailedEntryPoint = false,
    enableI18nLegacyMessageIdFormat = true,
    invalidateEntryPointManifest = false,
    tsConfigPath,
  } = options;

  if (!!targetEntryPointPath) {
    // targetEntryPointPath forces us to error if an entry-point fails.
    errorOnFailedEntryPoint = true;
  }

  if (typingsOnly) {
    // If we only want to process the typings then we do not want to waste time trying to process
    // multiple JS formats.
    compileAllFormats = false;
  }

  checkForSolutionStyleTsConfig(fileSystem, logger, projectPath, options.tsConfigPath, tsConfig);

  return {
    basePath,
    targetEntryPointPath,
    propertiesToConsider,
    typingsOnly,
    compileAllFormats,
    createNewEntryPointFormats,
    logger,
    pathMappings,
    async,
    errorOnFailedEntryPoint,
    enableI18nLegacyMessageIdFormat,
    invalidateEntryPointManifest,
    tsConfigPath,
    fileSystem,
    absBasePath,
    projectPath,
    tsConfig,
    getFileWriter: (pkgJsonUpdater: PackageJsonUpdater) => createNewEntryPointFormats ?
        new NewEntryPointFileWriter(fileSystem, logger, errorOnFailedEntryPoint, pkgJsonUpdater) :
        new InPlaceFileWriter(fileSystem, logger, errorOnFailedEntryPoint),
  };
}

let tsConfigCache: ParsedConfiguration|null = null;
let tsConfigPathCache: string|null = null;

/**
 * Get the parsed configuration object for the given `tsConfigPath`.
 *
 * This function will cache the previous parsed configuration object to avoid unnecessary processing
 * of the tsconfig.json in the case that it is requested repeatedly.
 *
 * This makes the assumption, which is true as of writing, that the contents of tsconfig.json and
 * its dependencies will not change during the life of the process running ngcc.
 */
function getTsConfig(tsConfigPath: string): ParsedConfiguration|null {
  if (tsConfigPath !== tsConfigPathCache) {
    tsConfigPathCache = tsConfigPath;
    tsConfigCache = readConfiguration(tsConfigPath);
  }
  return tsConfigCache;
}

export function clearTsConfigCache() {
  tsConfigPathCache = null;
  tsConfigCache = null;
}

function checkForSolutionStyleTsConfig(
    fileSystem: PathManipulation, logger: Logger, projectPath: AbsoluteFsPath,
    tsConfigPath: string|null|undefined, tsConfig: ParsedConfiguration|null): void {
  if (tsConfigPath !== null && !tsConfigPath && tsConfig !== null &&
      tsConfig.rootNames.length === 0 && tsConfig.projectReferences !== undefined &&
      tsConfig.projectReferences.length > 0) {
    logger.warn(
        `The inferred tsconfig file "${tsConfig.project}" appears to be "solution-style" ` +
        `since it contains no root files but does contain project references.\n` +
        `This is probably not wanted, since ngcc is unable to infer settings like "paths" mappings from such a file.\n` +
        `Perhaps you should have explicitly specified one of the referenced projects using the --tsconfig option. For example:\n\n` +
        tsConfig.projectReferences.map(ref => `  ngcc ... --tsconfig "${ref.originalPath}"\n`)
            .join('') +
        `\nFind out more about solution-style tsconfig at https://devblogs.microsoft.com/typescript/announcing-typescript-3-9/#solution-style-tsconfig.\n` +
        `If you did intend to use this file, then you can hide this warning by providing it explicitly:\n\n` +
        `  ngcc ... --tsconfig "${fileSystem.relative(projectPath, tsConfig.project)}"`);
  }
}

/**
 * Determines the maximum number of workers to use for parallel execution. This can be set using the
 * NGCC_MAX_WORKERS environment variable, or is computed based on the number of available CPUs. One
 * CPU core is always reserved for the master process, so we take the number of CPUs minus one, with
 * a maximum of 4 workers. We don't scale the number of workers beyond 4 by default, as it takes
 * considerably more memory and CPU cycles while not offering a substantial improvement in time.
 */
export function getMaxNumberOfWorkers(): number {
  const maxWorkers = process.env.NGCC_MAX_WORKERS;
  if (maxWorkers === undefined) {
    // Use up to 4 CPU cores for workers, always reserving one for master.
    return Math.max(1, Math.min(4, os.cpus().length - 1));
  }

  const numericMaxWorkers = +maxWorkers.trim();
  if (!Number.isInteger(numericMaxWorkers)) {
    throw new Error('NGCC_MAX_WORKERS should be an integer.');
  } else if (numericMaxWorkers < 1) {
    throw new Error('NGCC_MAX_WORKERS should be at least 1.');
  }
  return numericMaxWorkers;
}
