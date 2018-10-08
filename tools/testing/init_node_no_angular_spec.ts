/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// This hack is needed to get jasmine, node and zone working inside bazel.
// 1) we load `jasmine-core` which contains the ENV: it, describe etc...
const jasmineCore: any = require('jasmine-core');
// 2) We create an instance of `jasmine` ENV.
const patchedJasmine = jasmineCore.boot(jasmineCore);
// 3) Save the `jasmine` into global so that `zone.js/dist/jasmine-patch.js` can get a hold of it to
// patch it.
(global as any)['jasmine'] = patchedJasmine;
// 4) Change the `jasmine-core` to make sure that all subsequent jasmine's have the same ENV,
// otherwise the patch will not work.
//    This is needed since Bazel creates a new instance of jasmine and it's ENV and we want to make
//    sure it gets the same one.
jasmineCore.boot = function() {
  return patchedJasmine;
};

(global as any).isNode = true;
(global as any).isBrowser = false;
