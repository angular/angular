/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, FileSystem} from '../../../src/ngtsc/file_system';
import {Logger} from '../../../src/ngtsc/logging';
import {ParsedConfiguration} from '../../../src/perform_compile';
import {DependencyResolver} from '../dependencies/dependency_resolver';
import {EntryPointManifest} from '../packages/entry_point_manifest';
import {getPathMappingsFromTsConfig} from '../path_mappings';

import {BasePaths} from './base_paths';
import {EntryPointCollector} from './entry_point_collector';
import {DirectoryWalkedEntryPointsWithDeps} from './entry_points_with_deps/directory_walked_entry_points_with_deps';
import {ProgramBasedInitialEntryPoints} from './initial_entry_points/program_based_initial_entry_points';
import {TracingEntryPointFinder} from './tracing_entry_point_finder';

/**
 * An EntryPointFinder that starts from the files in the program defined by the given tsconfig.json
 * and only returns entry-points that are dependencies of these files.
 *
 * This is faster than searching the entire file-system for all the entry-points,
 * and is used primarily by the CLI integration.
 */
export class ProgramBasedEntryPointFinder extends TracingEntryPointFinder {
  constructor(
      fs: FileSystem, logger: Logger, resolver: DependencyResolver,
      entryPointCollector: EntryPointCollector, entryPointManifest: EntryPointManifest,
      sourceDirectory: AbsoluteFsPath, basePaths: BasePaths, tsConfig: ParsedConfiguration,
      projectPath: AbsoluteFsPath) {
    const pathMappings = getPathMappingsFromTsConfig(tsConfig, projectPath);
    super(
        resolver, new ProgramBasedInitialEntryPoints(fs, logger, tsConfig, projectPath),
        new DirectoryWalkedEntryPointsWithDeps(
            logger, entryPointCollector, entryPointManifest, sourceDirectory, basePaths,
            pathMappings));
  }
}
