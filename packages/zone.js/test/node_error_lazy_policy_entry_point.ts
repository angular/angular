/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// bootstrap the bazel require patch since this bootstrap script is loaded with
// `--node_options=--require=$(rlocation $(location script.js))`
if (process.env['BAZEL_NODE_RUNFILES_HELPER']) {
  require(process.env['BAZEL_NODE_RUNFILES_HELPER'] as string).patchRequire();
}

process.env['errorpolicy'] = (global as any)['__Zone_Error_BlacklistedStackFrames_policy'] = 'lazy';
import './node_error_entry_point';
