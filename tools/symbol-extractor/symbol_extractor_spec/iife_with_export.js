/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var fooBar = function(exports) {
  'use strict';
  // tslint:disable-next-line:no-console
  console.log('Hello, Alice in Wonderland');
  var A = function() {
    function A() {}
    A.prototype.a = function() { return document.a; };
    return A;
  }();
  // tslint:disable-next-line:no-console
  console.error(new A().a());
  exports.A = A;
  return exports;
}({});