/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Load the Bazel Node runfiles helper script and patch the NodeJS module resolution. This is
// necessary to ensure that imports are properly resolved in Bazel. By default, the module
// resolution is patched in `nodejs_binary` targets when the main script loads, but since we
// --require boostrap scripts before the main script, this bootstrap script is loaded first so that
// subsequent bootstrap scripts can resolve their imports.
//
// We're in a valley with the runfiles support right now having removed the `bootstrap` attribute
// for rule_nodejs 1.0 but not applied the linker to run targets yet in rules_nodejs. In a near
// future rules_nodejs release, the runfiles helper won't be required as standard node module
// resolution works with the linker.
//
// We could have left the `bootstrap` attribute in for 1.0 and removed it for 2.0 but since we had
// an alternate approach that we're using here that isn't going to be broken in the future by the
// linker being added we decided to pull it for 1.0 so that we have fewer major breaking changes in
// 2.0.
if (process.env['BAZEL_NODE_RUNFILES_HELPER']) {
  require(process.env['BAZEL_NODE_RUNFILES_HELPER']).patchRequire();
}
