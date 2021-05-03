/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {DepGraph} from 'dependency-graph';

import {FileSystem} from '../../../src/ngtsc/file_system';
import {Logger} from '../../../src/ngtsc/logging';
import {InvalidEntryPoint} from '../dependencies/dependency_resolver';
import {EntryPointFinder} from '../entry_point_finder/interface';
import {ParallelTaskQueue} from '../execution/tasks/queues/parallel_task_queue';
import {SerialTaskQueue} from '../execution/tasks/queues/serial_task_queue';
import {computeTaskDependencies} from '../execution/tasks/utils';
import {hasBeenProcessed} from '../packages/build_marker';
import {EntryPoint, EntryPointJsonProperty, EntryPointPackageJson, SUPPORTED_FORMAT_PROPERTIES} from '../packages/entry_point';
import {cleanOutdatedPackages} from '../writing/cleaning/package_cleaner';

import {AnalyzeEntryPointsFn} from './api';
import {DtsProcessing, PartiallyOrderedTasks, TaskQueue} from './tasks/api';

/**
 * Create the function for performing the analysis of the entry-points.
 */
export function getAnalyzeEntryPointsFn(
    logger: Logger, finder: EntryPointFinder, fileSystem: FileSystem,
    supportedPropertiesToConsider: EntryPointJsonProperty[], typingsOnly: boolean,
    compileAllFormats: boolean, propertiesToConsider: string[],
    inParallel: boolean): AnalyzeEntryPointsFn {
  return () => {
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
      const {propertiesToProcess, equivalentPropertiesMap} = getPropertiesToProcess(
          packageJson, supportedPropertiesToConsider, compileAllFormats, typingsOnly);

      if (propertiesToProcess.length === 0) {
        // This entry-point is unprocessable (i.e. there is no format property that is of interest
        // and can be processed). This will result in an error, but continue looping over
        // entry-points in order to collect all unprocessable ones and display a more informative
        // error.
        unprocessableEntryPointPaths.push(entryPoint.path);
        continue;
      }

      const hasProcessedTypings = hasBeenProcessed(packageJson, 'typings');
      if (hasProcessedTypings && typingsOnly) {
        // Typings for this entry-point have already been processed and we're in typings-only mode,
        // so no task has to be created for this entry-point.
        logger.debug(`Skipping ${entryPoint.name} : typings have already been processed.`);
        continue;
      }
      let processDts = hasProcessedTypings ? DtsProcessing.No :
                                             typingsOnly ? DtsProcessing.Only : DtsProcessing.Yes;

      for (const formatProperty of propertiesToProcess) {
        if (hasBeenProcessed(entryPoint.packageJson, formatProperty)) {
          // The format-path which the property maps to is already processed - nothing to do.
          logger.debug(`Skipping ${entryPoint.name} : ${formatProperty} (already compiled).`);
          continue;
        }

        const formatPropertiesToMarkAsProcessed = equivalentPropertiesMap.get(formatProperty)!;
        tasks.push({entryPoint, formatProperty, formatPropertiesToMarkAsProcessed, processDts});

        // Only process typings for the first property (if not already processed).
        processDts = DtsProcessing.No;
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
    compileAllFormats: boolean, typingsOnly: boolean): {
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
    // If we are only processing typings then there should be no format properties to mark
    const equivalentProperties = typingsOnly ? [] : formatPathToProperties[formatPath];
    equivalentPropertiesMap.set(prop, equivalentProperties);
  }

  return {propertiesToProcess, equivalentPropertiesMap};
}

function getTaskQueue(
    logger: Logger, inParallel: boolean, tasks: PartiallyOrderedTasks,
    graph: DepGraph<EntryPoint>): TaskQueue {
  const dependencies = computeTaskDependencies(tasks, graph);
  return inParallel ? new ParallelTaskQueue(logger, tasks, dependencies) :
                      new SerialTaskQueue(logger, tasks, dependencies);
}
