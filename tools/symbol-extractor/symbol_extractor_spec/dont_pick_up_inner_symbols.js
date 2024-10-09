/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

!(function () {
  function A() {
    function ignoreA() {}
  }
  function B() {
    let ignoreB = {};
  }
  !function () {
    let ignoreC = {};
  };
})();
