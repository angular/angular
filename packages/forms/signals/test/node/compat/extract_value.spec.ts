/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {FormControl, FormGroup} from '@angular/forms';
import {applyEach, disabled, form} from '@angular/forms/signals';
import {compatForm, extractValue, SignalFormControl} from '@angular/forms/signals/compat';

describe('extractValue', () => {
  let injector: Injector;

  beforeEach(() => {
    injector = TestBed.inject(Injector);
  });

  it('should extract a primitive value', () => {
    const f = form(signal(123), {injector});
    expect(extractValue(f)).toBe(123);
  });

  it('should extract an object with primitives', () => {
    const model = {a: 1, b: 'two'};
    const f = form(signal(model), {injector});
    expect(extractValue(f)).toEqual(model);
  });

  it('should extract nested objects and arrays', () => {
    const model = {
      nested: {
        array: [1, 2, 3],
      },
      other: 'value',
    };
    const f = form(signal(model), {injector});
    expect(extractValue(f)).toEqual(model);
  });

  it('should unwrap AbstractControl in compatForm', () => {
    const lastNameControl = new FormControl('Doe');
    const model = {
      firstName: 'John',
      lastName: lastNameControl,
    };
    const f = compatForm(signal(model), {injector});

    expect(extractValue(f)).toEqual({
      firstName: 'John',
      lastName: 'Doe',
    });

    lastNameControl.setValue('Smith');
    expect(extractValue(f)).toEqual({
      firstName: 'John',
      lastName: 'Smith',
    });
  });

  it('should unwrap nested FormGroup in compatForm', () => {
    const group = new FormGroup({
      inner: new FormControl('value'),
    });
    const model = {
      group: group,
    };
    const f = compatForm(signal(model), {injector});

    expect(extractValue(f)).toEqual({
      group: {
        inner: 'value',
      },
    });

    group.get('inner')!.setValue('changed');
    expect(extractValue(f)).toEqual({
      group: {
        inner: 'changed',
      },
    });
  });

  it('should filter by enabled: true', () => {
    const model = {a: 1, b: 2};
    const f = form(
      signal(model),
      (p) => {
        disabled(p.b);
      },
      {injector},
    );

    expect(extractValue(f, {enabled: true})).toEqual({a: 1});
  });

  it('should filter by dirty: true', () => {
    const model = {a: 1, b: 2, c: [1, 2]};
    const f = form(signal(model), {injector});

    expect(extractValue(f, {dirty: true})).toBeUndefined();

    f.a().markAsDirty();
    f.c[1]().markAsDirty();

    expect(extractValue(f, {dirty: true})).toEqual({
      a: 1,
      c: [undefined, 2],
    });
  });

  describe('filtering by touched (upward propagation)', () => {
    it('should drop the entire container if `touched: true` and all children are untouched', () => {
      const model = {a: 1, b: 2};
      const f = form(signal(model), {injector});

      f().markAsTouched();

      expect(extractValue(f, {touched: true})).toBeUndefined();
    });

    it('should include only touched children if `touched: true`', () => {
      const model = {a: 1, b: 2};
      const f = form(signal(model), {injector});

      f.a().markAsTouched();

      expect(extractValue(f, {touched: true})).toEqual({a: 1});
    });

    it('should traverse into touched containers if `touched: false`', () => {
      const model = {a: 1, b: 2};
      const f = form(signal(model), {injector});
      f.a().markAsTouched();

      expect(extractValue(f, {touched: false})).toEqual({b: 2});
    });

    it('should drop container if `touched: false` and all children are touched', () => {
      const model = {a: 1, b: 2};
      const f = form(signal(model), {injector});
      f.a().markAsTouched();
      f.b().markAsTouched();
      // Parent fails filter. All children fail filter.
      expect(extractValue(f, {touched: false})).toBeUndefined();
    });
  });

  it('should return undefined if the root is filtered out', () => {
    const f = form(
      signal(123),
      (p) => {
        disabled(p);
      },
      {injector},
    );

    expect(extractValue(f, {enabled: true})).toBeUndefined();
    expect(extractValue(f, {enabled: false})).toBe(123);
  });

  it('should handle combined filters (Intersection)', () => {
    const model = {a: 1, b: 2, c: 3};
    const f = form(
      signal(model),
      (p) => {
        disabled(p.c);
      },
      {injector},
    );

    f.a().markAsDirty();
    // f.b is enabled but pristine
    // f.c is disabled and pristine

    expect(extractValue(f, {enabled: true, dirty: true})).toEqual({a: 1});
  });

  describe('filtering by enabled (downward propagation)', () => {
    it('should drop the entire container if `enabled: true` and all children are disabled', () => {
      const model = {a: 1, b: 2};
      // In Signal forms, disabling children does NOT propagate disabling up to the parent.
      // So the parent remains `enabled: true`.
      const f = form(
        signal(model),
        (p) => {
          disabled(p.a);
          disabled(p.b);
        },
        {injector},
      );

      // Parent matches `enabled: true`. All children fail it.
      // Container should fully drop because it has no enabled leaf fields.
      expect(extractValue(f, {enabled: true})).toBeUndefined();
    });

    it('should traverse into enabled containers if `enabled: false`', () => {
      const model = {a: 1, b: 2};
      const f = form(
        signal(model),
        (p) => {
          disabled(p.b);
        },
        {injector},
      );

      // Parent is enabled (fails `enabled: false` filter).
      // Child `a` is enabled (fails). Child `b` is disabled (matches).
      // Traversal must pierce the failing parent to find the matching child.
      expect(extractValue(f, {enabled: false})).toEqual({b: 2});
    });

    it('should drop the entire container if `enabled: false` and all children are enabled', () => {
      const model = {a: 1, b: 2};
      const f = form(signal(model), {injector});

      // Parent fails filter. All children fail filter.
      expect(extractValue(f, {enabled: false})).toBeUndefined();
    });
    it('should preserve array positions when filtering', () => {
      const model = {items: [1, 2, 3, 4]};
      const f = form(
        signal(model),
        (p) => {
          applyEach(p.items, (item) => {
            disabled(item, ({value}) => value() === 2 || value() === 4);
          });
        },
        {injector},
      );

      expect(extractValue(f, {enabled: true})).toEqual({items: [1, undefined, 3, undefined]});
    });

    it('should keep indexes when only later array elements match filter', () => {
      const model = {items: [10, 20, 30, 40]};
      const f = form(
        signal(model),
        (p) => {
          applyEach(p.items, (item) => {
            disabled(item, ({value}) => value() !== 30);
          });
        },
        {injector},
      );

      expect(extractValue(f, {enabled: true})).toEqual({
        items: [undefined, undefined, 30, undefined],
      });
    });

    it('should handle enabled: false filter', () => {
      const model = {value: 1};
      const f = form(
        signal(model),
        (p) => {
          disabled(p);
        },
        {injector},
      );

      expect(extractValue(f, {enabled: false})).toEqual(model);
    });
  });

  it('should handle hybrid deep nesting', () => {
    TestBed.runInInjectionContext(() => {
      const sfc = new SignalFormControl('sfc-value');
      const group = new FormGroup({
        inner: sfc,
      });
      const model = {
        wrapper: {
          group: group,
        },
      };
      const f = compatForm(signal(model), {injector});

      expect(extractValue(f)).toEqual({
        wrapper: {
          group: {
            inner: 'sfc-value',
          },
        },
      });
    });
  });

  it('should handle enabled: false filter', () => {
    const model = {value: 1};
    const f = form(
      signal(model),
      (p) => {
        disabled(p);
      },
      {injector},
    );

    expect(extractValue(f, {enabled: false})).toEqual(model);
  });
});
