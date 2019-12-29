/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
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

// Must be loaded before zone loads, so that zone can detect WTF.
import './node-env-setup';
import './test_fake_polyfill';

// Setup tests for Zone without microtask support
import '../lib/node/rollup-main';
require('@bazel/jasmine').boot();
import './test-env-setup-jasmine-no-patch-clock';
// Zone symbol prefix is set to '__zone_symbol2__' in node-env-setup.ts.
if (typeof global !== 'undefined' &&
    (global as any)['__zone_symbol_test__fakeAsyncAutoFakeAsyncWhenClockPatched'] !== false) {
  (global as any)['__zone_symbol_test__fakeAsyncAutoFakeAsyncWhenClockPatched'] = true;
}

import './wtf_mock';
import '../lib/testing/zone-testing';
import '../lib/zone-spec/task-tracking';
import '../lib/zone-spec/wtf';
import '../lib/rxjs/rxjs';
import '../lib/rxjs/rxjs-fake-async';
import '../lib/jasmine/jasmine';
