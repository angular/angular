/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {fakeAsync, tick} from '@angular/core/testing';
import {beforeEach, describe, expect, it} from '@angular/core/testing/src/testing_internal';
import {FormBuilder} from '@angular/forms';
import {of } from 'rxjs';

(function() {
  function syncValidator(_: any /** TODO #9100 */): any /** TODO #9100 */ { return null; }
  function asyncValidator(_: any /** TODO #9100 */) { return Promise.resolve(null); }

  describe('Form Builder', () => {
    let b: FormBuilder;

    beforeEach(() => { b = new FormBuilder(); });

    it('should create controls from a value', () => {
      const g = b.group({'login': 'some value'});

      expect(g.controls['login'].value).toEqual('some value');
    });

    it('should create controls from a boxed value', () => {
      const g = b.group({'login': {value: 'some value', disabled: true}});

      expect(g.controls['login'].value).toEqual('some value');
      expect(g.controls['login'].disabled).toEqual(true);
    });

    it('should create controls from an array', () => {
      const g = b.group(
          {'login': ['some value'], 'password': ['some value', syncValidator, asyncValidator]});

      expect(g.controls['login'].value).toEqual('some value');
      expect(g.controls['password'].value).toEqual('some value');
      expect(g.controls['password'].validator).toEqual(syncValidator);
      expect(g.controls['password'].asyncValidator).toEqual(asyncValidator);
    });

    it('should use controls whose form state is a primitive value', () => {
      const g = b.group({'login': b.control('some value', syncValidator, asyncValidator)});

      expect(g.controls['login'].value).toEqual('some value');
      expect(g.controls['login'].validator).toBe(syncValidator);
      expect(g.controls['login'].asyncValidator).toBe(asyncValidator);
    });

    it('should support controls with no validators and whose form state is null', () => {
      const g = b.group({'login': b.control(null)});
      expect(g.controls['login'].value).toBeNull();
      expect(g.controls['login'].validator).toBeNull();
      expect(g.controls['login'].asyncValidator).toBeNull();
    });

    it('should support controls with validators and whose form state is null', () => {
      const g = b.group({'login': b.control(null, syncValidator, asyncValidator)});
      expect(g.controls['login'].value).toBeNull();
      expect(g.controls['login'].validator).toBe(syncValidator);
      expect(g.controls['login'].asyncValidator).toBe(asyncValidator);
    });

    it('should support controls with no validators and whose form state is undefined', () => {
      const g = b.group({'login': b.control(undefined)});
      expect(g.controls['login'].value).toBeNull();
      expect(g.controls['login'].validator).toBeNull();
      expect(g.controls['login'].asyncValidator).toBeNull();
    });

    it('should support controls with validators and whose form state is undefined', () => {
      const g = b.group({'login': b.control(undefined, syncValidator, asyncValidator)});
      expect(g.controls['login'].value).toBeNull();
      expect(g.controls['login'].validator).toBe(syncValidator);
      expect(g.controls['login'].asyncValidator).toBe(asyncValidator);
    });

    it('should create groups with a custom validator', () => {
      const g = b.group(
          {'login': 'some value'}, {'validator': syncValidator, 'asyncValidator': asyncValidator});

      expect(g.validator).toBe(syncValidator);
      expect(g.asyncValidator).toBe(asyncValidator);
    });

    it('should create control arrays', () => {
      const c = b.control('three');
      const e = b.control(null);
      const f = b.control(undefined);
      const a = b.array(
          ['one', ['two', syncValidator], c, b.array(['four']), e, f], syncValidator,
          asyncValidator);

      expect(a.value).toEqual(['one', 'two', 'three', ['four'], null, null]);
      expect(a.validator).toBe(syncValidator);
      expect(a.asyncValidator).toBe(asyncValidator);
    });

    it('should create control arrays with multiple async validators', fakeAsync(() => {
         function asyncValidator1() { return of ({'async1': true}); }
         function asyncValidator2() { return of ({'async2': true}); }

         const a = b.array(['one', 'two'], null, [asyncValidator1, asyncValidator2]);
         expect(a.value).toEqual(['one', 'two']);

         tick();

         expect(a.errors).toEqual({'async1': true, 'async2': true});
       }));

    it('should create control arrays with multiple sync validators', () => {
      function syncValidator1() { return {'sync1': true}; }
      function syncValidator2() { return {'sync2': true}; }

      const a = b.array(['one', 'two'], [syncValidator1, syncValidator2]);
      expect(a.value).toEqual(['one', 'two']);
      expect(a.errors).toEqual({'sync1': true, 'sync2': true});
    });
  });
})();
