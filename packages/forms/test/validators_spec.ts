/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {fakeAsync, tick} from '@angular/core/testing';
import {AbstractControl, AsyncValidator, AsyncValidatorFn, FormArray, FormControl, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {Observable, of, timer} from 'rxjs';
import {first, map} from 'rxjs/operators';

import {normalizeValidators} from '../src/validators';

(function() {
function validator(key: string, error: any): ValidatorFn {
  return (c: AbstractControl) => {
    const r: ValidationErrors = {};
    r[key] = error;
    return r;
  };
}

class AsyncValidatorDirective implements AsyncValidator {
  constructor(private expected: string, private error: any) {}

  validate(c: any): Observable<ValidationErrors> {
    return Observable.create((obs: any) => {
      const error = this.expected !== c.value ? this.error : null;
      obs.next(error);
      obs.complete();
    });
  }
}

describe('Validators', () => {
  describe('min', () => {
    it('should not error on an empty string', () => {
      expect(Validators.min(2)(new FormControl(''))).toBeNull();
    });

    it('should not error on null', () => {
      expect(Validators.min(2)(new FormControl(null))).toBeNull();
    });

    it('should not error on undefined', () => {
      expect(Validators.min(2)(new FormControl(undefined))).toBeNull();
    });

    it('should return null if NaN after parsing', () => {
      expect(Validators.min(2)(new FormControl('a'))).toBeNull();
    });

    it('should return a validation error on small values', () => {
      expect(Validators.min(2)(new FormControl(1))).toEqual({'min': {'min': 2, 'actual': 1}});
    });

    it('should return a validation error on small values converted from strings', () => {
      expect(Validators.min(2)(new FormControl('1'))).toEqual({'min': {'min': 2, 'actual': '1'}});
    });

    it('should not error on small float number validation', () => {
      expect(Validators.min(1.20)(new FormControl(1.25))).toBeNull();
    });

    it('should not error on equal float values', () => {
      expect(Validators.min(1.25)(new FormControl(1.25))).toBeNull();
    });

    it('should return a validation error on big values', () => {
      expect(Validators.min(1.25)(new FormControl(1.20))).toEqual({
        'min': {'min': 1.25, 'actual': 1.20}
      });
    });

    it('should not error on big values', () => {
      expect(Validators.min(2)(new FormControl(3))).toBeNull();
    });

    it('should not error on equal values', () => {
      expect(Validators.min(2)(new FormControl(2))).toBeNull();
    });

    it('should not error on equal values when value is string', () => {
      expect(Validators.min(2)(new FormControl('2'))).toBeNull();
    });

    it('should validate as expected when min value is a string', () => {
      expect(Validators.min('2' as any)(new FormControl(1))).toEqual({
        'min': {'min': '2', 'actual': 1}
      });
    });

    it('should return null if min value is undefined', () => {
      expect(Validators.min(undefined as any)(new FormControl(3))).toBeNull();
    });

    it('should return null if min value is null', () => {
      expect(Validators.min(null as any)(new FormControl(3))).toBeNull();
    });
  });

  describe('max', () => {
    it('should not error on an empty string', () => {
      expect(Validators.max(2)(new FormControl(''))).toBeNull();
    });

    it('should not error on null', () => {
      expect(Validators.max(2)(new FormControl(null))).toBeNull();
    });

    it('should not error on undefined', () => {
      expect(Validators.max(2)(new FormControl(undefined))).toBeNull();
    });

    it('should return null if NaN after parsing', () => {
      expect(Validators.max(2)(new FormControl('aaa'))).toBeNull();
    });

    it('should not error on small float number validation', () => {
      expect(Validators.max(1.20)(new FormControl(1.15))).toBeNull();
    });

    it('should not error on equal float values', () => {
      expect(Validators.max(1.25)(new FormControl(1.25))).toBeNull();
    });

    it('should return a validation error on big values', () => {
      expect(Validators.max(1.25)(new FormControl(1.30))).toEqual({
        'max': {'max': 1.25, 'actual': 1.30}
      });
    });

    it('should return a validation error on big values', () => {
      expect(Validators.max(2)(new FormControl(3))).toEqual({'max': {'max': 2, 'actual': 3}});
    });

    it('should return a validation error on big values converted from strings', () => {
      expect(Validators.max(2)(new FormControl('3'))).toEqual({'max': {'max': 2, 'actual': '3'}});
    });

    it('should not error on small values', () => {
      expect(Validators.max(2)(new FormControl(1))).toBeNull();
    });

    it('should not error on equal values', () => {
      expect(Validators.max(2)(new FormControl(2))).toBeNull();
    });

    it('should not error on equal values when value is string', () => {
      expect(Validators.max(2)(new FormControl('2'))).toBeNull();
    });

    it('should validate as expected when max value is a string', () => {
      expect(Validators.max('2' as any)(new FormControl(3))).toEqual({
        'max': {'max': '2', 'actual': 3}
      });
    });

    it('should return null if max value is undefined', () => {
      expect(Validators.max(undefined as any)(new FormControl(3))).toBeNull();
    });

    it('should return null if max value is null', () => {
      expect(Validators.max(null as any)(new FormControl(3))).toBeNull();
    });
  });


  describe('required', () => {
    it('should error on an empty string', () => {
      expect(Validators.required(new FormControl(''))).toEqual({'required': true});
    });

    it('should error on null', () => {
      expect(Validators.required(new FormControl(null))).toEqual({'required': true});
    });

    it('should not error on undefined', () => {
      expect(Validators.required(new FormControl(undefined))).toEqual({'required': true});
    });

    it('should not error on a non-empty string', () => {
      expect(Validators.required(new FormControl('not empty'))).toBeNull();
    });

    it('should accept zero as valid', () => {
      expect(Validators.required(new FormControl(0))).toBeNull();
    });

    it('should error on an empty array',
       () => expect(Validators.required(new FormControl([]))).toEqual({'required': true}));

    it('should not error on a non-empty array',
       () => expect(Validators.required(new FormControl([1, 2]))).toBeNull());
  });

  describe('requiredTrue', () => {
    it('should error on false',
       () => expect(Validators.requiredTrue(new FormControl(false))).toEqual({'required': true}));

    it('should not error on true',
       () => expect(Validators.requiredTrue(new FormControl(true))).toBeNull());
  });

  describe('email', () => {
    it('should not error on an empty string',
       () => expect(Validators.email(new FormControl(''))).toBeNull());

    it('should not error on null',
       () => expect(Validators.email(new FormControl(null))).toBeNull());

    it('should error on invalid email',
       () => expect(Validators.email(new FormControl('some text'))).toEqual({'email': true}));

    it('should not error on valid email',
       () => expect(Validators.email(new FormControl('test@gmail.com'))).toBeNull());
  });

  describe('minLength', () => {
    it('should not error on an empty string', () => {
      expect(Validators.minLength(2)(new FormControl(''))).toBeNull();
    });

    it('should not error on null', () => {
      expect(Validators.minLength(2)(new FormControl(null))).toBeNull();
    });

    it('should not error on undefined', () => {
      expect(Validators.minLength(2)(new FormControl(undefined))).toBeNull();
    });

    it('should not error on valid strings', () => {
      expect(Validators.minLength(2)(new FormControl('aa'))).toBeNull();
    });

    it('should error on short strings', () => {
      expect(Validators.minLength(2)(new FormControl('a'))).toEqual({
        'minlength': {'requiredLength': 2, 'actualLength': 1}
      });
    });

    it('should not error when FormArray has valid length', () => {
      const fa = new FormArray([new FormControl(''), new FormControl('')]);
      expect(Validators.minLength(2)(fa)).toBeNull();
    });

    it('should error when FormArray has invalid length', () => {
      const fa = new FormArray([new FormControl('')]);
      expect(Validators.minLength(2)(fa)).toEqual({
        'minlength': {'requiredLength': 2, 'actualLength': 1}
      });
    });

    it('should always return null with numeric values', () => {
      expect(Validators.minLength(1)(new FormControl(0))).toBeNull();
      expect(Validators.minLength(1)(new FormControl(1))).toBeNull();
      expect(Validators.minLength(1)(new FormControl(-1))).toBeNull();
      expect(Validators.minLength(1)(new FormControl(+1))).toBeNull();
    });

    it('should trigger validation for an object that contains numeric length property', () => {
      const value = {length: 5, someValue: [1, 2, 3, 4, 5]};
      expect(Validators.minLength(1)(new FormControl(value))).toBeNull();
      expect(Validators.minLength(10)(new FormControl(value))).toEqual({
        'minlength': {'requiredLength': 10, 'actualLength': 5}
      });
    });

    it('should return null when passing a boolean', () => {
      expect(Validators.minLength(1)(new FormControl(true))).toBeNull();
      expect(Validators.minLength(1)(new FormControl(false))).toBeNull();
    });
  });

  describe('maxLength', () => {
    it('should not error on an empty string', () => {
      expect(Validators.maxLength(2)(new FormControl(''))).toBeNull();
    });

    it('should not error on null', () => {
      expect(Validators.maxLength(2)(new FormControl(null))).toBeNull();
    });

    it('should not error on undefined', () => {
      expect(Validators.maxLength(2)(new FormControl(undefined))).toBeNull();
    });

    it('should not error on valid strings', () => {
      expect(Validators.maxLength(2)(new FormControl('aa'))).toBeNull();
    });

    it('should error on long strings', () => {
      expect(Validators.maxLength(2)(new FormControl('aaa'))).toEqual({
        'maxlength': {'requiredLength': 2, 'actualLength': 3}
      });
    });

    it('should not error when FormArray has valid length', () => {
      const fa = new FormArray([new FormControl(''), new FormControl('')]);
      expect(Validators.maxLength(2)(fa)).toBeNull();
    });

    it('should error when FormArray has invalid length', () => {
      const fa = new FormArray([new FormControl(''), new FormControl('')]);
      expect(Validators.maxLength(1)(fa)).toEqual({
        'maxlength': {'requiredLength': 1, 'actualLength': 2}
      });
    });

    it('should always return null with numeric values', () => {
      expect(Validators.maxLength(1)(new FormControl(0))).toBeNull();
      expect(Validators.maxLength(1)(new FormControl(1))).toBeNull();
      expect(Validators.maxLength(1)(new FormControl(-1))).toBeNull();
      expect(Validators.maxLength(1)(new FormControl(+1))).toBeNull();
    });

    it('should trigger validation for an object that contains numeric length property', () => {
      const value = {length: 5, someValue: [1, 2, 3, 4, 5]};
      expect(Validators.maxLength(10)(new FormControl(value))).toBeNull();
      expect(Validators.maxLength(1)(new FormControl(value))).toEqual({
        'maxlength': {'requiredLength': 1, 'actualLength': 5}
      });
    });

    it('should return null when passing a boolean', () => {
      expect(Validators.maxLength(1)(new FormControl(true))).toBeNull();
      expect(Validators.maxLength(1)(new FormControl(false))).toBeNull();
    });
  });

  describe('pattern', () => {
    it('should not error on an empty string', () => {
      expect(Validators.pattern('[a-zA-Z ]+')(new FormControl(''))).toBeNull();
    });

    it('should not error on null', () => {
      expect(Validators.pattern('[a-zA-Z ]+')(new FormControl(null))).toBeNull();
    });

    it('should not error on undefined', () => {
      expect(Validators.pattern('[a-zA-Z ]+')(new FormControl(undefined))).toBeNull();
    });

    it('should not error on null value and "null" pattern', () => {
      expect(Validators.pattern('null')(new FormControl(null))).toBeNull();
    });

    it('should not error on valid strings',
       () => expect(Validators.pattern('[a-zA-Z ]*')(new FormControl('aaAA'))).toBeNull());

    it('should error on failure to match string', () => {
      expect(Validators.pattern('[a-zA-Z ]*')(new FormControl('aaa0'))).toEqual({
        'pattern': {'requiredPattern': '^[a-zA-Z ]*$', 'actualValue': 'aaa0'}
      });
    });

    it('should accept RegExp object', () => {
      const pattern: RegExp = new RegExp('[a-zA-Z ]+');
      expect(Validators.pattern(pattern)(new FormControl('aaAA'))).toBeNull();
    });

    it('should error on failure to match RegExp object', () => {
      const pattern: RegExp = new RegExp('^[a-zA-Z ]*$');
      expect(Validators.pattern(pattern)(new FormControl('aaa0'))).toEqual({
        'pattern': {'requiredPattern': '/^[a-zA-Z ]*$/', 'actualValue': 'aaa0'}
      });
    });

    it('should not error on "null" pattern',
       () => expect(Validators.pattern(null!)(new FormControl('aaAA'))).toBeNull());

    it('should not error on "undefined" pattern',
       () => expect(Validators.pattern(undefined!)(new FormControl('aaAA'))).toBeNull());

    it('should work with pattern string containing both boundary symbols',
       () => expect(Validators.pattern('^[aA]*$')(new FormControl('aaAA'))).toBeNull());

    it('should work with pattern string containing only start boundary symbols',
       () => expect(Validators.pattern('^[aA]*')(new FormControl('aaAA'))).toBeNull());

    it('should work with pattern string containing only end boundary symbols',
       () => expect(Validators.pattern('[aA]*$')(new FormControl('aaAA'))).toBeNull());

    it('should work with pattern string not containing any boundary symbols',
       () => expect(Validators.pattern('[aA]*')(new FormControl('aaAA'))).toBeNull());
  });

  describe('compose', () => {
    it('should return null when given null', () => {
      expect(Validators.compose(null!)).toBe(null);
    });

    it('should collect errors from all the validators', () => {
      const c = Validators.compose([validator('a', true), validator('b', true)])!;
      expect(c(new FormControl(''))).toEqual({'a': true, 'b': true});
    });

    it('should run validators left to right', () => {
      const c = Validators.compose([validator('a', 1), validator('a', 2)])!;
      expect(c(new FormControl(''))).toEqual({'a': 2});
    });

    it('should return null when no errors', () => {
      const c = Validators.compose([Validators.nullValidator, Validators.nullValidator])!;
      expect(c(new FormControl(''))).toBeNull();
    });

    it('should ignore nulls', () => {
      const c = Validators.compose([null!, Validators.required])!;
      expect(c(new FormControl(''))).toEqual({'required': true});
    });
  });

  describe('composeAsync', () => {
    describe('promises', () => {
      function promiseValidator(response: {[key: string]: any}): AsyncValidatorFn {
        return (c: AbstractControl) => {
          const res = c.value != 'expected' ? response : null;
          return Promise.resolve(res);
        };
      }

      it('should return null when given null', () => {
        expect(Validators.composeAsync(null!)).toBeNull();
      });

      it('should collect errors from all the validators', fakeAsync(() => {
           const v = Validators.composeAsync(
               [promiseValidator({'one': true}), promiseValidator({'two': true})])!;

           let errorMap: {[key: string]: any}|null = null;
           (v(new FormControl('invalid')) as Observable<ValidationErrors|null>)
               .pipe(first())
               .subscribe((errors: {[key: string]: any}|null) => errorMap = errors);
           tick();

           expect(errorMap!).toEqual({'one': true, 'two': true});
         }));

      it('should normalize and evaluate async validator-directives correctly', fakeAsync(() => {
           const normalizedValidators = normalizeValidators<AsyncValidatorFn>(
               [new AsyncValidatorDirective('expected', {'one': true})]);
           const validatorFn = Validators.composeAsync(normalizedValidators)!;

           let errorMap: {[key: string]: any}|null = null;
           (validatorFn(new FormControl('invalid')) as Observable<ValidationErrors|null>)
               .pipe(first())
               .subscribe((errors: {[key: string]: any}|null) => errorMap = errors);
           tick();

           expect(errorMap!).toEqual({'one': true});
         }));

      it('should return null when no errors', fakeAsync(() => {
           const v = Validators.composeAsync([promiseValidator({'one': true})])!;

           let errorMap: {[key: string]: any}|null = undefined!;
           (v(new FormControl('expected')) as Observable<ValidationErrors|null>)
               .pipe(first())
               .subscribe((errors: {[key: string]: any}|null) => errorMap = errors);
           tick();

           expect(errorMap).toBeNull();
         }));

      it('should ignore nulls', fakeAsync(() => {
           const v = Validators.composeAsync([promiseValidator({'one': true}), null!])!;

           let errorMap: {[key: string]: any}|null = null;
           (v(new FormControl('invalid')) as Observable<ValidationErrors|null>)
               .pipe(first())
               .subscribe((errors: {[key: string]: any}|null) => errorMap = errors);
           tick();

           expect(errorMap!).toEqual({'one': true});
         }));
    });

    describe('observables', () => {
      function observableValidator(response: {[key: string]: any}): AsyncValidatorFn {
        return (c: AbstractControl) => {
          const res = c.value != 'expected' ? response : null;
          return of(res);
        };
      }

      it('should return null when given null', () => {
        expect(Validators.composeAsync(null!)).toBeNull();
      });

      it('should collect errors from all the validators', () => {
        const v = Validators.composeAsync(
            [observableValidator({'one': true}), observableValidator({'two': true})])!;

        let errorMap: {[key: string]: any}|null = null;
        (v(new FormControl('invalid')) as Observable<ValidationErrors|null>)
            .pipe(first())
            .subscribe((errors: {[key: string]: any}|null) => errorMap = errors);

        expect(errorMap!).toEqual({'one': true, 'two': true});
      });

      it('should normalize and evaluate async validator-directives correctly', () => {
        const normalizedValidators = normalizeValidators<AsyncValidatorFn>(
            [new AsyncValidatorDirective('expected', {'one': true})]);
        const validatorFn = Validators.composeAsync(normalizedValidators)!;

        let errorMap: {[key: string]: any}|null = null;
        (validatorFn(new FormControl('invalid')) as Observable<ValidationErrors|null>)
            .pipe(first())
            .subscribe((errors: {[key: string]: any}|null) => errorMap = errors)!;

        expect(errorMap!).toEqual({'one': true});
      });

      it('should return null when no errors', () => {
        const v = Validators.composeAsync([observableValidator({'one': true})])!;

        let errorMap: {[key: string]: any}|null = undefined!;
        (v(new FormControl('expected')) as Observable<ValidationErrors|null>)
            .pipe(first())
            .subscribe((errors: {[key: string]: any}|null) => errorMap = errors);

        expect(errorMap).toBeNull();
      });

      it('should ignore nulls', () => {
        const v = Validators.composeAsync([observableValidator({'one': true}), null!])!;

        let errorMap: {[key: string]: any}|null = null;
        (v(new FormControl('invalid')) as Observable<ValidationErrors|null>)
            .pipe(first())
            .subscribe((errors: {[key: string]: any}|null) => errorMap = errors);

        expect(errorMap!).toEqual({'one': true});
      });

      it('should wait for all validators before setting errors', fakeAsync(() => {
           function getTimerObs(time: number, errorMap: {[key: string]: any}): AsyncValidatorFn {
             return (c: AbstractControl) => {
               return timer(time).pipe(map(() => errorMap));
             };
           }

           const v = Validators.composeAsync(
               [getTimerObs(100, {one: true}), getTimerObs(200, {two: true})])!;

           let errorMap: {[key: string]: any}|null|undefined = undefined;
           (v(new FormControl('invalid')) as Observable<ValidationErrors|null>)
               .pipe(first())
               .subscribe((errors: {[key: string]: any}|null) => errorMap = errors);

           tick(100);
           expect(errorMap).not.toBeDefined(
               `Expected errors not to be set until all validators came back.`);

           tick(100);
           expect(errorMap!).toEqual(
               {one: true, two: true}, `Expected errors to merge once all validators resolved.`);
         }));
    });
  });
});
})();
