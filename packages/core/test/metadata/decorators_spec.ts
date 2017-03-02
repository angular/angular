/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive} from '@angular/core';
import {reflector} from '@angular/core/src/reflection/reflection';
import {describe, expect, it} from '@angular/core/testing/src/testing_internal';

export function main() {
  describe('es5 decorators', () => {
    it('should declare directive class', () => {
      const MyDirective = Directive({}).Class({constructor: function() { this.works = true; }});
      expect(new MyDirective().works).toEqual(true);
    });

    it('should declare Component class', () => {
      const MyComponent = Component({}).Class({constructor: function() { this.works = true; }});
      expect(new MyComponent().works).toEqual(true);
    });

    it('should create type in ES5', () => {
      class MyComponent {};
      let as: any /** TODO #9100 */;
      (<any>MyComponent).annotations = as = Component({});
      expect(reflector.annotations(MyComponent)).toEqual(as.annotations);
    });
  });
}
