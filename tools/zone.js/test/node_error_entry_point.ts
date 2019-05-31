/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Must be loaded before zone loads, so that zone can detect WTF.
import './wtf_mock';
import './test_fake_polyfill';

// Setup tests for Zone without microtask support
import '../lib/zone';
import '../lib/common/promise';
import '../lib/common/to-string';

if (typeof __karma__ !== 'undefined') {
  (global as any)['__Zone_Error_BlacklistedStackFrames_policy'] =
      (__karma__ as any).config.errorpolicy;
} else if (typeof process !== 'undefined') {
  (global as any)['__Zone_Error_BlacklistedStackFrames_policy'] = process.env.errorpolicy;
}

import '../lib/common/error-rewrite';
import '../lib/node/node';
import '../lib/zone-spec/async-test';
import '../lib/zone-spec/fake-async-test';
import '../lib/zone-spec/long-stack-trace';
import '../lib/zone-spec/proxy';
import '../lib/zone-spec/sync-test';
import '../lib/zone-spec/task-tracking';
import '../lib/zone-spec/wtf';
import '../lib/rxjs/rxjs';

import '../lib/testing/promise-testing';
// Setup test environment
import './test-env-setup-jasmine';

// List all tests here:
import './common/Error.spec';
