/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, FileSystem} from '../../../src/ngtsc/file_system';
import {Logger} from '../../../src/ngtsc/logging';

import {DependencyResolver,} from '../dependencies/dependency_resolver';
import {EntryPointManifest} from '../packages/entry_point_manifest';
import {PathMappings} from '../path_mappings';

import {BasePaths} from './base_paths';
import {EntryPointCollector} from './entry_point_collector';
import {DirectoryWalkedEntryPointsWithDeps} from './entry_points_with_deps/directory_walked_entry_points_with_deps';
import {MultiInitialEntryPoints} from './initial_entry_points/multi_initial_entry_points';
import {TracingEntryPointFinder} from './tracing_entry_point_finder';

/**
 * An EntryPointFinder that starts from a list of target entry-points that are read from a JSON
 * file.
 *
 * The format of the preparsed entry-point file is a JSON array, where each item is a path to an
 * entry-point relative to the basePath. For example:
 *
 * ```
 * [
 *   "package-1/entry-point-1",
 *   "package-1/entry-point-2",
 *   "package-2/entry-point",
 *   "package-3",
 *   ...
 * ]
 * ```
 */
export class MultiTargetEntryPointFinder extends TracingEntryPointFinder {
  constructor(
      fs: FileSystem, logger: Logger, resolver: DependencyResolver,
      pathMappings: PathMappings|undefined, entryPointCollector: EntryPointCollector,
      entryPointManifest: EntryPointManifest, sourceDirectory: AbsoluteFsPath, basePaths: BasePaths,
      entryPointListPath: AbsoluteFsPath) {
    super(
        resolver, new MultiInitialEntryPoints(fs, sourceDirectory, entryPointListPath),
        new DirectoryWalkedEntryPointsWithDeps(
            logger, entryPointCollector, entryPointManifest, sourceDirectory, basePaths,
            pathMappings));
  }
}
