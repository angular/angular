/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ApplicationRef,
  effect,
  Injector,
  resource,
  runInInjectionContext,
  signal,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {ControlEvent, FormControlStatus, FormGroup, FormResetEvent} from '@angular/forms';
import {disabled, required, validateAsync, ValidationError} from '@angular/forms/signals';
import {SchemaFn} from '../../../src/api/types';
import {SignalFormControl} from '../../../compat';

function createSignalFormControl<T>(initialValue: T, schema?: SchemaFn<T>) {
  const injector = TestBed.inject(Injector);

  return new SignalFormControl(initialValue, schema, {injector});
}

function promiseWithResolvers<T = void>(): {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
} {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: any) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return {promise, resolve, reject};
}

describe('SignalFormControl', () => {
  describe('value and state access', () => {
    it('should have the same value as the signal', () => {
      const form = createSignalFormControl(10);

      expect(form.value).toBe(10);
      form.setValue(20);
      expect(form.value).toBe(20);
    });

    it('should expose fieldTree', () => {
      const form = createSignalFormControl(10);
      expect(form.fieldTree().value()).toBe(10);

      form.setValue(20);
      expect(form.fieldTree().value()).toBe(20);
    });

    it('should return value for getRawValue', () => {
      const form = createSignalFormControl(10);
      expect(form.getRawValue()).toBe(10);
    });
  });

  describe('validation', () => {
    it('should validate', () => {
      const form = createSignalFormControl<string>('', (p) => {
        required(p);
      });

      expect(form.valid).toBe(false);

      form.setValue('pirojok');
      expect(form.valid).toBe(true);

      form.setValue('');
      expect(form.valid).toBe(false);
    });

    it('should expose validation errors through the errors getter', () => {
      const form = createSignalFormControl<string>('', (p) => {
        required(p);
      });

      const errors = form.errors;
      expect(errors).not.toBeNull();
      expect(errors!['required']).toEqual(jasmine.objectContaining({kind: 'required'}));

      form.setValue(1);
      expect(form.errors).toBeNull();
    });

    it('should expose pending status for async validators', async () => {
      let deferred = promiseWithResolvers<ValidationError[]>();
      const resolveNext = (errors: ValidationError[]) => {
        TestBed.tick();
        deferred.resolve(errors);
        deferred = promiseWithResolvers<ValidationError[]>();
      };

      const form = createSignalFormControl('initial', (p) => {
        validateAsync(p, {
          params: ({value}) => value(),
          factory: (params) =>
            resource({
              params,
              loader: () => deferred.promise,
            }),
          onSuccess: (errors) => errors,
          onError: () => null,
        });
      });
      const appRef = TestBed.inject(ApplicationRef);

      expect(form.pending).toBe(true);
      expect(form.status).toBe('PENDING');

      resolveNext([]);
      await appRef.whenStable();

      expect(form.pending).toBe(false);
      expect(form.status).toBe('VALID');

      form.setValue('invalid');

      expect(form.pending).toBe(true);
      expect(form.status).toBe('PENDING');

      resolveNext([{kind: 'async-invalid'}]);
      await appRef.whenStable();

      expect(form.pending).toBe(false);
      expect(form.status).toBe('INVALID');
      expect(form.errors?.['async-invalid']).toEqual(
        jasmine.objectContaining({kind: 'async-invalid'}),
      );
    });

    it('should support disabled via rules', () => {
      const form = createSignalFormControl(10, (p) => {
        disabled(p, ({value}) => value() > 15);
      });

      expect(form.disabled).toBe(false);
      expect(form.status).toBe('VALID');

      form.setValue(20);

      expect(form.disabled).toBe(true);
      expect(form.status).toBe('DISABLED');
    });
  });

  describe('status management (dirty/touched)', () => {
    it('should support markAsTouched', () => {
      const form = createSignalFormControl(10);

      expect(form.touched).toBe(false);
      form.markAsTouched();
      expect(form.touched).toBe(true);
    });

    it('should support markAsDirty', () => {
      const form = createSignalFormControl(10);

      expect(form.dirty).toBe(false);
      form.markAsDirty();
      expect(form.dirty).toBe(true);
    });

    it('should support markAsPristine', () => {
      const form = createSignalFormControl(10);

      form.markAsDirty();
      expect(form.dirty).toBe(true);

      form.markAsPristine();
      expect(form.dirty).toBe(false);
    });

    it('should preserve touched state when markAsPristine is called', () => {
      const form = createSignalFormControl(10);

      form.markAsDirty();
      form.markAsTouched();
      expect(form.dirty).toBe(true);
      expect(form.touched).toBe(true);

      form.markAsPristine();
      expect(form.dirty).toBe(false);
      expect(form.touched).toBe(true);
    });

    it('should support markAsUntouched', () => {
      const form = createSignalFormControl(10);

      form.markAsTouched();
      expect(form.touched).toBe(true);

      form.markAsUntouched();
      expect(form.touched).toBe(false);
    });

    it('should preserve dirty state when markAsUntouched is called', () => {
      const form = createSignalFormControl(10);

      form.markAsDirty();
      form.markAsTouched();
      expect(form.dirty).toBe(true);
      expect(form.touched).toBe(true);

      form.markAsUntouched();
      expect(form.touched).toBe(false);
      expect(form.dirty).toBe(true);
    });

    it('should propagate dirty status to parent FormGroup immediately', () => {
      const child = createSignalFormControl('meow');
      const group = new FormGroup({
        child: child,
      });

      expect(group.dirty).toBe(false);
      child.markAsDirty();
      expect(group.dirty).toBe(true);
    });

    it('should not propagate dirty status to parent when onlySelf is true', () => {
      const child = createSignalFormControl('meow');
      const group = new FormGroup({child});

      child.markAsDirty({onlySelf: true});

      expect(child.dirty).toBe(true);
      expect(group.dirty).toBe(false);
    });

    it('should propagate touched status to parent FormGroup immediately', () => {
      const child = createSignalFormControl('meow');
      const group = new FormGroup({
        child: child,
      });

      expect(group.touched).toBe(false);
      child.markAsTouched();
      expect(group.touched).toBe(true);
    });

    it('should not propagate touched status to parent when onlySelf is true', () => {
      const child = createSignalFormControl('meow');
      const group = new FormGroup({child});

      child.markAsTouched({onlySelf: true});

      expect(child.touched).toBe(true);
      expect(group.touched).toBe(false);
    });

    it('should not propagate pristine status to parent when onlySelf is true', () => {
      const child = createSignalFormControl('meow');
      const group = new FormGroup({child});

      group.markAsDirty();
      expect(group.dirty).toBe(true);

      child.markAsPristine({onlySelf: true});

      expect(child.pristine).toBe(true);
      expect(group.dirty).toBe(true);
    });

    it('should not propagate untouched status to parent when onlySelf is true', () => {
      const child = createSignalFormControl('meow');
      const group = new FormGroup({child});

      group.markAsTouched();
      expect(group.touched).toBe(true);

      child.markAsUntouched({onlySelf: true});

      expect(child.untouched).toBe(true);
      expect(group.touched).toBe(true);
    });

    it('should propagate dirty status to parent FormGroup from fieldTree update', () => {
      const child = createSignalFormControl('meow');
      const group = new FormGroup({
        child: child,
      });

      expect(group.dirty).toBe(false);
      child.fieldTree().markAsDirty();
      TestBed.tick();
      expect(group.dirty).toBe(true);
    });
  });

  describe('observables and events', () => {
    it('should emit valueChanges when the value updates', () => {
      const form = createSignalFormControl(10);
      const emissions: number[] = [];

      form.valueChanges.subscribe((v: number) => emissions.push(v));

      form.setValue(20);
      TestBed.tick();
      expect(emissions).toEqual([20]);

      form.setValue(30);
      TestBed.tick();
      expect(emissions).toEqual([20, 30]);
    });

    it('should emit statusChanges when validity toggles', () => {
      const form = createSignalFormControl<number | undefined>(undefined, (p) => {
        required(p);
      });
      const statuses: FormControlStatus[] = [];

      form.statusChanges.subscribe((status: FormControlStatus) => statuses.push(status));

      form.setValue(1);
      TestBed.tick();
      expect(statuses).toEqual(['VALID']);

      form.setValue(undefined);
      TestBed.tick();
      expect(statuses).toEqual(['VALID', 'INVALID']);

      form.setValue(10);
      TestBed.tick();
      expect(statuses).toEqual(['VALID', 'INVALID', 'VALID']);
    });

    it('should NOT track signals read inside statusChanges subscription', () => {
      const form = createSignalFormControl<number | undefined>(undefined, (p) => {
        required(p);
      });
      const otherSignal = signal(0);
      const callback = jasmine.createSpy('statusChanges').and.callFake(() => {
        otherSignal(); // Read another signal
      });

      const appRef = TestBed.inject(ApplicationRef);
      appRef.tick(); // Flush effects

      form.statusChanges.subscribe(callback);

      form.setValue(1);
      appRef.tick();
      expect(callback).toHaveBeenCalledTimes(1);
      callback.calls.reset();

      // Update the other signal - this should NOT trigger the statusChanges emission if untracked is used
      otherSignal.set(1);
      appRef.tick();
      expect(callback).not.toHaveBeenCalled();
    });

    it('should NOT track signals read inside valueChanges subscription', () => {
      const form = createSignalFormControl(10);
      const otherSignal = signal(0);
      const callback = jasmine.createSpy('valueChanges').and.callFake(() => {
        otherSignal();
      });

      const appRef = TestBed.inject(ApplicationRef);
      appRef.tick();

      form.valueChanges.subscribe(callback);

      form.setValue(20);
      appRef.tick();
      expect(callback).toHaveBeenCalledWith(20);
      callback.calls.reset();

      otherSignal.set(1);
      appRef.tick();
      expect(callback).not.toHaveBeenCalled();
    });

    it('should NOT track signals read inside events subscription', () => {
      const form = createSignalFormControl(10);
      const otherSignal = signal(0);
      const callback = jasmine.createSpy('events').and.callFake(() => {
        otherSignal();
      });

      const appRef = TestBed.inject(ApplicationRef);
      appRef.tick();

      form.events.subscribe(callback);

      form.setValue(20);
      appRef.tick();
      expect(callback).toHaveBeenCalled();
      callback.calls.reset();

      otherSignal.set(1);
      appRef.tick();
      expect(callback).not.toHaveBeenCalled();
    });

    it('should emit ValueChangeEvent on events observable', () => {
      const form = createSignalFormControl(10);
      const events: any[] = [];

      form.events.subscribe((e: ControlEvent<number>) => events.push(e));

      form.setValue(20);
      TestBed.tick();

      const valueEvents = events.filter((e) => e.constructor.name === 'ValueChangeEvent');
      expect(valueEvents.length).toBeGreaterThan(0);
      expect(valueEvents[valueEvents.length - 1].value).toBe(20);
    });

    it('should emit StatusChangeEvent on events observable when status changes', () => {
      const form = createSignalFormControl<number | undefined>(10, (p) => required(p));

      TestBed.tick();

      const events: any[] = [];
      form.events.subscribe((e: ControlEvent<number | undefined>) => events.push(e));

      form.setValue(undefined);
      TestBed.tick();

      const statusEvents = events.filter((e) => e.constructor.name === 'StatusChangeEvent');
      expect(statusEvents.length).toBeGreaterThan(0);
      expect(statusEvents[statusEvents.length - 1].status).toBe('INVALID');
    });

    it('should emit TouchedChangeEvent on events observable', () => {
      const form = createSignalFormControl(10);

      TestBed.tick();

      const events: any[] = [];
      form.events.subscribe((e: ControlEvent<number>) => events.push(e));

      form.markAsTouched();
      TestBed.tick();

      expect(events.length).toBe(1);
      expect(events[0].touched).toBe(true);
    });

    it('should emit PristineChangeEvent on events observable when dirty changes', () => {
      const form = createSignalFormControl(10);

      TestBed.tick();

      const events: any[] = [];
      form.events.subscribe((e: ControlEvent<number>) => events.push(e));
      form.markAsDirty();
      TestBed.tick();

      expect(events.length).toBe(1);
      expect(events[0].pristine).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset touched and dirty state', () => {
      const form = createSignalFormControl(10);

      form.markAsTouched();
      form.markAsDirty();
      expect(form.touched).toBe(true);
      expect(form.dirty).toBe(true);

      form.reset(10);
      expect(form.touched).toBe(false);
      expect(form.dirty).toBe(false);
      expect(form.value).toBe(10);
    });

    it('should reset with a new value', () => {
      const form = createSignalFormControl('pirojok');

      form.markAsTouched();
      form.markAsDirty();

      form.reset('buterbrod');
      expect(form.value).toBe('buterbrod');
      expect(form.sourceValue()).toBe('buterbrod');
      expect(form.touched).toBe(false);
      expect(form.dirty).toBe(false);
    });

    it('should unbox value in reset', () => {
      const form = createSignalFormControl(10);
      form.reset({value: 20, disabled: true});

      expect(form.value).toBe(20);
      expect(form.disabled).toBe(false);
    });

    it('should NOT unbox value in reset if it has extra keys', () => {
      const form = createSignalFormControl<any>(10);
      const complexValue = {value: 20, disabled: true, extra: 1};
      form.reset(complexValue);
      expect(form.value).toEqual(complexValue);
    });

    it('should emit FormResetEvent on reset', () => {
      const form = createSignalFormControl(10);
      const events: any[] = [];
      form.events.subscribe((e: ControlEvent<number>) => events.push(e));

      form.reset(20);
      expect(events.length).toBe(1);
      expect(events[0] instanceof FormResetEvent).toBe(true);
    });

    it('should NOT emit FormResetEvent on reset when emitEvent is false', () => {
      const form = createSignalFormControl(10);
      const events: any[] = [];
      form.events.subscribe((e: ControlEvent<number>) => events.push(e));

      form.reset(20, {emitEvent: false});
      expect(events.length).toBe(0);
    });
  });

  describe('unsupported methods', () => {
    it('should throw error when calling disable()', () => {
      const form = createSignalFormControl(10);
      expect(() => form.disable()).toThrowError(
        /Imperatively changing enabled\/disabled status in form control is not supported/,
      );
    });

    it('should throw error when calling enable()', () => {
      const form = createSignalFormControl(10);
      expect(() => form.enable()).toThrowError(
        /Imperatively changing enabled\/disabled status in form control is not supported/,
      );
    });

    it('should throw error when calling setValidators()', () => {
      const form = createSignalFormControl(10);
      expect(() => form.setValidators(null)).toThrowError(
        /Dynamically adding and removing validators is not supported/,
      );
    });

    it('should throw error when calling setAsyncValidators()', () => {
      const form = createSignalFormControl(10);
      expect(() => form.setAsyncValidators(null)).toThrowError(
        /Dynamically adding and removing validators is not supported/,
      );
    });

    it('should throw error when calling addValidators()', () => {
      const form = createSignalFormControl(10);
      expect(() => form.addValidators([])).toThrowError(
        /Dynamically adding and removing validators is not supported/,
      );
    });

    it('should throw error when calling addAsyncValidators()', () => {
      const form = createSignalFormControl(10);
      expect(() => form.addAsyncValidators([])).toThrowError(
        /Dynamically adding and removing validators is not supported/,
      );
    });

    it('should throw error when calling removeValidators()', () => {
      const form = createSignalFormControl(10);
      expect(() => form.removeValidators([])).toThrowError(
        /Dynamically adding and removing validators is not supported/,
      );
    });

    it('should throw error when calling removeAsyncValidators()', () => {
      const form = createSignalFormControl(10);
      expect(() => form.removeAsyncValidators([])).toThrowError(
        /Dynamically adding and removing validators is not supported/,
      );
    });

    it('should throw error when calling clearValidators()', () => {
      const form = createSignalFormControl(10);
      expect(() => form.clearValidators()).toThrowError(
        /Dynamically adding and removing validators is not supported/,
      );
    });

    it('should throw error when calling clearAsyncValidators()', () => {
      const form = createSignalFormControl(10);
      expect(() => form.clearAsyncValidators()).toThrowError(
        /Dynamically adding and removing validators is not supported/,
      );
    });

    it('should throw error when calling setErrors()', () => {
      const form = createSignalFormControl(10);
      expect(() => form.setErrors(null)).toThrowError(
        /Imperatively setting errors is not supported in signal forms/,
      );
    });

    it('should throw error when calling markAsPending()', () => {
      const form = createSignalFormControl(10);
      expect(() => form.markAsPending()).toThrowError(
        /Imperatively marking as pending is not supported in signal forms/,
      );
    });

    it('should throw error when setting dirty directly', () => {
      const form = createSignalFormControl(10);
      expect(() => ((form as any).dirty = true)).toThrowError(
        /Setting dirty directly is not supported. Instead use markAsDirty\(\)/,
      );
    });

    it('should throw error when setting pristine directly', () => {
      const form = createSignalFormControl(10);
      expect(() => ((form as any).pristine = true)).toThrowError(
        /Setting pristine directly is not supported. Instead use reset\(\)/,
      );
    });

    it('should throw error when setting touched directly', () => {
      const form = createSignalFormControl(10);
      expect(() => ((form as any).touched = true)).toThrowError(
        /Setting touched directly is not supported. Instead use markAsTouched\(\) or reset\(\)/,
      );
    });

    it('should throw error when setting untouched directly', () => {
      const form = createSignalFormControl(10);
      expect(() => ((form as any).untouched = true)).toThrowError(
        /Setting untouched directly is not supported. Instead use reset\(\)/,
      );
    });
  });

  describe('callback registration', () => {
    it('should call registered onDisabledChange callback when disabled state changes', () => {
      const form = createSignalFormControl(10, (p) => {
        disabled(p, ({value}) => value() > 15);
      });
      const callback = jasmine.createSpy('onDisabledChange');

      form.registerOnDisabledChange(callback);
      TestBed.inject(ApplicationRef).tick();

      expect(callback).toHaveBeenCalledWith(false);
      callback.calls.reset();

      form.setValue(20);
      TestBed.inject(ApplicationRef).tick();

      expect(callback).toHaveBeenCalledWith(true);
    });

    it('should NOT track signals read inside onDisabledChange callback', () => {
      const form = createSignalFormControl(10, (p) => {
        disabled(p, ({value}) => value() > 15);
      });
      const otherSignal = signal(0);
      const callback = jasmine.createSpy('onDisabledChange').and.callFake(() => {
        otherSignal(); // Read another signal
      });

      form.registerOnDisabledChange(callback);
      const appRef = TestBed.inject(ApplicationRef);
      appRef.tick();

      expect(callback).toHaveBeenCalledTimes(1);
      callback.calls.reset();

      // Update the other signal - this should NOT trigger the callback
      otherSignal.set(1);
      appRef.tick();
      expect(callback).not.toHaveBeenCalled();

      // Sanity check: update the form value to trigger disabled change
      form.setValue(20);
      appRef.tick();
      expect(callback).toHaveBeenCalledWith(true);
    });
  });

  describe('effects and loops', () => {
    it('should NOT cause an infinite loop when an effect reads dirty and calls markAsUntouched', () => {
      const form = createSignalFormControl(10);
      const appRef = TestBed.inject(ApplicationRef);

      form.markAsDirty();
      appRef.tick();

      effect(
        () => {
          if (form.dirty) {
            form.markAsUntouched();
          }
        },
        {injector: TestBed.inject(Injector)},
      );

      // In current implementation this will loop because markAsUntouched calls reset()
      // which sets dirty=false and then back to true.
      appRef.tick();
    });

    it('should NOT cause an infinite loop when an effect reads touched and calls markAsPristine', () => {
      const form = createSignalFormControl(10);
      const appRef = TestBed.inject(ApplicationRef);

      form.markAsTouched();
      appRef.tick();

      effect(
        () => {
          if (form.touched) {
            form.markAsPristine();
          }
        },
        {injector: TestBed.inject(Injector)},
      );

      // In current implementation this will loop because markAsPristine calls reset()
      // which sets touched=false and then back to true.
      appRef.tick();
    });
  });

  describe('dependency injection', () => {
    it('should be created without an explicit injector in an injection context', () => {
      const injector = TestBed.inject(Injector);
      const form = runInInjectionContext(injector, () => new SignalFormControl(10));

      expect(form.value).toBe(10);
    });
  });
});
