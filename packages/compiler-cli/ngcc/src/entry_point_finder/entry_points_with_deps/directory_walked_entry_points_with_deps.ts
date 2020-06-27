/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath} from '../../../../src/ngtsc/file_system';
import {Logger} from '../../../../src/ngtsc/logging';
import {EntryPointWithDependencies} from '../../dependencies/dependency_host';
import {EntryPointManifest} from '../../packages/entry_point_manifest';
import {PathMappings} from '../../path_mappings';
import {BasePaths} from '../base_paths';
import {EntryPointCollector} from '../entry_point_collector';
import {trackDuration} from '../utils';

import {EntryPointsWithDeps} from './interface';

export class DirectoryWalkedEntryPointsWithDeps implements EntryPointsWithDeps {
  private entryPointsWithDependencies: Map<AbsoluteFsPath, EntryPointWithDependencies>|null = null;

  constructor(
      private logger: Logger, private entryPointCollector: EntryPointCollector,
      private entryPointManifest: EntryPointManifest, private sourceDirectory: AbsoluteFsPath,
      private basePaths: BasePaths, private pathMappings: PathMappings|undefined) {}

  getEntryPointWithDeps(entryPointPath: AbsoluteFsPath): EntryPointWithDependencies|null {
    const entryPoints = this.findOrLoadEntryPoints();
    if (!entryPoints.has(entryPointPath)) {
      return null;
    }
    const entryPointWithDeps = entryPoints.get(entryPointPath)!;
    if (!entryPointWithDeps.entryPoint.compiledByAngular) {
      return null;
    }
    return entryPointWithDeps;
  }


  /**
   * Walk the base paths looking for entry-points or load this information from an entry-point
   * manifest, if available.
   */
  private findOrLoadEntryPoints(): Map<AbsoluteFsPath, EntryPointWithDependencies> {
    if (this.entryPointsWithDependencies === null) {
      const entryPointsWithDependencies = this.entryPointsWithDependencies =
          new Map<AbsoluteFsPath, EntryPointWithDependencies>();
      for (const basePath of this.basePaths.getBasePaths(this.sourceDirectory, this.pathMappings)) {
        const entryPoints = this.entryPointManifest.readEntryPointsUsingManifest(basePath) ||
            this.walkBasePathForPackages(basePath);
        for (const e of entryPoints) {
          entryPointsWithDependencies.set(e.entryPoint.path, e);
        }
      }
    }
    return this.entryPointsWithDependencies;
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
