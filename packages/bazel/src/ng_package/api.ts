/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Interface describing a file captured in the Bazel action.
 * https://docs.bazel.build/versions/main/skylark/lib/File.html.
 */
export interface BazelFileInfo {
  /** Execroot-relative path pointing to the file. */
  path: string;
  /** The path of this file relative to its root. e.g. omitting `bazel-out/<..>/bin`. */
  shortPath: string;
}

/** Interface describing an entry-point. */
export interface EntryPointInfo {
  /** ES2022 index file for the APF entry-point. */
  index: BazelFileInfo;
  /** Flat ES2022 ES module bundle file. */
  fesm2022Bundle: BazelFileInfo;
  /** Index type definition file for the APF entry-point. */
  typings: BazelFileInfo;
  /**
   * Whether the index or typing paths have been guessed. For entry-points built
   * through `ts_library`, there is no explicit setting that declares the entry-point
   * so the index file is guessed.
   */
  guessedPaths: boolean;
}

/** Interface capturing relevant metadata for packaging. */
export interface PackageMetadata {
  /** NPM package name of the output. */
  npmPackageName: string;
  /** Record of entry-points (including the primary one) and their info. */
  entryPoints: Record<string, EntryPointInfo>;
}
