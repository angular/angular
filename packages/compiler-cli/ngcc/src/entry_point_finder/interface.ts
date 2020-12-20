/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {SortedEntryPointsInfo} from '../dependencies/dependency_resolver';

export interface EntryPointFinder {
  /**
   * Search for Angular package entry-points.
   */
  findEntryPoints(): SortedEntryPointsInfo;
}
