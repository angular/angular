/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Options for Bazel Builder
 */
export interface Schema {
  /**
   * Common commands supported by Bazel.
   */
  bazelCommand: BazelCommand;
  /**
   * If true, leave Bazel files on disk after running command.
   */
  leaveBazelFilesOnDisk?: boolean;
  /**
   * Target to be executed under Bazel.
   */
  targetLabel: string;
  /**
   * If true, watch the filesystem using ibazel.
   */
  watch?: boolean;
}

/**
 * Common commands supported by Bazel.
 */
export enum BazelCommand {
  Build = 'build',
  Run = 'run',
  Test = 'test',
}
