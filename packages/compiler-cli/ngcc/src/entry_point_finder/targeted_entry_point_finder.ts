/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, FileSystem} from '../../../src/ngtsc/file_system';
import {Logger} from '../../../src/ngtsc/logging';
import {DependencyResolver, SortedEntryPointsInfo} from '../dependencies/dependency_resolver';
import {hasBeenProcessed} from '../packages/build_marker';
import {NgccConfiguration} from '../packages/configuration';
import {EntryPointJsonProperty} from '../packages/entry_point';
import {PathMappings} from '../path_mappings';

import {TracingEntryPointFinder} from './tracing_entry_point_finder';

/**
 * An EntryPointFinder that starts from a target entry-point and only finds
 * entry-points that are dependencies of the target.
 *
 * This is faster than searching the entire file-system for all the entry-points,
 * and is used primarily by the CLI integration.
 */
export class TargetedEntryPointFinder extends TracingEntryPointFinder {
  constructor(
      fs: FileSystem, config: NgccConfiguration, logger: Logger, resolver: DependencyResolver,
      basePath: AbsoluteFsPath, pathMappings: PathMappings|undefined,
      private targetPath: AbsoluteFsPath) {
    super(fs, config, logger, resolver, basePath, pathMappings);
  }

  findEntryPoints(): SortedEntryPointsInfo {
    const entryPoints = super.findEntryPoints();

    const invalidTarget =
        entryPoints.invalidEntryPoints.find(i => i.entryPoint.path === this.targetPath);
    if (invalidTarget !== undefined) {
      throw new Error(
          `The target entry-point "${invalidTarget.entryPoint.name}" has missing dependencies:\n` +
          invalidTarget.missingDependencies.map(dep => ` - ${dep}\n`).join(''));
    }
    return entryPoints;
  }

  targetNeedsProcessingOrCleaning(
      propertiesToConsider: EntryPointJsonProperty[], compileAllFormats: boolean): boolean {
    const entryPoint = this.getEntryPoint(this.targetPath);
    if (entryPoint === null || !entryPoint.compiledByAngular) {
      return false;
    }

    for (const property of propertiesToConsider) {
      if (entryPoint.packageJson[property]) {
        // Here is a property that should be processed.
        if (!hasBeenProcessed(entryPoint.packageJson, property)) {
          return true;
        }
        if (!compileAllFormats) {
          // This property has been processed, and we only need one.
          return false;
        }
      }
    }
    // All `propertiesToConsider` that appear in this entry-point have been processed.
    // In other words, there were no properties that need processing.
    return false;
  }

  protected getInitialEntryPointPaths(): AbsoluteFsPath[] {
    return [this.targetPath];
  }
}
