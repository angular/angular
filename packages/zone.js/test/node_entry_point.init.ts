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
import './node-env-setup';
import './test_fake_polyfill';

// Setup tests for Zone without microtask support
import '../lib/node/rollup-main';

require('@bazel/jasmine').boot();
// Zone symbol prefix is set to '__zone_symbol2__' in node-env-setup.ts.
import './test-env-setup-jasmine';
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
