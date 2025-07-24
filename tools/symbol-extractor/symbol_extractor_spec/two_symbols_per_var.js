/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

!(function () {
  'use strict';
  // tslint:disable-next-line:no-console
  console.log('Hello, Alice in Wonderland');
  var A = (function () {
      function A() {}
      return (
        (A.prototype.a = function () {
          return document.a;
        }),
        A
      );
    })(),
    B = (function () {
      function B() {}
      return (
        (B.prototype.b = function () {
          return window.b;
        }),
        B
      );
    })();
  var no_initializer;
  console.error(new A().a(), new B().b());
})();
