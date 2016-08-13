/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {fakeAsync, tick} from '@angular/core/testing';
import {AsyncTestCompleter, beforeEach, ddescribe, describe, iit, inject, it, xit} from '@angular/core/testing/testing_internal';
import {FormArray, FormControl, FormGroup} from '@angular/forms';

import {isPresent} from '../src/facade/lang';

export function main() {
  function asyncValidator(expected: any /** TODO #9100 */, timeouts = {}) {
    return (c: any /** TODO #9100 */) => {
      var resolve: (result: any) => void;
      var promise = new Promise(res => { resolve = res; });
      var t = isPresent((timeouts as any /** TODO #9100 */)[c.value]) ?
          (timeouts as any /** TODO #9100 */)[c.value] :
          0;
      var res = c.value != expected ? {'async': true} : null;

      if (t == 0) {
        resolve(res);
      } else {
        setTimeout(() => { resolve(res); }, t);
      }

      return promise;
    };
  }

  describe('FormArray', () => {
    describe('adding/removing', () => {
      var a: FormArray;
      var c1: any /** TODO #9100 */, c2: any /** TODO #9100 */, c3: any /** TODO #9100 */;

      beforeEach(() => {
        a = new FormArray([]);
        c1 = new FormControl(1);
        c2 = new FormControl(2);
        c3 = new FormControl(3);
      });

      it('should support pushing', () => {
        a.push(c1);
        expect(a.length).toEqual(1);
        expect(a.controls).toEqual([c1]);
      });

      it('should support removing', () => {
        a.push(c1);
        a.push(c2);
        a.push(c3);

        a.removeAt(1);

        expect(a.controls).toEqual([c1, c3]);
      });

      it('should support inserting', () => {
        a.push(c1);
        a.push(c3);

        a.insert(1, c2);

        expect(a.controls).toEqual([c1, c2, c3]);
      });
    });

    describe('value', () => {
      it('should be the reduced value of the child controls', () => {
        var a = new FormArray([new FormControl(1), new FormControl(2)]);
        expect(a.value).toEqual([1, 2]);
      });

      it('should be an empty array when there are no child controls', () => {
        var a = new FormArray([]);
        expect(a.value).toEqual([]);
      });
    });

    describe('setValue', () => {
      let c: FormControl, c2: FormControl, a: FormArray;

      beforeEach(() => {
        c = new FormControl('');
        c2 = new FormControl('');
        a = new FormArray([c, c2]);
      });

      it('should set its own value', () => {
        a.setValue(['one', 'two']);
        expect(a.value).toEqual(['one', 'two']);
      });

      it('should set child values', () => {
        a.setValue(['one', 'two']);
        expect(c.value).toEqual('one');
        expect(c2.value).toEqual('two');
      });

      it('should set parent values', () => {
        const form = new FormGroup({'parent': a});
        a.setValue(['one', 'two']);
        expect(form.value).toEqual({'parent': ['one', 'two']});
      });

      it('should throw if fields are missing from supplied value (subset)', () => {
        expect(() => a.setValue([, 'two']))
            .toThrowError(new RegExp(`Must supply a value for form control at index: 0`));
      });

      it('should throw if a value is provided for a missing control (superset)', () => {
        expect(() => a.setValue([
          'one', 'two', 'three'
        ])).toThrowError(new RegExp(`Cannot find form control at index 2`));
      });

      it('should throw if no controls are set yet', () => {
        const empty = new FormArray([]);
        expect(() => empty.setValue(['one']))
            .toThrowError(new RegExp(`no form controls registered with this array`));
      });

      describe('setValue() events', () => {
        let form: FormGroup;
        let logger: any[];

        beforeEach(() => {
          form = new FormGroup({'parent': a});
          logger = [];
        });

        it('should emit one valueChange event per control', () => {
          form.valueChanges.subscribe(() => logger.push('form'));
          a.valueChanges.subscribe(() => logger.push('array'));
          c.valueChanges.subscribe(() => logger.push('control1'));
          c2.valueChanges.subscribe(() => logger.push('control2'));

          a.setValue(['one', 'two']);
          expect(logger).toEqual(['control1', 'control2', 'array', 'form']);
        });

        it('should emit one statusChange event per control', () => {
          form.statusChanges.subscribe(() => logger.push('form'));
          a.statusChanges.subscribe(() => logger.push('array'));
          c.statusChanges.subscribe(() => logger.push('control1'));
          c2.statusChanges.subscribe(() => logger.push('control2'));

          a.setValue(['one', 'two']);
          expect(logger).toEqual(['control1', 'control2', 'array', 'form']);
        });
      });
    });

    describe('patchValue', () => {
      let c: FormControl, c2: FormControl, a: FormArray;

      beforeEach(() => {
        c = new FormControl('');
        c2 = new FormControl('');
        a = new FormArray([c, c2]);
      });

      it('should set its own value', () => {
        a.patchValue(['one', 'two']);
        expect(a.value).toEqual(['one', 'two']);
      });

      it('should set child values', () => {
        a.patchValue(['one', 'two']);
        expect(c.value).toEqual('one');
        expect(c2.value).toEqual('two');
      });

      it('should set parent values', () => {
        const form = new FormGroup({'parent': a});
        a.patchValue(['one', 'two']);
        expect(form.value).toEqual({'parent': ['one', 'two']});
      });

      it('should ignore fields that are missing from supplied value (subset)', () => {
        a.patchValue([, 'two']);
        expect(a.value).toEqual(['', 'two']);
      });

      it('should not ignore fields that are null', () => {
        a.patchValue([null]);
        expect(a.value).toEqual([null, '']);
      });

      it('should ignore any value provided for a missing control (superset)', () => {
        a.patchValue([, , 'three']);
        expect(a.value).toEqual(['', '']);
      });

      describe('patchValue() events', () => {
        let form: FormGroup;
        let logger: any[];

        beforeEach(() => {
          form = new FormGroup({'parent': a});
          logger = [];
        });

        it('should emit one valueChange event per control', () => {
          form.valueChanges.subscribe(() => logger.push('form'));
          a.valueChanges.subscribe(() => logger.push('array'));
          c.valueChanges.subscribe(() => logger.push('control1'));
          c2.valueChanges.subscribe(() => logger.push('control2'));

          a.patchValue(['one', 'two']);
          expect(logger).toEqual(['control1', 'control2', 'array', 'form']);
        });

        it('should not emit valueChange events for skipped controls', () => {
          form.valueChanges.subscribe(() => logger.push('form'));
          a.valueChanges.subscribe(() => logger.push('array'));
          c.valueChanges.subscribe(() => logger.push('control1'));
          c2.valueChanges.subscribe(() => logger.push('control2'));

          a.patchValue(['one']);
          expect(logger).toEqual(['control1', 'array', 'form']);
        });

        it('should emit one statusChange event per control', () => {
          form.statusChanges.subscribe(() => logger.push('form'));
          a.statusChanges.subscribe(() => logger.push('array'));
          c.statusChanges.subscribe(() => logger.push('control1'));
          c2.statusChanges.subscribe(() => logger.push('control2'));

          a.patchValue(['one', 'two']);
          expect(logger).toEqual(['control1', 'control2', 'array', 'form']);
        });
      });
    });

    describe('reset()', () => {
      let c: FormControl, c2: FormControl, a: FormArray;

      beforeEach(() => {
        c = new FormControl('initial value');
        c2 = new FormControl('');
        a = new FormArray([c, c2]);
      });

      it('should set its own value if value passed', () => {
        a.setValue(['new value', 'new value']);

        a.reset(['initial value', '']);
        expect(a.value).toEqual(['initial value', '']);
      });


      it('should clear its own value if no value passed', () => {
        a.setValue(['new value', 'new value']);

        a.reset();
        expect(a.value).toEqual([null, null]);
      });

      it('should set the value of each of its child controls if value passed', () => {
        a.setValue(['new value', 'new value']);

        a.reset(['initial value', '']);
        expect(c.value).toBe('initial value');
        expect(c2.value).toBe('');
      });

      it('should clear the value of each of its child controls if no value', () => {
        a.setValue(['new value', 'new value']);

        a.reset();
        expect(c.value).toBe(null);
        expect(c2.value).toBe(null);
      });

      it('should set the value of its parent if value passed', () => {
        const form = new FormGroup({'a': a});
        a.setValue(['new value', 'new value']);

        a.reset(['initial value', '']);
        expect(form.value).toEqual({'a': ['initial value', '']});
      });

      it('should clear the value of its parent if no value passed', () => {
        const form = new FormGroup({'a': a});
        a.setValue(['new value', 'new value']);

        a.reset();
        expect(form.value).toEqual({'a': [null, null]});
      });

      it('should mark itself as pristine', () => {
        a.markAsDirty();
        expect(a.pristine).toBe(false);

        a.reset();
        expect(a.pristine).toBe(true);
      });

      it('should mark all child controls as pristine', () => {
        c.markAsDirty();
        c2.markAsDirty();
        expect(c.pristine).toBe(false);
        expect(c2.pristine).toBe(false);

        a.reset();
        expect(c.pristine).toBe(true);
        expect(c2.pristine).toBe(true);
      });

      it('should mark the parent as pristine if all siblings pristine', () => {
        const c3 = new FormControl('');
        const form = new FormGroup({'a': a, 'c3': c3});

        a.markAsDirty();
        expect(form.pristine).toBe(false);

        a.reset();
        expect(form.pristine).toBe(true);
      });

      it('should not mark the parent pristine if any dirty siblings', () => {
        const c3 = new FormControl('');
        const form = new FormGroup({'a': a, 'c3': c3});

        a.markAsDirty();
        c3.markAsDirty();
        expect(form.pristine).toBe(false);

        a.reset();
        expect(form.pristine).toBe(false);
      });

      it('should mark itself as untouched', () => {
        a.markAsTouched();
        expect(a.untouched).toBe(false);

        a.reset();
        expect(a.untouched).toBe(true);
      });

      it('should mark all child controls as untouched', () => {
        c.markAsTouched();
        c2.markAsTouched();
        expect(c.untouched).toBe(false);
        expect(c2.untouched).toBe(false);

        a.reset();
        expect(c.untouched).toBe(true);
        expect(c2.untouched).toBe(true);
      });

      it('should mark the parent untouched if all siblings untouched', () => {
        const c3 = new FormControl('');
        const form = new FormGroup({'a': a, 'c3': c3});

        a.markAsTouched();
        expect(form.untouched).toBe(false);

        a.reset();
        expect(form.untouched).toBe(true);
      });

      it('should not mark the parent untouched if any touched siblings', () => {
        const c3 = new FormControl('');
        const form = new FormGroup({'a': a, 'c3': c3});

        a.markAsTouched();
        c3.markAsTouched();
        expect(form.untouched).toBe(false);

        a.reset();
        expect(form.untouched).toBe(false);
      });

      describe('reset() events', () => {
        let form: FormGroup, c3: FormControl, logger: any[];

        beforeEach(() => {
          c3 = new FormControl('');
          form = new FormGroup({'a': a, 'c3': c3});
          logger = [];
        });

        it('should emit one valueChange event per reset control', () => {
          form.valueChanges.subscribe(() => logger.push('form'));
          a.valueChanges.subscribe(() => logger.push('array'));
          c.valueChanges.subscribe(() => logger.push('control1'));
          c2.valueChanges.subscribe(() => logger.push('control2'));
          c3.valueChanges.subscribe(() => logger.push('control3'));

          a.reset();
          expect(logger).toEqual(['control1', 'control2', 'array', 'form']);
        });

        it('should emit one statusChange event per reset control', () => {
          form.statusChanges.subscribe(() => logger.push('form'));
          a.statusChanges.subscribe(() => logger.push('array'));
          c.statusChanges.subscribe(() => logger.push('control1'));
          c2.statusChanges.subscribe(() => logger.push('control2'));
          c3.statusChanges.subscribe(() => logger.push('control3'));

          a.reset();
          expect(logger).toEqual(['control1', 'control2', 'array', 'form']);
        });
      });
    });

    describe('errors', () => {
      it('should run the validator when the value changes', () => {
        var simpleValidator = (c: any /** TODO #9100 */) =>
            c.controls[0].value != 'correct' ? {'broken': true} : null;

        var c = new FormControl(null);
        var g = new FormArray([c], simpleValidator);

        c.setValue('correct');

        expect(g.valid).toEqual(true);
        expect(g.errors).toEqual(null);

        c.setValue('incorrect');

        expect(g.valid).toEqual(false);
        expect(g.errors).toEqual({'broken': true});
      });
    });


    describe('dirty', () => {
      var c: FormControl;
      var a: FormArray;

      beforeEach(() => {
        c = new FormControl('value');
        a = new FormArray([c]);
      });

      it('should be false after creating a control', () => { expect(a.dirty).toEqual(false); });

      it('should be true after changing the value of the control', () => {
        c.markAsDirty();

        expect(a.dirty).toEqual(true);
      });
    });

    describe('touched', () => {
      var c: FormControl;
      var a: FormArray;

      beforeEach(() => {
        c = new FormControl('value');
        a = new FormArray([c]);
      });

      it('should be false after creating a control', () => { expect(a.touched).toEqual(false); });

      it('should be true after child control is marked as touched', () => {
        c.markAsTouched();

        expect(a.touched).toEqual(true);
      });
    });


    describe('pending', () => {
      var c: FormControl;
      var a: FormArray;

      beforeEach(() => {
        c = new FormControl('value');
        a = new FormArray([c]);
      });

      it('should be false after creating a control', () => {
        expect(c.pending).toEqual(false);
        expect(a.pending).toEqual(false);
      });

      it('should be true after changing the value of the control', () => {
        c.markAsPending();

        expect(c.pending).toEqual(true);
        expect(a.pending).toEqual(true);
      });

      it('should not update the parent when onlySelf = true', () => {
        c.markAsPending({onlySelf: true});

        expect(c.pending).toEqual(true);
        expect(a.pending).toEqual(false);
      });
    });

    describe('valueChanges', () => {
      var a: FormArray;
      var c1: any /** TODO #9100 */, c2: any /** TODO #9100 */;

      beforeEach(() => {
        c1 = new FormControl('old1');
        c2 = new FormControl('old2');
        a = new FormArray([c1, c2]);
      });

      it('should fire an event after the value has been updated',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           a.valueChanges.subscribe({
             next: (value: any) => {
               expect(a.value).toEqual(['new1', 'old2']);
               expect(value).toEqual(['new1', 'old2']);
               async.done();
             }
           });
           c1.setValue('new1');
         }));

      it('should fire an event after the control\'s observable fired an event',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           var controlCallbackIsCalled = false;


           c1.valueChanges.subscribe({next: (value: any) => { controlCallbackIsCalled = true; }});

           a.valueChanges.subscribe({
             next: (value: any) => {
               expect(controlCallbackIsCalled).toBe(true);
               async.done();
             }
           });

           c1.setValue('new1');
         }));

      it('should fire an event when a control is removed',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           a.valueChanges.subscribe({
             next: (value: any) => {
               expect(value).toEqual(['old1']);
               async.done();
             }
           });

           a.removeAt(1);
         }));

      it('should fire an event when a control is added',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           a.removeAt(1);

           a.valueChanges.subscribe({
             next: (value: any) => {
               expect(value).toEqual(['old1', 'old2']);
               async.done();
             }
           });

           a.push(c2);
         }));
    });

    describe('get', () => {
      it('should return null when path is null', () => {
        var g = new FormGroup({});
        expect(g.get(null)).toEqual(null);
      });

      it('should return null when path is empty', () => {
        var g = new FormGroup({});
        expect(g.get([])).toEqual(null);
      });

      it('should return null when path is invalid', () => {
        var g = new FormGroup({});
        expect(g.get('invalid')).toEqual(null);
      });

      it('should return a child of a control group', () => {
        var g = new FormGroup({
          'one': new FormControl('111'),
          'nested': new FormGroup({'two': new FormControl('222')})
        });

        expect(g.get(['one']).value).toEqual('111');
        expect(g.get('one').value).toEqual('111');
        expect(g.get(['nested', 'two']).value).toEqual('222');
        expect(g.get('nested.two').value).toEqual('222');
      });

      it('should return an element of an array', () => {
        var g = new FormGroup({'array': new FormArray([new FormControl('111')])});

        expect(g.get(['array', 0]).value).toEqual('111');
      });
    });

    describe('asyncValidator', () => {
      it('should run the async validator', fakeAsync(() => {
           var c = new FormControl('value');
           var g = new FormArray([c], null, asyncValidator('expected'));

           expect(g.pending).toEqual(true);

           tick(1);

           expect(g.errors).toEqual({'async': true});
           expect(g.pending).toEqual(false);
         }));
    });
  });
}
