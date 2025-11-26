/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file at https://angular.dev/license
 */

import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {Validators} from '@angular/forms';
import {disabled, form, required} from '../../../public_api';
import {
  createInteropControl,
  InteropAbstractControl,
} from '../../../src/controls/interop_abstract_control';

describe('InteropAbstractControl', () => {
  describe('createInteropControl', () => {
    it('creates an interop control from a field tree', () => {
      const f = form(signal('pirojok'), {injector: TestBed.inject(Injector)});
      const control = createInteropControl(f);

      expect(control).toBeInstanceOf(InteropAbstractControl);
      expect(control.value).toBe('pirojok');
    });

    it('maintains type information', () => {
      const f = form(signal({name: 'test', age: 25}), {injector: TestBed.inject(Injector)});
      const control = createInteropControl(f);

      expect(control.value).toEqual({name: 'test', age: 25});
    });
  });

  describe('setValue', () => {
    it('updates the underlying field value', () => {
      const f = form(signal('pirojok'), {injector: TestBed.inject(Injector)});
      const control = createInteropControl(f);

      control.setValue('pirojok');

      expect(f().value()).toBe('pirojok');
      expect(control.value).toBe('pirojok');
    });
  });

  describe('hasValidator', () => {
    it('returns true for Validators.required when field has REQUIRED metadata', () => {
      const f = form(
        signal('pirojok'),
        (p) => {
          required(p);
        },
        {injector: TestBed.inject(Injector)},
      );
      const control = createInteropControl(f);

      expect(control.hasValidator(Validators.required)).toBe(true);
    });

    it('returns false for Validators.required when field does not have REQUIRED metadata', () => {
      const f = form(signal('pirojok'), {injector: TestBed.inject(Injector)});
      const control = createInteropControl(f);

      expect(control.hasValidator(Validators.required)).toBe(false);
    });
  });

  describe('updateValueAndValidity', () => {
    it('is a no-op and does not change any state', () => {
      const f = form(
        signal('pirojok'),
        (p) => {
          required(p);
        },
        {injector: TestBed.inject(Injector)},
      );
      const control = createInteropControl(f);

      const valueBefore = control.value;
      const validBefore = control.valid;
      const errorsBefore = control.errors;

      control.updateValueAndValidity();

      expect(control.value).toBe(valueBefore);
      expect(control.valid).toBe(validBefore);
      expect(control.errors).toEqual(errorsBefore);
    });
  });

  describe('inherited properties from InteropBase', () => {
    it('exposes value property', () => {
      const f = form(signal('pirojok'), {injector: TestBed.inject(Injector)});
      const control = createInteropControl(f);

      expect(control.value).toBe('pirojok');

      f().value.set('pirojok');
      expect(control.value).toBe('pirojok');
    });

    it('exposes valid and invalid properties', () => {
      const f = form(
        signal(''),
        (p) => {
          required(p);
        },
        {injector: TestBed.inject(Injector)},
      );
      const control = createInteropControl(f);

      expect(control.valid).toBe(false);
      expect(control.invalid).toBe(true);

      f().value.set('pirojok');
      expect(control.valid).toBe(true);
      expect(control.invalid).toBe(false);
    });

    it('exposes disabled and enabled properties', () => {
      const isDisabled = signal(false);
      const f = form(
        signal('pirojok'),
        (p) => {
          disabled(p, () => isDisabled());
        },
        {injector: TestBed.inject(Injector)},
      );
      const control = createInteropControl(f);

      expect(control.disabled).toBe(false);
      expect(control.enabled).toBe(true);

      isDisabled.set(true);
      expect(control.disabled).toBe(true);
      expect(control.enabled).toBe(false);
    });

    it('exposes errors property', () => {
      const f = form(
        signal(''),
        (p) => {
          required(p);
        },
        {injector: TestBed.inject(Injector)},
      );
      const control = createInteropControl(f);

      expect(control.errors).not.toBeNull();
      expect(control.errors?.['required']).toBeDefined();

      f().value.set('pirojok');
      expect(control.errors).toBeNull();
    });

    it('exposes pristine and dirty properties', () => {
      const f = form(signal('pirojok'), {injector: TestBed.inject(Injector)});
      const control = createInteropControl(f);

      expect(control.pristine).toBe(true);
      expect(control.dirty).toBe(false);

      f().value.set('pirojok');
      f().markAsDirty();
      expect(control.pristine).toBe(false);
      expect(control.dirty).toBe(true);
    });

    it('exposes touched and untouched properties', () => {
      const f = form(signal('pirojok'), {injector: TestBed.inject(Injector)});
      const control = createInteropControl(f);

      expect(control.touched).toBe(false);
      expect(control.untouched).toBe(true);

      f().markAsTouched();
      expect(control.touched).toBe(true);
      expect(control.untouched).toBe(false);
    });

    it('exposes status property', () => {
      const isDisabled = signal(false);
      const f = form(
        signal(''),
        (p) => {
          required(p);
          disabled(p, () => isDisabled());
        },
        {injector: TestBed.inject(Injector)},
      );
      const control = createInteropControl(f);

      expect(control.status).toBe('INVALID');

      f().value.set('pirojok');
      expect(control.status).toBe('VALID');

      isDisabled.set(true);
      expect(control.status).toBe('DISABLED');
    });
  });
});
