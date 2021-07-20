/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, ReadonlyFileSystem} from '../../../src/ngtsc/file_system';
import {Logger} from '../../../src/ngtsc/logging';
import {ParsedConfiguration} from '../../../src/perform_compile';

import {createDependencyInfo, EntryPointWithDependencies} from '../dependencies/dependency_host';
import {DependencyResolver} from '../dependencies/dependency_resolver';
import {EsmDependencyHost} from '../dependencies/esm_dependency_host';
import {ModuleResolver} from '../dependencies/module_resolver';
import {NgccConfiguration} from '../packages/configuration';
import {EntryPointManifest} from '../packages/entry_point_manifest';
import {getPathMappingsFromTsConfig} from '../path_mappings';

import {EntryPointCollector} from './entry_point_collector';
import {TracingEntryPointFinder} from './tracing_entry_point_finder';
import {trackDuration} from './utils';

/**
 * An EntryPointFinder that starts from the files in the program defined by the given tsconfig.json
 * and only returns entry-points that are dependencies of these files.
 *
 * This is faster than searching the entire file-system for all the entry-points,
 * and is used primarily by the CLI integration.
 */
export class ProgramBasedEntryPointFinder extends TracingEntryPointFinder {
  private entryPointsWithDependencies: Map<AbsoluteFsPath, EntryPointWithDependencies>|null = null;

  constructor(
      fs: ReadonlyFileSystem, config: NgccConfiguration, logger: Logger,
      resolver: DependencyResolver, private entryPointCollector: EntryPointCollector,
      private entryPointManifest: EntryPointManifest, basePath: AbsoluteFsPath,
      private tsConfig: ParsedConfiguration, projectPath: AbsoluteFsPath) {
    super(
        fs, config, logger, resolver, basePath,
        getPathMappingsFromTsConfig(fs, tsConfig, projectPath));
  }

  /**
   * Return an array containing the external import paths that were extracted from the source-files
   * of the program defined by the tsconfig.json.
   */
  protected override getInitialEntryPointPaths(): AbsoluteFsPath[] {
    const moduleResolver = new ModuleResolver(this.fs, this.pathMappings, ['', '.ts', '/index.ts']);
    const host = new EsmDependencyHost(this.fs, moduleResolver);
    const dependencies = createDependencyInfo();
    const rootFiles = this.tsConfig.rootNames.map(rootName => this.fs.resolve(rootName));
    this.logger.debug(
        `Using the program from ${this.tsConfig.project} to seed the entry-point finding.`);
    this.logger.debug(
        `Collecting dependencies from the following files:` + rootFiles.map(file => `\n- ${file}`));
    host.collectDependenciesInFiles(rootFiles, dependencies);
    return Array.from(dependencies.dependencies);
  }

  /**
   * For the given `entryPointPath`, compute, or retrieve, the entry-point information, including
   * paths to other entry-points that this entry-point depends upon.
   *
   * In this entry-point finder, we use the `EntryPointManifest` to avoid computing each
   * entry-point's dependencies in the case that this had been done previously.
   *
   * @param entryPointPath the path to the entry-point whose information and dependencies are to be
   *     retrieved or computed.
   *
   * @returns the entry-point and its dependencies or `null` if the entry-point is not compiled by
   *     Angular or cannot be determined.
   */
  protected override getEntryPointWithDeps(entryPointPath: AbsoluteFsPath):
      EntryPointWithDependencies|null {
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
      for (const basePath of this.getBasePaths()) {
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
