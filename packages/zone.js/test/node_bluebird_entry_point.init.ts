/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Must be loaded before zone loads, so that zone can detect WTF.
import './test_fake_polyfill';
// Setup tests for Zone without microtask support
import '../lib/zone';
import '../lib/common/promise';
import '../lib/common/to-string';
import '../lib/node/node';
// Setup test environment
import './test-env-setup-jasmine';
import './wtf_mock';
import '../lib/zone-spec/async-test';
import '../lib/zone-spec/fake-async-test';
import '../lib/zone-spec/long-stack-trace';
import '../lib/zone-spec/proxy';
import '../lib/zone-spec/sync-test';
import '../lib/zone-spec/task-tracking';
import '../lib/zone-spec/wtf';
import '../lib/rxjs/rxjs';
import '../lib/testing/promise-testing';

const globalErrors = (jasmine as any).GlobalErrors;
const symbol = Zone.__symbol__;
if (globalErrors && !(jasmine as any)[symbol('GlobalErrors')]) {
  (jasmine as any)[symbol('GlobalErrors')] = globalErrors;
  (jasmine as any).GlobalErrors = function() {
    const instance = new globalErrors();
    const originalInstall = instance.install;
    if (originalInstall && !instance[symbol('install')]) {
      instance[symbol('install')] = originalInstall;
      instance.install = function() {
        const originalHandlers = process.listeners('unhandledRejection');
        const r = originalInstall.apply(this, arguments);
        process.removeAllListeners('unhandledRejection');
        if (originalHandlers) {
          originalHandlers.forEach(h => process.on('unhandledRejection', h));
        }
        return r;
      };
    }
    return instance;
  };
}
