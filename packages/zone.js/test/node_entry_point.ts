/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Must be loaded before zone loads, so that zone can detect WTF.
import './node-env-setup.js';
import './test_fake_polyfill.js';
// Setup tests for Zone without microtask support
import '../lib/node/rollup-main.js';

require('@bazel/jasmine').boot();
// Zone symbol prefix is set to '__zone_symbol2__' in node-env-setup.ts.
import './test-env-setup-jasmine.js';
if (typeof global !== 'undefined' &&
    (global as any)['__zone_symbol_test__fakeAsyncAutoFakeAsyncWhenClockPatched'] !== false) {
  (global as any)['__zone_symbol_test__fakeAsyncAutoFakeAsyncWhenClockPatched'] = true;
}

import './wtf_mock.js';
import '../lib/testing/zone-testing.js';
import '../lib/zone-spec/task-tracking.js';
import '../lib/zone-spec/wtf.js';
import '../lib/rxjs/rxjs.js';
import '../lib/rxjs/rxjs-fake-async.js';
import '../lib/jasmine/jasmine.js';
