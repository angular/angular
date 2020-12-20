/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// AMD module name is required so that this file can be loaded in the Karma tests.
/// <amd-module name="angular/packages/core/test/reflection/es5_downleveled_inheritance_fixture" />

class Parent {}

export class ChildNoCtor extends Parent {}
export class ChildWithCtor extends Parent {
  constructor() {
    super();
  }
}
export class ChildNoCtorPrivateProps extends Parent {
  x = 10;
}
