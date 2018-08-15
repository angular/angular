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
import '../lib/common/to-string';
import '../lib/browser/api-util';
import '../lib/browser/browser-legacy';
import '../lib/browser/browser';
import '../lib/browser/canvas';
import '../lib/common/fetch';
import '../lib/browser/webapis-user-media';
import '../lib/browser/webapis-media-query';
import '../lib/testing/zone-testing';
import '../lib/zone-spec/task-tracking';
import '../lib/zone-spec/wtf';
import '../lib/extra/cordova';
import '../lib/testing/promise-testing';
import '../lib/testing/async-testing';
import '../lib/testing/fake-async';
import '../lib/browser/webapis-resize-observer';
import '../lib/rxjs/rxjs-fake-async';
