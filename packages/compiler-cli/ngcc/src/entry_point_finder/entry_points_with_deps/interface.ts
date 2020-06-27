/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath} from '../../../../src/ngtsc/file_system';
import {EntryPointWithDependencies} from '../../dependencies/dependency_host';

export interface EntryPointsWithDeps {
  getEntryPointWithDeps(entryPointPath: AbsoluteFsPath): EntryPointWithDependencies|null;
}
