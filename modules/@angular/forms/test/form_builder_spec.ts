/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {beforeEach, describe, expect, it} from '@angular/core/testing/testing_internal';
import {FormBuilder} from '@angular/forms';

export function main() {
  function syncValidator(_: any /** TODO #9100 */): any /** TODO #9100 */ { return null; }
  function asyncValidator(_: any /** TODO #9100 */) { return Promise.resolve(null); }

  describe('Form Builder', () => {
    let b: FormBuilder;

    beforeEach(() => { b = new FormBuilder(); });

    it('should create controls from a value', () => {
      var g = b.group({'login': 'some value'});

      expect(g.controls['login'].value).toEqual('some value');
    });

    it('should create controls from a boxed value', () => {
      const g = b.group({'login': {value: 'some value', disabled: true}});

      expect(g.controls['login'].value).toEqual('some value');
      expect(g.controls['login'].disabled).toEqual(true);
    });

    it('should create controls from an array', () => {
      var g = b.group(
          {'login': ['some value'], 'password': ['some value', syncValidator, asyncValidator]});

      expect(g.controls['login'].value).toEqual('some value');
      expect(g.controls['password'].value).toEqual('some value');
      expect(g.controls['password'].validator).toEqual(syncValidator);
      expect(g.controls['password'].asyncValidator).toEqual(asyncValidator);
    });

    it('should use controls', () => {
      var g = b.group({'login': b.control('some value', syncValidator, asyncValidator)});

      expect(g.controls['login'].value).toEqual('some value');
      expect(g.controls['login'].validator).toBe(syncValidator);
      expect(g.controls['login'].asyncValidator).toBe(asyncValidator);
    });

    it('should create groups with a custom validator', () => {
      var g = b.group(
          {'login': 'some value'}, {'validator': syncValidator, 'asyncValidator': asyncValidator});

      expect(g.validator).toBe(syncValidator);
      expect(g.asyncValidator).toBe(asyncValidator);
    });

    it('should create control arrays', () => {
      var c = b.control('three');
      var a = b.array(
          ['one', ['two', syncValidator], c, b.array(['four'])], syncValidator, asyncValidator);

      expect(a.value).toEqual(['one', 'two', 'three', ['four']]);
      expect(a.validator).toBe(syncValidator);
      expect(a.asyncValidator).toBe(asyncValidator);
    });
  });
}
