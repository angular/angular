/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {FileSystem} from '../../../src/ngtsc/file_system';
import {PathMappings} from '../utils';
import {EsmDependencyHost} from './esm_dependency_host';
import {ModuleResolver} from './module_resolver';

/**
 * Helper functions for computing dependencies via typings files.
 */
export class DtsDependencyHost extends EsmDependencyHost {
  constructor(fs: FileSystem, pathMappings?: PathMappings) {
    super(fs, new ModuleResolver(fs, pathMappings, ['', '.d.ts', '/index.d.ts']));
  }
}
