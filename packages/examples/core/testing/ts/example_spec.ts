/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// Import the "fake_async" example that registers tests which are shown as examples. These need
// to be valid tests, so we run them here. Note that we need to add this layer of abstraction here
// because the "jasmine_test" rule only picks up test files with the "_spec.ts" file suffix.
declare const Zone: any;
declare const require: any;
const ProxyZoneSpec: {new (): any} = Zone['ProxyZoneSpec'];
const proxyZone = Zone.root.fork(new ProxyZoneSpec());
const originalIt = it;
(globalThis as any).it = function (desc: string, fn: any) {
  return originalIt(desc, function (this: any) {
    return proxyZone.run(fn, this, arguments as any);
  });
};

require('./fake_async');
