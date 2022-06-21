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
    const minValidationMessage = 'Min. validation message';

    it('should not error on an empty string', () => {
      expect(Validators.min(2, minValidationMessage)(new FormControl(''))).toBeNull();
    });

    it('should not error on null', () => {
      expect(Validators.min(2, minValidationMessage)(new FormControl(null))).toBeNull();
    });

    it('should not error on undefined', () => {
      expect(Validators.min(2, minValidationMessage)(new FormControl(undefined))).toBeNull();
    });

    it('should return null if NaN after parsing', () => {
      expect(Validators.min(2, minValidationMessage)(new FormControl('a'))).toBeNull();
    });

    it('should return a validation error on small values', () => {
      expect(Validators.min(2, minValidationMessage)(new FormControl(1)))
          .toEqual({'min': {'min': 2, 'actual': 1}, 'message': minValidationMessage});
    });

    it('should return a validation error on small values converted from strings', () => {
      expect(Validators.min(2, minValidationMessage)(new FormControl('1')))
          .toEqual({'min': {'min': 2, 'actual': '1'}, 'message': minValidationMessage});
    });

    it('should not error on small float number validation', () => {
      expect(Validators.min(1.2, minValidationMessage)(new FormControl(1.25))).toBeNull();
    });

    it('should not error on equal float values', () => {
      expect(Validators.min(1.25, minValidationMessage)(new FormControl(1.25))).toBeNull();
    });

    it('should return a validation error on big values', () => {
      expect(Validators.min(1.25, minValidationMessage)(new FormControl(1.2)))
          .toEqual({'min': {'min': 1.25, 'actual': 1.2}, 'message': minValidationMessage});
    });

    it('should not error on big values', () => {
      expect(Validators.min(2, minValidationMessage)(new FormControl(3))).toBeNull();
    });

    it('should not error on equal values', () => {
      expect(Validators.min(2, minValidationMessage)(new FormControl(2))).toBeNull();
    });

    it('should not error on equal values when value is string', () => {
      expect(Validators.min(2, minValidationMessage)(new FormControl('2'))).toBeNull();
    });

    it('should validate as expected when min value is a string', () => {
      expect(Validators.min('2' as any, minValidationMessage)(new FormControl(1)))
          .toEqual({'min': {'min': '2', 'actual': 1}, 'message': minValidationMessage});
    });

    it('should return null if min value is undefined', () => {
      expect(Validators.min(undefined as any, minValidationMessage)(new FormControl(3))).toBeNull();
    });

    it('should return null if min value is null', () => {
      expect(Validators.min(null as any, minValidationMessage)(new FormControl(3))).toBeNull();
    });
  });

  describe('max', () => {
    const maxValidationMessage = 'Max. validation message';

    it('should not error on an empty string', () => {
      expect(Validators.max(2, maxValidationMessage)(new FormControl(''))).toBeNull();
    });

    it('should not error on null', () => {
      expect(Validators.max(2, maxValidationMessage)(new FormControl(null))).toBeNull();
    });

    it('should not error on undefined', () => {
      expect(Validators.max(2, maxValidationMessage)(new FormControl(undefined))).toBeNull();
    });

    it('should return null if NaN after parsing', () => {
      expect(Validators.max(2, maxValidationMessage)(new FormControl('aaa'))).toBeNull();
    });

    it('should not error on small float number validation', () => {
      expect(Validators.max(1.2, maxValidationMessage)(new FormControl(1.15))).toBeNull();
    });

    it('should not error on equal float values', () => {
      expect(Validators.max(1.25, maxValidationMessage)(new FormControl(1.25))).toBeNull();
    });

    it('should return a validation error on big values', () => {
      expect(Validators.max(1.25, maxValidationMessage)(new FormControl(1.3)))
          .toEqual({'max': {'max': 1.25, 'actual': 1.3}, 'message': maxValidationMessage});
    });

    it('should return a validation error on big values', () => {
      expect(Validators.max(2, maxValidationMessage)(new FormControl(3)))
          .toEqual({'max': {'max': 2, 'actual': 3}, 'message': maxValidationMessage});
    });

    it('should return a validation error on big values converted from strings', () => {
      expect(Validators.max(2, maxValidationMessage)(new FormControl('3')))
          .toEqual({'max': {'max': 2, 'actual': '3'}, 'message': maxValidationMessage});
    });

    it('should not error on small values', () => {
      expect(Validators.max(2, maxValidationMessage)(new FormControl(1))).toBeNull();
    });

    it('should not error on equal values', () => {
      expect(Validators.max(2, maxValidationMessage)(new FormControl(2))).toBeNull();
    });

    it('should not error on equal values when value is string', () => {
      expect(Validators.max(2, maxValidationMessage)(new FormControl('2'))).toBeNull();
    });

    it('should validate as expected when max value is a string', () => {
      expect(Validators.max('2' as any, maxValidationMessage)(new FormControl(3)))
          .toEqual({'max': {'max': '2', 'actual': 3}, 'message': maxValidationMessage});
    });

    it('should return null if max value is undefined', () => {
      expect(Validators.max(undefined as any, maxValidationMessage)(new FormControl(3))).toBeNull();
    });

    it('should return null if max value is null', () => {
      expect(Validators.max(null as any, maxValidationMessage)(new FormControl(3))).toBeNull();
    });
  });

  describe('required', () => {
    const requiredValidationMessage = 'Required validation message';

    it('should error on an empty string', () => {
      expect(Validators.required(requiredValidationMessage)(new FormControl('')))
          .toEqual({'required': true, 'message': requiredValidationMessage});
    });

    it('should error on null', () => {
      expect(Validators.required(requiredValidationMessage)(new FormControl(null)))
          .toEqual({'required': true, 'message': requiredValidationMessage});
    });

    it('should not error on undefined', () => {
      expect(Validators.required(requiredValidationMessage)(new FormControl(undefined)))
          .toEqual({'required': true, 'message': requiredValidationMessage});
    });

    it('should not error on a non-empty string', () => {
      expect(Validators.required(requiredValidationMessage)(new FormControl('not empty')))
          .toBeNull();
    });

    it('should accept zero as valid', () => {
      expect(Validators.required(requiredValidationMessage)(new FormControl(0))).toBeNull();
    });

    it('should error on an empty array',
       () => expect(Validators.required(requiredValidationMessage)(new FormControl([])))
                 .toEqual({'required': true, 'message': requiredValidationMessage}));

    it('should not error on a non-empty array',
       () => expect(Validators.required(requiredValidationMessage)(new FormControl([1, 2])))
                 .toBeNull());

    it('should not error on an object containing a length attribute that is zero', () => {
      expect(Validators.required(requiredValidationMessage)(
                 new FormControl({id: 1, length: 0, width: 0})))
          .toBeNull();
    });
  });

  describe('requiredTrue', () => {
    const requiredTrueValidationMessage = 'Required true validation message';

    it('should error on false',
       () => expect(Validators.requiredTrue(requiredTrueValidationMessage)(new FormControl(false)))
                 .toEqual({'required': true, 'message': requiredTrueValidationMessage}));

    it('should not error on true',
       () => expect(Validators.requiredTrue(requiredTrueValidationMessage)(new FormControl(true)))
                 .toBeNull());
  });

  describe('email', () => {
    const emailValidationMessage = 'Email validation message';

    it('should not error on an empty string',
       () => expect(Validators.email(emailValidationMessage)(new FormControl(''))).toBeNull());

    it('should not error on null',
       () => expect(Validators.email(emailValidationMessage)(new FormControl(null))).toBeNull());

    it('should error on invalid email',
       () => expect(Validators.email(emailValidationMessage)(new FormControl('some text')))
                 .toEqual({'email': true, 'message': emailValidationMessage}));

    it('should not error on valid email',
       () => expect(Validators.email(emailValidationMessage)(new FormControl('test@gmail.com')))
                 .toBeNull());
  });

  describe('minLength', () => {
    const minLengthValidationMessage = 'Min. Length validation message';

    it('should not error on an empty string', () => {
      expect(Validators.minLength(2, minLengthValidationMessage)(new FormControl(''))).toBeNull();
    });

    it('should not error on null', () => {
      expect(Validators.minLength(2, minLengthValidationMessage)(new FormControl(null))).toBeNull();
    });

    it('should not error on undefined', () => {
      expect(Validators.minLength(2, minLengthValidationMessage)(new FormControl(undefined)))
          .toBeNull();
    });

    it('should not error on valid strings', () => {
      expect(Validators.minLength(2, minLengthValidationMessage)(new FormControl('aa'))).toBeNull();
    });

    it('should error on short strings', () => {
      expect(Validators.minLength(2, minLengthValidationMessage)(new FormControl('a'))).toEqual({
        'minlength': {'requiredLength': 2, 'actualLength': 1},
        'message': minLengthValidationMessage
      });
    });

    it('should not error when FormArray has valid length', () => {
      const fa = new FormArray([new FormControl(''), new FormControl('')]);
      expect(Validators.minLength(2, minLengthValidationMessage)(fa)).toBeNull();
    });

    it('should error when FormArray has invalid length', () => {
      const fa = new FormArray([new FormControl('')]);
      expect(Validators.minLength(2, minLengthValidationMessage)(fa)).toEqual({
        'minlength': {'requiredLength': 2, 'actualLength': 1},
        'message': minLengthValidationMessage
      });
    });

    it('should always return null with numeric values', () => {
      expect(Validators.minLength(1, minLengthValidationMessage)(new FormControl(0))).toBeNull();
      expect(Validators.minLength(1, minLengthValidationMessage)(new FormControl(1))).toBeNull();
      expect(Validators.minLength(1, minLengthValidationMessage)(new FormControl(-1))).toBeNull();
      expect(Validators.minLength(1, minLengthValidationMessage)(new FormControl(+1))).toBeNull();
    });

    it('should trigger validation for an object that contains numeric length property', () => {
      const value = {length: 5, someValue: [1, 2, 3, 4, 5]};
      expect(Validators.minLength(1, minLengthValidationMessage)(new FormControl(value)))
          .toBeNull();
      expect(Validators.minLength(10, minLengthValidationMessage)(new FormControl(value))).toEqual({
        'minlength': {'requiredLength': 10, 'actualLength': 5},
        'message': minLengthValidationMessage
      });
    });

    it('should return null when passing a boolean', () => {
      expect(Validators.minLength(1, minLengthValidationMessage)(new FormControl(true))).toBeNull();
      expect(Validators.minLength(1, minLengthValidationMessage)(new FormControl(false)))
          .toBeNull();
    });
  });

  describe('maxLength', () => {
    const maxLengthValidationMessage = 'Max. length validation message';
    it('should not error on an empty string', () => {
      expect(Validators.maxLength(2, maxLengthValidationMessage)(new FormControl(''))).toBeNull();
    });

    it('should not error on null', () => {
      expect(Validators.maxLength(2, maxLengthValidationMessage)(new FormControl(null))).toBeNull();
    });

    it('should not error on undefined', () => {
      expect(Validators.maxLength(2, maxLengthValidationMessage)(new FormControl(undefined)))
          .toBeNull();
    });

    it('should not error on valid strings', () => {
      expect(Validators.maxLength(2, maxLengthValidationMessage)(new FormControl('aa'))).toBeNull();
    });

    it('should error on long strings', () => {
      expect(Validators.maxLength(2, maxLengthValidationMessage)(new FormControl('aaa'))).toEqual({
        'maxlength': {'requiredLength': 2, 'actualLength': 3},
        'message': maxLengthValidationMessage
      });
    });

    it('should not error when FormArray has valid length', () => {
      const fa = new FormArray([new FormControl(''), new FormControl('')]);
      expect(Validators.maxLength(2, maxLengthValidationMessage)(fa)).toBeNull();
    });

    it('should error when FormArray has invalid length', () => {
      const fa = new FormArray([new FormControl(''), new FormControl('')]);
      expect(Validators.maxLength(1, maxLengthValidationMessage)(fa)).toEqual({
        'maxlength': {'requiredLength': 1, 'actualLength': 2},
        'message': maxLengthValidationMessage
      });
    });

    it('should always return null with numeric values', () => {
      expect(Validators.maxLength(1, maxLengthValidationMessage)(new FormControl(0))).toBeNull();
      expect(Validators.maxLength(1, maxLengthValidationMessage)(new FormControl(1))).toBeNull();
      expect(Validators.maxLength(1, maxLengthValidationMessage)(new FormControl(-1))).toBeNull();
      expect(Validators.maxLength(1, maxLengthValidationMessage)(new FormControl(+1))).toBeNull();
    });

    it('should trigger validation for an object that contains numeric length property', () => {
      const value = {length: 5, someValue: [1, 2, 3, 4, 5]};
      expect(Validators.maxLength(10, maxLengthValidationMessage)(new FormControl(value)))
          .toBeNull();
      expect(Validators.maxLength(1, maxLengthValidationMessage)(new FormControl(value))).toEqual({
        'maxlength': {'requiredLength': 1, 'actualLength': 5},
        'message': maxLengthValidationMessage
      });
    });

    it('should return null when passing a boolean', () => {
      expect(Validators.maxLength(1, maxLengthValidationMessage)(new FormControl(true))).toBeNull();
      expect(Validators.maxLength(1, maxLengthValidationMessage)(new FormControl(false)))
          .toBeNull();
    });
  });

  describe('pattern', () => {
    const patternValidationMessage = 'Pattern validation message';

    it('should not error on an empty string', () => {
      expect(Validators.pattern('[a-zA-Z ]+', patternValidationMessage)(new FormControl('')))
          .toBeNull();
    });

    it('should not error on null', () => {
      expect(Validators.pattern('[a-zA-Z ]+', patternValidationMessage)(new FormControl(null)))
          .toBeNull();
    });

    it('should not error on undefined', () => {
      expect(Validators.pattern('[a-zA-Z ]+', patternValidationMessage)(new FormControl(undefined)))
          .toBeNull();
    });

    it('should not error on null value and "null" pattern', () => {
      expect(Validators.pattern('null', patternValidationMessage)(new FormControl(null)))
          .toBeNull();
    });

    it('should not error on valid strings',
       () => expect(Validators.pattern(
                        '[a-zA-Z ]*', patternValidationMessage)(new FormControl('aaAA')))
                 .toBeNull());

    it('should error on failure to match string', () => {
      expect(Validators.pattern('[a-zA-Z ]*', patternValidationMessage)(new FormControl('aaa0')))
          .toEqual({
            'pattern': {'requiredPattern': '^[a-zA-Z ]*$', 'actualValue': 'aaa0'},
            'message': patternValidationMessage
          });
    });

    it('should accept RegExp object', () => {
      const pattern: RegExp = new RegExp('[a-zA-Z ]+');
      expect(Validators.pattern(pattern, patternValidationMessage)(new FormControl('aaAA')))
          .toBeNull();
    });

    it('should error on failure to match RegExp object', () => {
      const pattern: RegExp = new RegExp('^[a-zA-Z ]*$');
      expect(Validators.pattern(pattern, patternValidationMessage)(new FormControl('aaa0')))
          .toEqual({
            'pattern': {'requiredPattern': '/^[a-zA-Z ]*$/', 'actualValue': 'aaa0'},
            'message': patternValidationMessage
          });
    });

    it('should not error on "null" pattern',
       () => expect(Validators.pattern(null!, patternValidationMessage)(new FormControl('aaAA')))
                 .toBeNull());

    it('should not error on "undefined" pattern',
       () =>
           expect(Validators.pattern(undefined!, patternValidationMessage)(new FormControl('aaAA')))
               .toBeNull());

    it('should work with pattern string containing both boundary symbols',
       () =>
           expect(Validators.pattern('^[aA]*$', patternValidationMessage)(new FormControl('aaAA')))
               .toBeNull());

    it('should work with pattern string containing only start boundary symbols',
       () => expect(Validators.pattern('^[aA]*', patternValidationMessage)(new FormControl('aaAA')))
                 .toBeNull());

    it('should work with pattern string containing only end boundary symbols',
       () => expect(Validators.pattern('[aA]*$', patternValidationMessage)(new FormControl('aaAA')))
                 .toBeNull());

    it('should work with pattern string not containing any boundary symbols',
       () => expect(Validators.pattern('[aA]*', patternValidationMessage)(new FormControl('aaAA')))
                 .toBeNull());
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
      const c = Validators.compose([null!, Validators.required('Required field')])!;
      expect(c(new FormControl(''))).toEqual({'required': true, 'message': 'Required field'});
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
           const v = Validators.composeAsync([
             promiseValidator({'one': true}),
             promiseValidator({'two': true}),
           ])!;

           let errorMap: {[key: string]: any}|null = null;
           (v(new FormControl('invalid')) as Observable<ValidationErrors|null>)
               .pipe(first())
               .subscribe((errors: {[key: string]: any}|null) => (errorMap = errors));
           tick();

           expect(errorMap!).toEqual({'one': true, 'two': true});
         }));

      it('should normalize and evaluate async validator-directives correctly', fakeAsync(() => {
           const normalizedValidators = normalizeValidators<AsyncValidatorFn>([
             new AsyncValidatorDirective('expected', {'one': true}),
           ]);
           const validatorFn = Validators.composeAsync(normalizedValidators)!;

           let errorMap: {[key: string]: any}|null = null;
           (validatorFn(new FormControl('invalid')) as Observable<ValidationErrors|null>)
               .pipe(first())
               .subscribe((errors: {[key: string]: any}|null) => (errorMap = errors));
           tick();

           expect(errorMap!).toEqual({'one': true});
         }));

      it('should return null when no errors', fakeAsync(() => {
           const v = Validators.composeAsync([promiseValidator({'one': true})])!;

           let errorMap: {[key: string]: any}|null = undefined!;
           (v(new FormControl('expected')) as Observable<ValidationErrors|null>)
               .pipe(first())
               .subscribe((errors: {[key: string]: any}|null) => (errorMap = errors));
           tick();

           expect(errorMap).toBeNull();
         }));

      it('should ignore nulls', fakeAsync(() => {
           const v = Validators.composeAsync([promiseValidator({'one': true}), null!])!;

           let errorMap: {[key: string]: any}|null = null;
           (v(new FormControl('invalid')) as Observable<ValidationErrors|null>)
               .pipe(first())
               .subscribe((errors: {[key: string]: any}|null) => (errorMap = errors));
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
        const v = Validators.composeAsync([
          observableValidator({'one': true}),
          observableValidator({'two': true}),
        ])!;

        let errorMap: {[key: string]: any}|null = null;
        (v(new FormControl('invalid')) as Observable<ValidationErrors|null>)
            .pipe(first())
            .subscribe((errors: {[key: string]: any}|null) => (errorMap = errors));

        expect(errorMap!).toEqual({'one': true, 'two': true});
      });

      it('should normalize and evaluate async validator-directives correctly', () => {
        const normalizedValidators = normalizeValidators<AsyncValidatorFn>([
          new AsyncValidatorDirective('expected', {'one': true}),
        ]);
        const validatorFn = Validators.composeAsync(normalizedValidators)!;

        let errorMap: {[key: string]: any}|null = null;
        (validatorFn(new FormControl('invalid')) as Observable<ValidationErrors|null>)
            .pipe(first())
            .subscribe((errors: {[key: string]: any}|null) => (errorMap = errors))!;

        expect(errorMap!).toEqual({'one': true});
      });

      it('should return null when no errors', () => {
        const v = Validators.composeAsync([observableValidator({'one': true})])!;

        let errorMap: {[key: string]: any}|null = undefined!;
        (v(new FormControl('expected')) as Observable<ValidationErrors|null>)
            .pipe(first())
            .subscribe((errors: {[key: string]: any}|null) => (errorMap = errors));

        expect(errorMap).toBeNull();
      });

      it('should ignore nulls', () => {
        const v = Validators.composeAsync([observableValidator({'one': true}), null!])!;

        let errorMap: {[key: string]: any}|null = null;
        (v(new FormControl('invalid')) as Observable<ValidationErrors|null>)
            .pipe(first())
            .subscribe((errors: {[key: string]: any}|null) => (errorMap = errors));

        expect(errorMap!).toEqual({'one': true});
      });

      it('should wait for all validators before setting errors', fakeAsync(() => {
           function getTimerObs(time: number, errorMap: {[key: string]: any}): AsyncValidatorFn {
             return (c: AbstractControl) => {
               return timer(time).pipe(map(() => errorMap));
             };
           }

           const v = Validators.composeAsync([
             getTimerObs(100, {one: true}),
             getTimerObs(200, {two: true}),
           ])!;

           let errorMap: {[key: string]: any}|null|undefined = undefined;
           (v(new FormControl('invalid')) as Observable<ValidationErrors|null>)
               .pipe(first())
               .subscribe((errors: {[key: string]: any}|null) => (errorMap = errors));

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
