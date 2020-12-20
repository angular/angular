/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath} from '../../../src/ngtsc/file_system';
import {Logger} from '../../../src/ngtsc/logging';
import {EntryPointWithDependencies} from '../dependencies/dependency_host';
import {DependencyResolver, SortedEntryPointsInfo} from '../dependencies/dependency_resolver';
import {EntryPointManifest} from '../packages/entry_point_manifest';
import {PathMappings} from '../path_mappings';

import {EntryPointCollector} from './entry_point_collector';
import {EntryPointFinder} from './interface';
import {getBasePaths, trackDuration} from './utils';

/**
 * An EntryPointFinder that searches for all entry-points that can be found given a `basePath` and
 * `pathMappings`.
 */
export class DirectoryWalkerEntryPointFinder implements EntryPointFinder {
  private basePaths = getBasePaths(this.logger, this.sourceDirectory, this.pathMappings);
  constructor(
      private logger: Logger, private resolver: DependencyResolver,
      private entryPointCollector: EntryPointCollector,
      private entryPointManifest: EntryPointManifest, private sourceDirectory: AbsoluteFsPath,
      private pathMappings: PathMappings|undefined) {}

  /**
   * Search the `sourceDirectory`, and sub-directories, using `pathMappings` as necessary, to find
   * all package entry-points.
   */
  findEntryPoints(): SortedEntryPointsInfo {
    const unsortedEntryPoints: EntryPointWithDependencies[] = [];
    for (const basePath of this.basePaths) {
      const entryPoints = this.entryPointManifest.readEntryPointsUsingManifest(basePath) ||
          this.walkBasePathForPackages(basePath);
      entryPoints.forEach(e => unsortedEntryPoints.push(e));
    }
    return this.resolver.sortEntryPointsByDependency(unsortedEntryPoints);
  }

  /**
   * Search the `basePath` for possible Angular packages and entry-points.
   *
   * @param basePath The path at which to start the search.
   * @returns an array of `EntryPoint`s that were found within `basePath`.
   */
  walkBasePathForPackages(basePath: AbsoluteFsPath): EntryPointWithDependencies[] {
    this.logger.debug(
        `No manifest found for ${basePath} so walking the directories for entry-points.`);
    const entryPoints = trackDuration(
        () => this.entryPointCollector.walkDirectoryForPackages(basePath),
        duration => this.logger.debug(`Walking ${basePath} for entry-points took ${duration}s.`));
    this.entryPointManifest.writeEntryPointManifest(basePath, entryPoints);
    return entryPoints;
  }
}
