/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * This file is used to control if the default rendering pipeline should be `ViewEngine` or `Ivy`.
 *
 * Reexport from:
 * - `./ivy_switch_false` => Use `ViewEngine`.
 * - `./ivy_switch_true` => Use `Ivy`.
 *
 * This file is here for your IDE as well as for `google3`. The `bazel` build system
 * specifically excludes this file and instead generates a new file which is controlled by
 * command line:
 *
 * - `bazel build packages/core` => Use `ViewEngine`
 * - `bazel build packages/core --define=ivy=true` => Use `Ivy`
 *
 * See: `bazel build packages/core:ivy_switch` for more details.
 *
 * ## How to use this
 *
 * Use this mechanism to have the same symbol be aliased to different implementation.
 * 1) Create two implementations of a symbol (most likely a `function` or a `class`).
 * 2) Export the two implementation under same name in `./ivy_switch_false` and `./ivy_switch_false`
 *    respectively.
 * 3) Import the symbol from `./ivy_switch`. The imported symbol will that point to either the
 *    symbol in `./ivy_switch_false` and `./ivy_switch_false` depending on the compilation mode.
 */
export * from './ivy_switch_legacy';

// TODO(alxhub): debug why metadata doesn't properly propagate through this file.
