/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="node" />

import * as os from 'os';

import {AbsoluteFsPath, FileSystem, resolve} from '../../src/ngtsc/file_system';

import {CommonJsDependencyHost} from './dependencies/commonjs_dependency_host';
import {DependencyResolver} from './dependencies/dependency_resolver';
import {DtsDependencyHost} from './dependencies/dts_dependency_host';
import {EsmDependencyHost} from './dependencies/esm_dependency_host';
import {ModuleResolver} from './dependencies/module_resolver';
import {UmdDependencyHost} from './dependencies/umd_dependency_host';
import {DirectoryWalkerEntryPointFinder} from './entry_point_finder/directory_walker_entry_point_finder';
import {EntryPointFinder} from './entry_point_finder/interface';
import {TargetedEntryPointFinder} from './entry_point_finder/targeted_entry_point_finder';
import {getAnalyzeEntryPointsFn} from './execution/analyze_entry_points';
import {Executor} from './execution/api';
import {ClusterExecutor} from './execution/cluster/executor';
import {getCreateCompileFn} from './execution/create_compile_function';
import {SingleProcessExecutorAsync, SingleProcessExecutorSync} from './execution/single_process_executor';
import {CreateTaskCompletedCallback, TaskProcessingOutcome} from './execution/tasks/api';
import {composeTaskCompletedCallbacks, createLogErrorHandler, createMarkAsProcessedHandler, createThrowErrorHandler} from './execution/tasks/completion';
import {AsyncLocker} from './locking/async_locker';
import {LockFileWithChildProcess} from './locking/lock_file_with_child_process';
import {SyncLocker} from './locking/sync_locker';
import {Logger} from './logging/logger';
import {AsyncNgccOptions, getSharedSetup, NgccOptions, PathMappings, SyncNgccOptions} from './ngcc_options';
import {NgccConfiguration} from './packages/configuration';
import {EntryPointJsonProperty, SUPPORTED_FORMAT_PROPERTIES} from './packages/entry_point';
import {EntryPointManifest, InvalidatingEntryPointManifest} from './packages/entry_point_manifest';
import {FileWriter} from './writing/file_writer';
import {DirectPackageJsonUpdater, PackageJsonUpdater} from './writing/package_json_updater';

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
export function mainNgcc(options: NgccOptions): void|Promise<void> {
  const {
    basePath,
    targetEntryPointPath,
    propertiesToConsider,
    compileAllFormats,
    logger,
    pathMappings,
    async,
    errorOnFailedEntryPoint,
    enableI18nLegacyMessageIdFormat,
    invalidateEntryPointManifest,
    fileSystem,
    absBasePath,
    projectPath,
    tsConfig,
    getFileWriter,
  } = getSharedSetup(options);

  const config = new NgccConfiguration(fileSystem, projectPath);
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

  // Execute in parallel, if async execution is acceptable and there are more than 2 CPU cores.
  // (One CPU core is always reserved for the master process and we need at least 2 worker processes
  // in order to run tasks in parallel.)
  const inParallel = async && (os.cpus().length > 2);

  const analyzeEntryPoints = getAnalyzeEntryPointsFn(
      logger, finder, fileSystem, supportedPropertiesToConsider, compileAllFormats,
      propertiesToConsider, inParallel);

  // Create an updater that will actually write to disk.
  const pkgJsonUpdater = new DirectPackageJsonUpdater(fileSystem);
  const fileWriter = getFileWriter(pkgJsonUpdater);

  // The function for creating the `compile()` function.
  const createCompileFn = getCreateCompileFn(
      fileSystem, logger, fileWriter, enableI18nLegacyMessageIdFormat, tsConfig, pathMappings);

  // The executor for actually planning and getting the work done.
  const createTaskCompletedCallback =
      getCreateTaskCompletedCallback(pkgJsonUpdater, errorOnFailedEntryPoint, logger, fileSystem);
  const executor = getExecutor(
      async, inParallel, logger, fileWriter, pkgJsonUpdater, fileSystem,
      createTaskCompletedCallback);

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
    async: boolean, inParallel: boolean, logger: Logger, fileWriter: FileWriter,
    pkgJsonUpdater: PackageJsonUpdater, fileSystem: FileSystem,
    createTaskCompletedCallback: CreateTaskCompletedCallback): Executor {
  const lockFile = new LockFileWithChildProcess(fileSystem, logger);
  if (async) {
    // Execute asynchronously (either serially or in parallel)
    const locker = new AsyncLocker(lockFile, logger, 500, 50);
    if (inParallel) {
      // Execute in parallel. Use up to 8 CPU cores for workers, always reserving one for master.
      const workerCount = Math.min(8, os.cpus().length - 1);
      return new ClusterExecutor(
          workerCount, fileSystem, logger, fileWriter, pkgJsonUpdater, locker,
          createTaskCompletedCallback);
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
