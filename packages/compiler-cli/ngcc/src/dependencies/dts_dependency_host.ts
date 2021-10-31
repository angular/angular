/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, ReadonlyFileSystem} from '../../../src/ngtsc/file_system';
import {PathMappings} from '../path_mappings';
import {EsmDependencyHost} from './esm_dependency_host';
import {ModuleResolver} from './module_resolver';

/**
 * Helper functions for computing dependencies via typings files.
 */
export class DtsDependencyHost extends EsmDependencyHost {
  constructor(fs: ReadonlyFileSystem, pathMappings?: PathMappings) {
    super(
        fs, new ModuleResolver(fs, pathMappings, ['', '.d.ts', '/index.d.ts', '.js', '/index.js']),
        false);
  }

  /**
   * Attempts to process the `importPath` directly and also inside `@types/...`.
   */
  protected override processImport(
      importPath: string, file: AbsoluteFsPath, dependencies: Set<AbsoluteFsPath>,
      missing: Set<string>, deepImports: Set<string>, alreadySeen: Set<AbsoluteFsPath>): boolean {
    return super.processImport(importPath, file, dependencies, missing, deepImports, alreadySeen) ||
        super.processImport(
            `@types/${importPath}`, file, dependencies, missing, deepImports, alreadySeen);
  }
}
