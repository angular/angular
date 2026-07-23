/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';

describe('selectorless', () => {
  // TODO: this is an example to show that AoT and the dependency resolution work.
  // It should be deleted once we start writing real tests for the runtime behavior.
  it('should compile selectorless component', () => {
    @Component({template: 'hello'})
    class Dep {}

    @Component({template: '<Dep/>'})
    class App {}

    expect(() => TestBed.createComponent(App)).not.toThrow();
  });
});
