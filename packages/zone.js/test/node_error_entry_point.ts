/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Must be loaded before zone loads, so that zone can detect WTF.
import './test_fake_polyfill.js';
// Setup tests for Zone without microtask support
import '../lib/zone.js';
import '../lib/common/promise.js';
import '../lib/common/to-string.js';

process.env['errorpolicy'] = (global as any)['__Zone_Error_ZoneJsInternalStackFrames_policy'] =
    'disable';
// Setup test environment
require('@bazel/jasmine').boot();
import './test-env-setup-jasmine.js';

import './wtf_mock.js';
import '../lib/common/error-rewrite.js';
import '../lib/node/node.js';
import '../lib/zone-spec/async-test.js';
import '../lib/zone-spec/fake-async-test.js';
import '../lib/zone-spec/long-stack-trace.js';
import '../lib/zone-spec/proxy.js';
import '../lib/zone-spec/sync-test.js';
import '../lib/zone-spec/task-tracking.js';
import '../lib/zone-spec/wtf.js';
import '../lib/rxjs/rxjs.js';

import '../lib/testing/promise-testing.js';
