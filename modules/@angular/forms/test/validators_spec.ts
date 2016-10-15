/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {fakeAsync, tick} from '@angular/core/testing';
import {describe, expect, it} from '@angular/core/testing/testing_internal';
import {AbstractControl, FormControl, Validators} from '@angular/forms';
import {Observable} from 'rxjs/Observable';

import {normalizeAsyncValidator} from '../src/directives/normalize_validator';
import {EventEmitter} from '../src/facade/async';

export function main() {
  function validator(key: string, error: any) {
    return function(c: AbstractControl) {
      const r: {[k: string]: string} = {};
      r[key] = error;
      return r;
    };
  }

  class AsyncValidatorDirective {
    constructor(private expected: string, private error: any) {}

    validate(c: any): {[key: string]: any;} {
      return Observable.create((obs: any) => {
        const error = this.expected !== c.value ? this.error : null;
        obs.next(error);
        obs.complete();
      });
    }
  }

  describe('Validators', () => {
    describe('required', () => {
      it('should error on an empty string',
         () => { expect(Validators.required(new FormControl(''))).toEqual({'required': true}); });

      it('should error on null',
         () => { expect(Validators.required(new FormControl(null))).toEqual({'required': true}); });

      it('should not error on a non-empty string',
         () => { expect(Validators.required(new FormControl('not empty'))).toBeNull(); });

      it('should accept zero as valid',
         () => { expect(Validators.required(new FormControl(0))).toBeNull(); });
    });

    describe('minLength', () => {
      it('should not error on an empty string',
         () => { expect(Validators.minLength(2)(new FormControl(''))).toBeNull(); });

      it('should not error on null',
         () => { expect(Validators.minLength(2)(new FormControl(null))).toBeNull(); });

      it('should not error on undefined',
         () => { expect(Validators.minLength(2)(new FormControl(null))).toBeNull(); });

      it('should not error on valid strings',
         () => { expect(Validators.minLength(2)(new FormControl('aa'))).toBeNull(); });

      it('should error on short strings', () => {
        expect(Validators.minLength(2)(new FormControl('a'))).toEqual({
          'minlength': {'requiredLength': 2, 'actualLength': 1}
        });
      });
    });

    describe('maxLength', () => {
      it('should not error on an empty string',
         () => { expect(Validators.maxLength(2)(new FormControl(''))).toBeNull(); });

      it('should not error on null',
         () => { expect(Validators.maxLength(2)(new FormControl(null))).toBeNull(); });

      it('should not error on valid strings',
         () => { expect(Validators.maxLength(2)(new FormControl('aa'))).toBeNull(); });

      it('should error on long strings', () => {
        expect(Validators.maxLength(2)(new FormControl('aaa'))).toEqual({
          'maxlength': {'requiredLength': 2, 'actualLength': 3}
        });
      });
    });

    describe('pattern', () => {
      it('should not error on an empty string',
         () => { expect(Validators.pattern('[a-zA-Z ]+')(new FormControl(''))).toBeNull(); });

      it('should not error on null',
         () => { expect(Validators.pattern('[a-zA-Z ]+')(new FormControl(null))).toBeNull(); });

      it('should not error on undefined',
         () => { expect(Validators.pattern('[a-zA-Z ]+')(new FormControl(null))).toBeNull(); });

      it('should not error on null value and "null" pattern',
         () => { expect(Validators.pattern('null')(new FormControl(null))).toBeNull(); });

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
         () => expect(Validators.pattern(null)(new FormControl('aaAA'))).toBeNull());

      it('should not error on "undefined" pattern',
         () => expect(Validators.pattern(undefined)(new FormControl('aaAA'))).toBeNull());
    });

    describe('compose', () => {
      it('should return null when given null',
         () => { expect(Validators.compose(null)).toBe(null); });

      it('should collect errors from all the validators', () => {
        const c = Validators.compose([validator('a', true), validator('b', true)]);
        expect(c(new FormControl(''))).toEqual({'a': true, 'b': true});
      });

      it('should run validators left to right', () => {
        const c = Validators.compose([validator('a', 1), validator('a', 2)]);
        expect(c(new FormControl(''))).toEqual({'a': 2});
      });

      it('should return null when no errors', () => {
        const c = Validators.compose([Validators.nullValidator, Validators.nullValidator]);
        expect(c(new FormControl(''))).toBeNull();
      });

      it('should ignore nulls', () => {
        const c = Validators.compose([null, Validators.required]);
        expect(c(new FormControl(''))).toEqual({'required': true});
      });
    });

    describe('composeAsync', () => {
      function asyncValidator(expected: any /** TODO #9100 */, response: any /** TODO #9100 */) {
        return (c: any /** TODO #9100 */) => {
          var emitter = new EventEmitter();
          var res = c.value != expected ? response : null;
          Promise.resolve(null).then(() => {
            emitter.emit(res);
            // this is required because of a bug in ObservableWrapper
            // where callComplete can fire before callEmit
            // remove this one the bug is fixed
            setTimeout(() => { emitter.complete(); }, 0);
          });

          return emitter;
        };
      }

      it('should return null when given null',
         () => { expect(Validators.composeAsync(null)).toBeNull(); });

      it('should collect errors from all the validators', fakeAsync(() => {
           var c = Validators.composeAsync([
             asyncValidator('expected', {'one': true}), asyncValidator('expected', {'two': true})
           ]);

           var value: any /** TODO #9100 */ = null;
           (<Promise<any>>c(new FormControl('invalid'))).then(v => value = v);

           tick(1);

           expect(value).toEqual({'one': true, 'two': true});
         }));

      it('should normalize and evaluate async validator-directives correctly', fakeAsync(() => {
           const c = Validators.composeAsync(
               [normalizeAsyncValidator(new AsyncValidatorDirective('expected', {'one': true}))]);

           let value: any = null;
           c(new FormControl()).then((v: any) => value = v);
           tick(1);

           expect(value).toEqual({'one': true});
         }));

      it('should return null when no errors', fakeAsync(() => {
           var c = Validators.composeAsync([asyncValidator('expected', {'one': true})]);

           var value: any /** TODO #9100 */ = null;
           (<Promise<any>>c(new FormControl('expected'))).then(v => value = v);
           tick(1);

           expect(value).toBeNull();
         }));

      it('should ignore nulls', fakeAsync(() => {
           var c = Validators.composeAsync([asyncValidator('expected', {'one': true}), null]);

           var value: any /** TODO #9100 */ = null;
           (<Promise<any>>c(new FormControl('invalid'))).then(v => value = v);

           tick(1);

           expect(value).toEqual({'one': true});
         }));
    });
  });
}
