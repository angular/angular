/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
if (typeof window !== 'undefined') {
  const zoneSymbol = (window as any).Zone.__symbol__;
  (window as any)['__Zone_enable_cross_context_check'] = true;
  (window as any)[zoneSymbol('fakeAsyncAutoFakeAsyncWhenClockPatched')] = true;
}
import '../lib/common/to-string.js';
import '../lib/browser/api-util.js';
import '../lib/browser/browser-legacy.js';
import '../lib/browser/browser.js';
import '../lib/browser/canvas.js';
import '../lib/common/fetch.js';
import '../lib/browser/webapis-user-media.js';
import '../lib/browser/webapis-media-query.js';
import '../lib/testing/zone-testing.js';
import '../lib/zone-spec/task-tracking.js';
import '../lib/zone-spec/wtf.js';
import '../lib/extra/cordova.js';
import '../lib/testing/promise-testing.js';
import '../lib/testing/async-testing.js';
import '../lib/testing/fake-async.js';
import '../lib/browser/webapis-resize-observer.js';
import '../lib/rxjs/rxjs-fake-async.js';
