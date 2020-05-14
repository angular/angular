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

import {createDependencyInfo} from '../dependencies/dependency_host';
import {DependencyResolver} from '../dependencies/dependency_resolver';
import {EsmDependencyHost} from '../dependencies/esm_dependency_host';
import {ModuleResolver} from '../dependencies/module_resolver';
import {NgccConfiguration} from '../packages/configuration';
import {getPathMappingsFromTsConfig} from '../path_mappings';

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
      fs: FileSystem, config: NgccConfiguration, logger: Logger, resolver: DependencyResolver,
      basePath: AbsoluteFsPath, private tsConfig: ParsedConfiguration,
      projectPath: AbsoluteFsPath) {
    super(
        fs, config, logger, resolver, basePath, getPathMappingsFromTsConfig(tsConfig, projectPath));
  }

  protected getInitialEntryPointPaths(): AbsoluteFsPath[] {
    const moduleResolver = new ModuleResolver(this.fs, this.pathMappings, ['', '.ts', '/index.ts']);
    const host = new EsmDependencyHost(this.fs, moduleResolver);
    const dependencies = createDependencyInfo();
    this.logger.debug(
        `Using the program from ${this.tsConfig.project} to seed the entry-point finding.`);
    this.logger.debug(
        `Collecting dependencies from the following files:` +
        this.tsConfig.rootNames.map(file => `\n- ${file}`));
    this.tsConfig.rootNames.forEach(rootName => {
      host.collectDependencies(this.fs.resolve(rootName), dependencies);
    });
    return Array.from(dependencies.dependencies);
  }
}