/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AbsoluteFsPath} from '../../../src/ngtsc/path';

export interface DependencyHost {
  findDependencies(entryPointPath: AbsoluteFsPath): DependencyInfo;
}

export interface DependencyInfo {
  dependencies: Set<AbsoluteFsPath>;
  missing: Set<string>;
  deepImports: Set<string>;
}
