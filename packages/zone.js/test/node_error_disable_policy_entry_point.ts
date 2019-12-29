/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

if (process.env['TEST_SRCDIR']) {
  // bootstrap the bazel require resolve patch since this
  // script is a bootstrap script loaded with --node_options=--require=...
  const path = require('path');
  require(path.posix.join(
      process.env['TEST_SRCDIR'], process.env['TEST_WORKSPACE'],
      (process.env['TEST_BINARY'] as string).replace(/\.(sh|bat)$/, '_loader.js'), ));
}

process.env['errorpolicy'] = (global as any)['__Zone_Error_BlacklistedStackFrames_policy'] =
    'disable';
import './node_error_entry_point';
