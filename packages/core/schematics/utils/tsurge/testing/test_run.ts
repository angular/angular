/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {MockFileSystem} from '../../../../../compiler-cli/src/ngtsc/file_system/testing';

/** Type describing results of a Tsurge migration test run. */
export interface TestRun<Stats> {
  /** File system that can be used to read migrated file contents. */
  fs: MockFileSystem;
  /** Function that can be invoked to compute migration statistics. */
  getStatistics: () => Promise<Stats>;
}
