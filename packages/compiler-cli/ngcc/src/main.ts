/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="node" />

import {DepGraph} from 'dependency-graph';
import * as os from 'os';
import * as ts from 'typescript';

import {readConfiguration} from '../..';
import {replaceTsWithNgInErrors} from '../../src/ngtsc/diagnostics';
import {absoluteFrom, AbsoluteFsPath, dirname, FileSystem, getFileSystem, resolve} from '../../src/ngtsc/file_system';

import {CommonJsDependencyHost} from './dependencies/commonjs_dependency_host';
import {DependencyResolver, InvalidEntryPoint} from './dependencies/dependency_resolver';
import {DtsDependencyHost} from './dependencies/dts_dependency_host';
import {EsmDependencyHost} from './dependencies/esm_dependency_host';
import {ModuleResolver} from './dependencies/module_resolver';
import {UmdDependencyHost} from './dependencies/umd_dependency_host';
import {DirectoryWalkerEntryPointFinder} from './entry_point_finder/directory_walker_entry_point_finder';
import {EntryPointFinder} from './entry_point_finder/interface';
import {TargetedEntryPointFinder} from './entry_point_finder/targeted_entry_point_finder';
import {AnalyzeEntryPointsFn, CreateCompileFn, Executor} from './execution/api';
import {ClusterExecutor} from './execution/cluster/executor';
import {ClusterPackageJsonUpdater} from './execution/cluster/package_json_updater';
import {SingleProcessExecutorAsync, SingleProcessExecutorSync} from './execution/single_process_executor';
import {CreateTaskCompletedCallback, PartiallyOrderedTasks, Task, TaskProcessingOutcome, TaskQueue} from './execution/tasks/api';
import {composeTaskCompletedCallbacks, createLogErrorHandler, createMarkAsProcessedHandler, createThrowErrorHandler} from './execution/tasks/completion';
import {ParallelTaskQueue} from './execution/tasks/queues/parallel_task_queue';
import {SerialTaskQueue} from './execution/tasks/queues/serial_task_queue';
import {computeTaskDependencies} from './execution/tasks/utils';
import {AsyncLocker} from './locking/async_locker';
import {LockFileWithChildProcess} from './locking/lock_file_with_child_process';
import {SyncLocker} from './locking/sync_locker';
import {ConsoleLogger} from './logging/console_logger';
import {Logger, LogLevel} from './logging/logger';
import {hasBeenProcessed} from './packages/build_marker';
import {NgccConfiguration} from './packages/configuration';
import {EntryPoint, EntryPointJsonProperty, EntryPointPackageJson, getEntryPointFormat, SUPPORTED_FORMAT_PROPERTIES} from './packages/entry_point';
import {makeEntryPointBundle} from './packages/entry_point_bundle';
import {EntryPointManifest, InvalidatingEntryPointManifest} from './packages/entry_point_manifest';
import {Transformer} from './packages/transformer';
import {PathMappings} from './utils';
import {cleanOutdatedPackages} from './writing/cleaning/package_cleaner';
import {FileWriter} from './writing/file_writer';
import {InPlaceFileWriter} from './writing/in_place_file_writer';
import {NewEntryPointFileWriter} from './writing/new_entry_point_file_writer';
import {DirectPackageJsonUpdater, PackageJsonUpdater} from './writing/package_json_updater';

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

/**
 * This is the main entry-point into ngcc (aNGular Compatibility Compiler).
 *
 * You can call this function to process one or more npm packages, to ensure
 * that they are compatible with the ivy compiler (ngtsc).
 *
 * @param options The options telling ngcc what to compile and how.
 */
export function mainNgcc(options: AsyncNgccOptions): Promise<void>;
export function mainNgcc(options: SyncNgccOptions): void;
export function mainNgcc({
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
  tsConfigPath
}: NgccOptions): void|Promise<void> {
  if (!!targetEntryPointPath) {
    // targetEntryPointPath forces us to error if an entry-point fails.
    errorOnFailedEntryPoint = true;
  }

  // Execute in parallel, if async execution is acceptable and there are more than 1 CPU cores.
  const inParallel = async && (os.cpus().length > 1);

  // Instantiate common utilities that are always used.
  // NOTE: Avoid eagerly instantiating anything that might not be used when running sync/async or in
  //       master/worker process.
  const fileSystem = getFileSystem();
  const absBasePath = absoluteFrom(basePath);
  const projectPath = dirname(absBasePath);
  const config = new NgccConfiguration(fileSystem, projectPath);
  const tsConfig = tsConfigPath !== null ? readConfiguration(tsConfigPath || projectPath) : null;

  // If `pathMappings` is not provided directly, then try getting it from `tsConfig`, if available.
  if (tsConfig !== null && pathMappings === undefined && tsConfig.options.baseUrl !== undefined &&
      tsConfig.options.paths) {
    pathMappings = {
      baseUrl: resolve(projectPath, tsConfig.options.baseUrl),
      paths: tsConfig.options.paths,
    };
  }

  const dependencyResolver = getDependencyResolver(fileSystem, logger, config, pathMappings);
  const entryPointManifest = invalidateEntryPointManifest ?
      new InvalidatingEntryPointManifest(fileSystem, config, logger) :
      new EntryPointManifest(fileSystem, config, logger);

  // Bail out early if the work is already done.
  const supportedPropertiesToConsider = ensureSupportedProperties(propertiesToConsider);
  const absoluteTargetEntryPointPath =
      targetEntryPointPath !== undefined ? resolve(basePath, targetEntryPointPath) : null;
  const finder = getEntryPointFinder(
      fileSystem, logger, dependencyResolver, config, entryPointManifest, absBasePath,
      absoluteTargetEntryPointPath, pathMappings);
  if (finder instanceof TargetedEntryPointFinder &&
      !finder.targetNeedsProcessingOrCleaning(supportedPropertiesToConsider, compileAllFormats)) {
    logger.debug('The target entry-point has already been processed');
    return;
  }

  // NOTE: To avoid file corruption, ensure that each `ngcc` invocation only creates _one_ instance
  //       of `PackageJsonUpdater` that actually writes to disk (across all processes).
  //       This is hard to enforce automatically, when running on multiple processes, so needs to be
  //       enforced manually.
  const pkgJsonUpdater = getPackageJsonUpdater(inParallel, fileSystem);

  // The function for performing the analysis.
  const analyzeEntryPoints: AnalyzeEntryPointsFn = () => {
    logger.debug('Analyzing entry-points...');
    const startTime = Date.now();

    let entryPointInfo = finder.findEntryPoints();
    const cleaned = cleanOutdatedPackages(fileSystem, entryPointInfo.entryPoints);
    if (cleaned) {
      // If we had to clean up one or more packages then we must read in the entry-points again.
      entryPointInfo = finder.findEntryPoints();
    }

    const {entryPoints, invalidEntryPoints, graph} = entryPointInfo;
    logInvalidEntryPoints(logger, invalidEntryPoints);

    const unprocessableEntryPointPaths: string[] = [];
    // The tasks are partially ordered by virtue of the entry-points being partially ordered too.
    const tasks: PartiallyOrderedTasks = [] as any;

    for (const entryPoint of entryPoints) {
      const packageJson = entryPoint.packageJson;
      const hasProcessedTypings = hasBeenProcessed(packageJson, 'typings');
      const {propertiesToProcess, equivalentPropertiesMap} =
          getPropertiesToProcess(packageJson, supportedPropertiesToConsider, compileAllFormats);
      let processDts = !hasProcessedTypings;

      if (propertiesToProcess.length === 0) {
        // This entry-point is unprocessable (i.e. there is no format property that is of interest
        // and can be processed). This will result in an error, but continue looping over
        // entry-points in order to collect all unprocessable ones and display a more informative
        // error.
        unprocessableEntryPointPaths.push(entryPoint.path);
        continue;
      }

      for (const formatProperty of propertiesToProcess) {
        if (hasBeenProcessed(entryPoint.packageJson, formatProperty)) {
          // The format-path which the property maps to is already processed - nothing to do.
          logger.debug(`Skipping ${entryPoint.name} : ${formatProperty} (already compiled).`);
          continue;
        }

        const formatPropertiesToMarkAsProcessed = equivalentPropertiesMap.get(formatProperty)!;
        tasks.push({entryPoint, formatProperty, formatPropertiesToMarkAsProcessed, processDts});

        // Only process typings for the first property (if not already processed).
        processDts = false;
      }
    }

    // Check for entry-points for which we could not process any format at all.
    if (unprocessableEntryPointPaths.length > 0) {
      throw new Error(
          'Unable to process any formats for the following entry-points (tried ' +
          `${propertiesToConsider.join(', ')}): ` +
          unprocessableEntryPointPaths.map(path => `\n  - ${path}`).join(''));
    }

    const duration = Math.round((Date.now() - startTime) / 100) / 10;
    logger.debug(
        `Analyzed ${entryPoints.length} entry-points in ${duration}s. ` +
        `(Total tasks: ${tasks.length})`);

    return getTaskQueue(logger, inParallel, tasks, graph);
  };

  // The function for creating the `compile()` function.
  const createCompileFn: CreateCompileFn = onTaskCompleted => {
    const fileWriter = getFileWriter(
        fileSystem, logger, pkgJsonUpdater, createNewEntryPointFormats, errorOnFailedEntryPoint);
    const transformer = new Transformer(fileSystem, logger, tsConfig);

    return (task: Task) => {
      const {entryPoint, formatProperty, formatPropertiesToMarkAsProcessed, processDts} = task;

      const isCore = entryPoint.name === '@angular/core';  // Are we compiling the Angular core?
      const packageJson = entryPoint.packageJson;
      const formatPath = packageJson[formatProperty];
      const format = getEntryPointFormat(fileSystem, entryPoint, formatProperty);

      // All properties listed in `propertiesToProcess` are guaranteed to point to a format-path
      // (i.e. they are defined in `entryPoint.packageJson`). Furthermore, they are also guaranteed
      // to be among `SUPPORTED_FORMAT_PROPERTIES`.
      // Based on the above, `formatPath` should always be defined and `getEntryPointFormat()`
      // should always return a format here (and not `undefined`).
      if (!formatPath || !format) {
        // This should never happen.
        throw new Error(
            `Invariant violated: No format-path or format for ${entryPoint.path} : ` +
            `${formatProperty} (formatPath: ${formatPath} | format: ${format})`);
      }

      const bundle = makeEntryPointBundle(
          fileSystem, entryPoint, formatPath, isCore, format, processDts, pathMappings, true,
          enableI18nLegacyMessageIdFormat);

      logger.info(`Compiling ${entryPoint.name} : ${formatProperty} as ${format}`);

      const result = transformer.transform(bundle);
      if (result.success) {
        if (result.diagnostics.length > 0) {
          logger.warn(replaceTsWithNgInErrors(
              ts.formatDiagnosticsWithColorAndContext(result.diagnostics, bundle.src.host)));
        }
        fileWriter.writeBundle(bundle, result.transformedFiles, formatPropertiesToMarkAsProcessed);

        logger.debug(`  Successfully compiled ${entryPoint.name} : ${formatProperty}`);

        onTaskCompleted(task, TaskProcessingOutcome.Processed, null);
      } else {
        const errors = replaceTsWithNgInErrors(
            ts.formatDiagnosticsWithColorAndContext(result.diagnostics, bundle.src.host));
        onTaskCompleted(task, TaskProcessingOutcome.Failed, `compilation errors:\n${errors}`);
      }
    };
  };

  // The executor for actually planning and getting the work done.
  const createTaskCompletedCallback =
      getCreateTaskCompletedCallback(pkgJsonUpdater, errorOnFailedEntryPoint, logger, fileSystem);
  const executor = getExecutor(
      async, inParallel, logger, pkgJsonUpdater, fileSystem, createTaskCompletedCallback);

  return executor.execute(analyzeEntryPoints, createCompileFn);
}

function ensureSupportedProperties(properties: string[]): EntryPointJsonProperty[] {
  // Short-circuit the case where `properties` has fallen back to the default value:
  // `SUPPORTED_FORMAT_PROPERTIES`
  if (properties === SUPPORTED_FORMAT_PROPERTIES) return SUPPORTED_FORMAT_PROPERTIES;

  const supportedProperties: EntryPointJsonProperty[] = [];

  for (const prop of properties as EntryPointJsonProperty[]) {
    if (SUPPORTED_FORMAT_PROPERTIES.indexOf(prop) !== -1) {
      supportedProperties.push(prop);
    }
  }

  if (supportedProperties.length === 0) {
    throw new Error(
        `No supported format property to consider among [${properties.join(', ')}]. ` +
        `Supported properties: ${SUPPORTED_FORMAT_PROPERTIES.join(', ')}`);
  }

  return supportedProperties;
}

function getPackageJsonUpdater(inParallel: boolean, fs: FileSystem): PackageJsonUpdater {
  const directPkgJsonUpdater = new DirectPackageJsonUpdater(fs);
  return inParallel ? new ClusterPackageJsonUpdater(directPkgJsonUpdater) : directPkgJsonUpdater;
}

function getFileWriter(
    fs: FileSystem, logger: Logger, pkgJsonUpdater: PackageJsonUpdater,
    createNewEntryPointFormats: boolean, errorOnFailedEntryPoint: boolean): FileWriter {
  return createNewEntryPointFormats ?
      new NewEntryPointFileWriter(fs, logger, errorOnFailedEntryPoint, pkgJsonUpdater) :
      new InPlaceFileWriter(fs, logger, errorOnFailedEntryPoint);
}

function getTaskQueue(
    logger: Logger, inParallel: boolean, tasks: PartiallyOrderedTasks,
    graph: DepGraph<EntryPoint>): TaskQueue {
  const dependencies = computeTaskDependencies(tasks, graph);
  return inParallel ? new ParallelTaskQueue(logger, tasks, dependencies) :
                      new SerialTaskQueue(logger, tasks, dependencies);
}

function getCreateTaskCompletedCallback(
    pkgJsonUpdater: PackageJsonUpdater, errorOnFailedEntryPoint: boolean, logger: Logger,
    fileSystem: FileSystem): CreateTaskCompletedCallback {
  return taskQueue => composeTaskCompletedCallbacks({
           [TaskProcessingOutcome.Processed]: createMarkAsProcessedHandler(pkgJsonUpdater),
           [TaskProcessingOutcome.Failed]:
               errorOnFailedEntryPoint ? createThrowErrorHandler(fileSystem) :
                                         createLogErrorHandler(logger, fileSystem, taskQueue),
         });
}

function getExecutor(
    async: boolean, inParallel: boolean, logger: Logger, pkgJsonUpdater: PackageJsonUpdater,
    fileSystem: FileSystem, createTaskCompletedCallback: CreateTaskCompletedCallback): Executor {
  const lockFile = new LockFileWithChildProcess(fileSystem, logger);
  if (async) {
    // Execute asynchronously (either serially or in parallel)
    const locker = new AsyncLocker(lockFile, logger, 500, 50);
    if (inParallel) {
      // Execute in parallel. Use up to 8 CPU cores for workers, always reserving one for master.
      const workerCount = Math.min(8, os.cpus().length - 1);
      return new ClusterExecutor(
          workerCount, logger, pkgJsonUpdater, locker, createTaskCompletedCallback);
    } else {
      // Execute serially, on a single thread (async).
      return new SingleProcessExecutorAsync(logger, locker, createTaskCompletedCallback);
    }
  } else {
    // Execute serially, on a single thread (sync).
    return new SingleProcessExecutorSync(
        logger, new SyncLocker(lockFile), createTaskCompletedCallback);
  }
}

function getDependencyResolver(
    fileSystem: FileSystem, logger: Logger, config: NgccConfiguration,
    pathMappings: PathMappings|undefined): DependencyResolver {
  const moduleResolver = new ModuleResolver(fileSystem, pathMappings);
  const esmDependencyHost = new EsmDependencyHost(fileSystem, moduleResolver);
  const umdDependencyHost = new UmdDependencyHost(fileSystem, moduleResolver);
  const commonJsDependencyHost = new CommonJsDependencyHost(fileSystem, moduleResolver);
  const dtsDependencyHost = new DtsDependencyHost(fileSystem, pathMappings);
  return new DependencyResolver(
      fileSystem, logger, config, {
        esm5: esmDependencyHost,
        esm2015: esmDependencyHost,
        umd: umdDependencyHost,
        commonjs: commonJsDependencyHost
      },
      dtsDependencyHost);
}

function getEntryPointFinder(
    fs: FileSystem, logger: Logger, resolver: DependencyResolver, config: NgccConfiguration,
    entryPointManifest: EntryPointManifest, basePath: AbsoluteFsPath,
    absoluteTargetEntryPointPath: AbsoluteFsPath|null,
    pathMappings: PathMappings|undefined): EntryPointFinder {
  if (absoluteTargetEntryPointPath !== null) {
    return new TargetedEntryPointFinder(
        fs, config, logger, resolver, basePath, absoluteTargetEntryPointPath, pathMappings);
  } else {
    return new DirectoryWalkerEntryPointFinder(
        fs, config, logger, resolver, entryPointManifest, basePath, pathMappings);
  }
}

function logInvalidEntryPoints(logger: Logger, invalidEntryPoints: InvalidEntryPoint[]): void {
  invalidEntryPoints.forEach(invalidEntryPoint => {
    logger.debug(
        `Invalid entry-point ${invalidEntryPoint.entryPoint.path}.`,
        `It is missing required dependencies:\n` +
            invalidEntryPoint.missingDependencies.map(dep => ` - ${dep}`).join('\n'));
  });
}

/**
 * This function computes and returns the following:
 * - `propertiesToProcess`: An (ordered) list of properties that exist and need to be processed,
 *   based on the provided `propertiesToConsider`, the properties in `package.json` and their
 *   corresponding format-paths. NOTE: Only one property per format-path needs to be processed.
 * - `equivalentPropertiesMap`: A mapping from each property in `propertiesToProcess` to the list of
 *   other format properties in `package.json` that need to be marked as processed as soon as the
 *   former has been processed.
 */
function getPropertiesToProcess(
    packageJson: EntryPointPackageJson, propertiesToConsider: EntryPointJsonProperty[],
    compileAllFormats: boolean): {
  propertiesToProcess: EntryPointJsonProperty[];
  equivalentPropertiesMap: Map<EntryPointJsonProperty, EntryPointJsonProperty[]>;
} {
  const formatPathsToConsider = new Set<string>();

  const propertiesToProcess: EntryPointJsonProperty[] = [];
  for (const prop of propertiesToConsider) {
    const formatPath = packageJson[prop];

    // Ignore properties that are not defined in `package.json`.
    if (typeof formatPath !== 'string') continue;

    // Ignore properties that map to the same format-path as a preceding property.
    if (formatPathsToConsider.has(formatPath)) continue;

    // Process this property, because it is the first one to map to this format-path.
    formatPathsToConsider.add(formatPath);
    propertiesToProcess.push(prop);

    // If we only need one format processed, there is no need to process any more properties.
    if (!compileAllFormats) break;
  }

  const formatPathToProperties: {[formatPath: string]: EntryPointJsonProperty[]} = {};
  for (const prop of SUPPORTED_FORMAT_PROPERTIES) {
    const formatPath = packageJson[prop];

    // Ignore properties that are not defined in `package.json`.
    if (typeof formatPath !== 'string') continue;

    // Ignore properties that do not map to a format-path that will be considered.
    if (!formatPathsToConsider.has(formatPath)) continue;

    // Add this property to the map.
    const list = formatPathToProperties[formatPath] || (formatPathToProperties[formatPath] = []);
    list.push(prop);
  }

  const equivalentPropertiesMap = new Map<EntryPointJsonProperty, EntryPointJsonProperty[]>();
  for (const prop of propertiesToConsider) {
    const formatPath = packageJson[prop]!;
    const equivalentProperties = formatPathToProperties[formatPath];
    equivalentPropertiesMap.set(prop, equivalentProperties);
  }

  return {propertiesToProcess, equivalentPropertiesMap};
}
