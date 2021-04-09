/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Options to configure the linking behavior.
 */
export interface LinkerOptions {
  /**
   * Whether to use source-mapping to compute the original source for external templates.
   * The default is `true`.
   */
  sourceMapping: boolean;

  /**
   * This option tells the linker to generate information used by a downstream JIT compiler.
   *
   * Specifically, in JIT mode, NgModule definitions must describe the `declarations`, `imports`,
   * `exports`, etc, which are otherwise not needed.
   */
  linkerJitMode: boolean;
}

/**
 * The default linker options to use if properties are not provided.
 */
export const DEFAULT_LINKER_OPTIONS: LinkerOptions = {
  sourceMapping: true,
  linkerJitMode: false,
};
