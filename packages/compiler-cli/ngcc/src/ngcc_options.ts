/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {absoluteFrom, AbsoluteFsPath, FileSystem, getFileSystem, resolve} from '../../src/ngtsc/file_system';
import {ParsedConfiguration, readConfiguration} from '../../src/perform_compile';

import {ConsoleLogger} from './logging/console_logger';
import {Logger, LogLevel} from './logging/logger';
import {SUPPORTED_FORMAT_PROPERTIES} from './packages/entry_point';
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

export type PathMappings = {
  baseUrl: string,
  paths: {[key: string]: string[]}
};

/**
 * If `pathMappings` is not provided directly, then try getting it from `tsConfig`, if available.
 */
export function getPathMappingsFromTsConfig(
    tsConfig: ParsedConfiguration|null, projectPath: AbsoluteFsPath): PathMappings|undefined {
  if (tsConfig !== null && tsConfig.options.baseUrl !== undefined &&
      tsConfig.options.paths !== undefined) {
    return {
      baseUrl: resolve(projectPath, tsConfig.options.baseUrl),
      paths: tsConfig.options.paths,
    };
  }
}

export type OptionalNgccOptionKeys = 'targetEntryPointPath'|'tsConfigPath'|'pathMappings';
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
      options.tsConfigPath !== null ? readConfiguration(options.tsConfigPath || projectPath) : null;

  let {
    basePath,
    targetEntryPointPath,
    propertiesToConsider = SUPPORTED_FORMAT_PROPERTIES,
    compileAllFormats = true,
    createNewEntryPointFormats = false,
    logger = new ConsoleLogger(LogLevel.info),
    pathMappings,
    async = false,
    errorOnFailedEntryPoint = false,
    enableI18nLegacyMessageIdFormat = true,
    invalidateEntryPointManifest = false,
    tsConfigPath,
  } = options;

  pathMappings = options.pathMappings || getPathMappingsFromTsConfig(tsConfig, projectPath);

  if (!!options.targetEntryPointPath) {
    // targetEntryPointPath forces us to error if an entry-point fails.
    errorOnFailedEntryPoint = true;
  }

  return {
    basePath,
    targetEntryPointPath,
    propertiesToConsider,
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
