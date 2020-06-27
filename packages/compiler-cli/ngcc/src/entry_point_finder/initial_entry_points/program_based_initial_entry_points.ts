/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, FileSystem} from '../../../../src/ngtsc/file_system';
import {Logger} from '../../../../src/ngtsc/logging';
import {ParsedConfiguration} from '../../../../src/perform_compile';

import {createDependencyInfo} from '../../dependencies/dependency_host';
import {EsmDependencyHost} from '../../dependencies/esm_dependency_host';
import {ModuleResolver} from '../../dependencies/module_resolver';
import {getPathMappingsFromTsConfig} from '../../path_mappings';

import {InitialEntryPoints} from './interface';

export class ProgramBasedInitialEntryPoints implements InitialEntryPoints {
  constructor(
      private fs: FileSystem, private logger: Logger, private tsConfig: ParsedConfiguration,
      private projectPath: AbsoluteFsPath) {}

  /**
   * Return an array containing the external import paths that were extracted from the source-files
   * of the program defined by the tsconfig.json.
   */
  getInitialEntryPointPaths(): AbsoluteFsPath[] {
    const pathMappings = getPathMappingsFromTsConfig(this.tsConfig, this.projectPath);
    const moduleResolver = new ModuleResolver(this.fs, pathMappings, ['', '.ts', '/index.ts']);
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
