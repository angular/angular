/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {fakeAsync, tick} from '@angular/core/testing';
import {AsyncTestCompleter, beforeEach, ddescribe, describe, iit, inject, it, xit} from '@angular/core/testing/testing_internal';
import {FormControl, FormGroup, Validators} from '@angular/forms';

import {EventEmitter} from '../src/facade/async';
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

  function asyncValidatorReturningObservable(c: FormControl) {
    var e = new EventEmitter();
    Promise.resolve(null).then(() => { e.emit({'async': true}); });
    return e;
  }

  describe('FormGroup', () => {
    describe('value', () => {
      it('should be the reduced value of the child controls', () => {
        var g = new FormGroup({'one': new FormControl('111'), 'two': new FormControl('222')});
        expect(g.value).toEqual({'one': '111', 'two': '222'});
      });

      it('should be empty when there are no child controls', () => {
        var g = new FormGroup({});
        expect(g.value).toEqual({});
      });

      it('should support nested groups', () => {
        var g = new FormGroup({
          'one': new FormControl('111'),
          'nested': new FormGroup({'two': new FormControl('222')})
        });
        expect(g.value).toEqual({'one': '111', 'nested': {'two': '222'}});

        (<FormControl>(g.get('nested.two'))).setValue('333');

        expect(g.value).toEqual({'one': '111', 'nested': {'two': '333'}});
      });
    });

    describe('adding and removing controls', () => {
      it('should update value and validity when control is added', () => {
        var g = new FormGroup({'one': new FormControl('1')});
        expect(g.value).toEqual({'one': '1'});
        expect(g.valid).toBe(true);

        g.addControl('two', new FormControl('2', Validators.minLength(10)));

        expect(g.value).toEqual({'one': '1', 'two': '2'});
        expect(g.valid).toBe(false);
      });

      it('should update value and validity when control is removed', () => {
        var g = new FormGroup(
            {'one': new FormControl('1'), 'two': new FormControl('2', Validators.minLength(10))});
        expect(g.value).toEqual({'one': '1', 'two': '2'});
        expect(g.valid).toBe(false);

        g.removeControl('two');

        expect(g.value).toEqual({'one': '1'});
        expect(g.valid).toBe(true);
      });
    });

    describe('errors', () => {
      it('should run the validator when the value changes', () => {
        var simpleValidator = (c: any /** TODO #9100 */) =>
            c.controls['one'].value != 'correct' ? {'broken': true} : null;

        var c = new FormControl(null);
        var g = new FormGroup({'one': c}, null, simpleValidator);

        c.setValue('correct');

        expect(g.valid).toEqual(true);
        expect(g.errors).toEqual(null);

        c.setValue('incorrect');

        expect(g.valid).toEqual(false);
        expect(g.errors).toEqual({'broken': true});
      });
    });

    describe('dirty', () => {
      var c: FormControl, g: FormGroup;

      beforeEach(() => {
        c = new FormControl('value');
        g = new FormGroup({'one': c});
      });

      it('should be false after creating a control', () => { expect(g.dirty).toEqual(false); });

      it('should be true after changing the value of the control', () => {
        c.markAsDirty();

        expect(g.dirty).toEqual(true);
      });
    });


    describe('touched', () => {
      var c: FormControl, g: FormGroup;

      beforeEach(() => {
        c = new FormControl('value');
        g = new FormGroup({'one': c});
      });

      it('should be false after creating a control', () => { expect(g.touched).toEqual(false); });

      it('should be true after control is marked as touched', () => {
        c.markAsTouched();

        expect(g.touched).toEqual(true);
      });
    });

    describe('setValue', () => {
      let c: FormControl, c2: FormControl, g: FormGroup;

      beforeEach(() => {
        c = new FormControl('');
        c2 = new FormControl('');
        g = new FormGroup({'one': c, 'two': c2});
      });

      it('should set its own value', () => {
        g.setValue({'one': 'one', 'two': 'two'});
        expect(g.value).toEqual({'one': 'one', 'two': 'two'});
      });

      it('should set child values', () => {
        g.setValue({'one': 'one', 'two': 'two'});
        expect(c.value).toEqual('one');
        expect(c2.value).toEqual('two');
      });

      it('should set parent values', () => {
        const form = new FormGroup({'parent': g});
        g.setValue({'one': 'one', 'two': 'two'});
        expect(form.value).toEqual({'parent': {'one': 'one', 'two': 'two'}});
      });

      it('should throw if fields are missing from supplied value (subset)', () => {
        expect(() => g.setValue({
          'one': 'one'
        })).toThrowError(new RegExp(`Must supply a value for form control with name: 'two'`));
      });

      it('should throw if a value is provided for a missing control (superset)', () => {
        expect(() => g.setValue({'one': 'one', 'two': 'two', 'three': 'three'}))
            .toThrowError(new RegExp(`Cannot find form control with name: three`));
      });

      it('should throw if no controls are set yet', () => {
        const empty = new FormGroup({});
        expect(() => empty.setValue({
          'one': 'one'
        })).toThrowError(new RegExp(`no form controls registered with this group`));
      });

      describe('setValue() events', () => {
        let form: FormGroup;
        let logger: any[];

        beforeEach(() => {
          form = new FormGroup({'parent': g});
          logger = [];
        });

        it('should emit one valueChange event per control', () => {
          form.valueChanges.subscribe(() => logger.push('form'));
          g.valueChanges.subscribe(() => logger.push('group'));
          c.valueChanges.subscribe(() => logger.push('control1'));
          c2.valueChanges.subscribe(() => logger.push('control2'));

          g.setValue({'one': 'one', 'two': 'two'});
          expect(logger).toEqual(['control1', 'control2', 'group', 'form']);
        });

        it('should emit one statusChange event per control', () => {
          form.statusChanges.subscribe(() => logger.push('form'));
          g.statusChanges.subscribe(() => logger.push('group'));
          c.statusChanges.subscribe(() => logger.push('control1'));
          c2.statusChanges.subscribe(() => logger.push('control2'));

          g.setValue({'one': 'one', 'two': 'two'});
          expect(logger).toEqual(['control1', 'control2', 'group', 'form']);
        });
      });
    });

    describe('patchValue', () => {
      let c: FormControl, c2: FormControl, g: FormGroup;

      beforeEach(() => {
        c = new FormControl('');
        c2 = new FormControl('');
        g = new FormGroup({'one': c, 'two': c2});
      });

      it('should set its own value', () => {
        g.patchValue({'one': 'one', 'two': 'two'});
        expect(g.value).toEqual({'one': 'one', 'two': 'two'});
      });

      it('should set child values', () => {
        g.patchValue({'one': 'one', 'two': 'two'});
        expect(c.value).toEqual('one');
        expect(c2.value).toEqual('two');
      });

      it('should set parent values', () => {
        const form = new FormGroup({'parent': g});
        g.patchValue({'one': 'one', 'two': 'two'});
        expect(form.value).toEqual({'parent': {'one': 'one', 'two': 'two'}});
      });

      it('should ignore fields that are missing from supplied value (subset)', () => {
        g.patchValue({'one': 'one'});
        expect(g.value).toEqual({'one': 'one', 'two': ''});
      });

      it('should not ignore fields that are null', () => {
        g.patchValue({'one': null});
        expect(g.value).toEqual({'one': null, 'two': ''});
      });

      it('should ignore any value provided for a missing control (superset)', () => {
        g.patchValue({'three': 'three'});
        expect(g.value).toEqual({'one': '', 'two': ''});
      });

      describe('patchValue() events', () => {
        let form: FormGroup;
        let logger: any[];

        beforeEach(() => {
          form = new FormGroup({'parent': g});
          logger = [];
        });

        it('should emit one valueChange event per control', () => {
          form.valueChanges.subscribe(() => logger.push('form'));
          g.valueChanges.subscribe(() => logger.push('group'));
          c.valueChanges.subscribe(() => logger.push('control1'));
          c2.valueChanges.subscribe(() => logger.push('control2'));

          g.patchValue({'one': 'one', 'two': 'two'});
          expect(logger).toEqual(['control1', 'control2', 'group', 'form']);
        });

        it('should not emit valueChange events for skipped controls', () => {
          form.valueChanges.subscribe(() => logger.push('form'));
          g.valueChanges.subscribe(() => logger.push('group'));
          c.valueChanges.subscribe(() => logger.push('control1'));
          c2.valueChanges.subscribe(() => logger.push('control2'));

          g.patchValue({'one': 'one'});
          expect(logger).toEqual(['control1', 'group', 'form']);
        });

        it('should emit one statusChange event per control', () => {
          form.statusChanges.subscribe(() => logger.push('form'));
          g.statusChanges.subscribe(() => logger.push('group'));
          c.statusChanges.subscribe(() => logger.push('control1'));
          c2.statusChanges.subscribe(() => logger.push('control2'));

          g.patchValue({'one': 'one', 'two': 'two'});
          expect(logger).toEqual(['control1', 'control2', 'group', 'form']);
        });
      });
    });

    describe('reset()', () => {
      let c: FormControl, c2: FormControl, g: FormGroup;

      beforeEach(() => {
        c = new FormControl('initial value');
        c2 = new FormControl('');
        g = new FormGroup({'one': c, 'two': c2});
      });

      it('should set its own value if value passed', () => {
        g.setValue({'one': 'new value', 'two': 'new value'});

        g.reset({'one': 'initial value', 'two': ''});
        expect(g.value).toEqual({'one': 'initial value', 'two': ''});
      });

      it('should clear its own value if no value passed', () => {
        g.setValue({'one': 'new value', 'two': 'new value'});

        g.reset();
        expect(g.value).toEqual({'one': null, 'two': null});
      });

      it('should set the value of each of its child controls if value passed', () => {
        g.setValue({'one': 'new value', 'two': 'new value'});

        g.reset({'one': 'initial value', 'two': ''});
        expect(c.value).toBe('initial value');
        expect(c2.value).toBe('');
      });

      it('should clear the value of each of its child controls if no value passed', () => {
        g.setValue({'one': 'new value', 'two': 'new value'});

        g.reset();
        expect(c.value).toBe(null);
        expect(c2.value).toBe(null);
      });

      it('should set the value of its parent if value passed', () => {
        const form = new FormGroup({'g': g});
        g.setValue({'one': 'new value', 'two': 'new value'});

        g.reset({'one': 'initial value', 'two': ''});
        expect(form.value).toEqual({'g': {'one': 'initial value', 'two': ''}});
      });

      it('should clear the value of its parent if no value passed', () => {
        const form = new FormGroup({'g': g});
        g.setValue({'one': 'new value', 'two': 'new value'});

        g.reset();
        expect(form.value).toEqual({'g': {'one': null, 'two': null}});
      });

      it('should mark itself as pristine', () => {
        g.markAsDirty();
        expect(g.pristine).toBe(false);

        g.reset();
        expect(g.pristine).toBe(true);
      });

      it('should mark all child controls as pristine', () => {
        c.markAsDirty();
        c2.markAsDirty();
        expect(c.pristine).toBe(false);
        expect(c2.pristine).toBe(false);

        g.reset();
        expect(c.pristine).toBe(true);
        expect(c2.pristine).toBe(true);
      });

      it('should mark the parent as pristine if all siblings pristine', () => {
        const c3 = new FormControl('');
        const form = new FormGroup({'g': g, 'c3': c3});

        g.markAsDirty();
        expect(form.pristine).toBe(false);

        g.reset();
        expect(form.pristine).toBe(true);
      });

      it('should not mark the parent pristine if any dirty siblings', () => {
        const c3 = new FormControl('');
        const form = new FormGroup({'g': g, 'c3': c3});

        g.markAsDirty();
        c3.markAsDirty();
        expect(form.pristine).toBe(false);

        g.reset();
        expect(form.pristine).toBe(false);
      });

      it('should mark itself as untouched', () => {
        g.markAsTouched();
        expect(g.untouched).toBe(false);

        g.reset();
        expect(g.untouched).toBe(true);
      });

      it('should mark all child controls as untouched', () => {
        c.markAsTouched();
        c2.markAsTouched();
        expect(c.untouched).toBe(false);
        expect(c2.untouched).toBe(false);

        g.reset();
        expect(c.untouched).toBe(true);
        expect(c2.untouched).toBe(true);
      });

      it('should mark the parent untouched if all siblings untouched', () => {
        const c3 = new FormControl('');
        const form = new FormGroup({'g': g, 'c3': c3});

        g.markAsTouched();
        expect(form.untouched).toBe(false);

        g.reset();
        expect(form.untouched).toBe(true);
      });

      it('should not mark the parent untouched if any touched siblings', () => {
        const c3 = new FormControl('');
        const form = new FormGroup({'g': g, 'c3': c3});

        g.markAsTouched();
        c3.markAsTouched();
        expect(form.untouched).toBe(false);

        g.reset();
        expect(form.untouched).toBe(false);
      });

      describe('reset() events', () => {
        let form: FormGroup, c3: FormControl, logger: any[];

        beforeEach(() => {
          c3 = new FormControl('');
          form = new FormGroup({'g': g, 'c3': c3});
          logger = [];
        });

        it('should emit one valueChange event per reset control', () => {
          form.valueChanges.subscribe(() => logger.push('form'));
          g.valueChanges.subscribe(() => logger.push('group'));
          c.valueChanges.subscribe(() => logger.push('control1'));
          c2.valueChanges.subscribe(() => logger.push('control2'));
          c3.valueChanges.subscribe(() => logger.push('control3'));

          g.reset();
          expect(logger).toEqual(['control1', 'control2', 'group', 'form']);
        });

        it('should emit one statusChange event per reset control', () => {
          form.statusChanges.subscribe(() => logger.push('form'));
          g.statusChanges.subscribe(() => logger.push('group'));
          c.statusChanges.subscribe(() => logger.push('control1'));
          c2.statusChanges.subscribe(() => logger.push('control2'));
          c3.statusChanges.subscribe(() => logger.push('control3'));

          g.reset();
          expect(logger).toEqual(['control1', 'control2', 'group', 'form']);
        });
      });

    });

    describe('optional components', () => {
      describe('contains', () => {
        var group: any /** TODO #9100 */;

        beforeEach(() => {
          group = new FormGroup(
              {
                'required': new FormControl('requiredValue'),
                'optional': new FormControl('optionalValue')
              },
              {'optional': false});
        });

        // rename contains into has
        it('should return false when the component is not included',
           () => { expect(group.contains('optional')).toEqual(false); });

        it('should return false when there is no component with the given name',
           () => { expect(group.contains('something else')).toEqual(false); });

        it('should return true when the component is included', () => {
          expect(group.contains('required')).toEqual(true);

          group.include('optional');

          expect(group.contains('optional')).toEqual(true);
        });
      });

      it('should not include an inactive component into the group value', () => {
        var group = new FormGroup(
            {
              'required': new FormControl('requiredValue'),
              'optional': new FormControl('optionalValue')
            },
            {'optional': false});

        expect(group.value).toEqual({'required': 'requiredValue'});

        group.include('optional');

        expect(group.value).toEqual({'required': 'requiredValue', 'optional': 'optionalValue'});
      });

      it('should not run Validators on an inactive component', () => {
        var group = new FormGroup(
            {
              'required': new FormControl('requiredValue', Validators.required),
              'optional': new FormControl('', Validators.required)
            },
            {'optional': false});

        expect(group.valid).toEqual(true);

        group.include('optional');

        expect(group.valid).toEqual(false);
      });
    });

    describe('valueChanges', () => {
      var g: FormGroup, c1: FormControl, c2: FormControl;

      beforeEach(() => {
        c1 = new FormControl('old1');
        c2 = new FormControl('old2');
        g = new FormGroup({'one': c1, 'two': c2}, {'two': true});
      });

      it('should fire an event after the value has been updated',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           g.valueChanges.subscribe({
             next: (value: any) => {
               expect(g.value).toEqual({'one': 'new1', 'two': 'old2'});
               expect(value).toEqual({'one': 'new1', 'two': 'old2'});
               async.done();
             }
           });
           c1.setValue('new1');
         }));

      it('should fire an event after the control\'s observable fired an event',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           var controlCallbackIsCalled = false;


           c1.valueChanges.subscribe({next: (value: any) => { controlCallbackIsCalled = true; }});

           g.valueChanges.subscribe({
             next: (value: any) => {
               expect(controlCallbackIsCalled).toBe(true);
               async.done();
             }
           });

           c1.setValue('new1');
         }));

      it('should fire an event when a control is excluded',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           g.valueChanges.subscribe({
             next: (value: any) => {
               expect(value).toEqual({'one': 'old1'});
               async.done();
             }
           });

           g.exclude('two');
         }));

      it('should fire an event when a control is included',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           g.exclude('two');

           g.valueChanges.subscribe({
             next: (value: any) => {
               expect(value).toEqual({'one': 'old1', 'two': 'old2'});
               async.done();
             }
           });

           g.include('two');
         }));

      it('should fire an event every time a control is updated',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           var loggedValues: any[] /** TODO #9100 */ = [];

           g.valueChanges.subscribe({
             next: (value: any) => {
               loggedValues.push(value);

               if (loggedValues.length == 2) {
                 expect(loggedValues).toEqual([
                   {'one': 'new1', 'two': 'old2'}, {'one': 'new1', 'two': 'new2'}
                 ]);
                 async.done();
               }
             }
           });

           c1.setValue('new1');
           c2.setValue('new2');
         }));

      // hard to test without hacking zones
      // xit('should not fire an event when an excluded control is updated', () => null);
    });

    describe('statusChanges', () => {
      const control = new FormControl('', asyncValidatorReturningObservable);
      const group = new FormGroup({'one': control});

      // TODO(kara): update these tests to use fake Async
      it('should fire a statusChange if child has async validation change',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           const loggedValues: string[] = [];
           group.statusChanges.subscribe({
             next: (status: string) => {
               loggedValues.push(status);
               if (loggedValues.length === 2) {
                 expect(loggedValues).toEqual(['PENDING', 'INVALID']);
               }
               async.done();
             }
           });
           control.setValue('');
         }));
    });

    describe('getError', () => {
      it('should return the error when it is present', () => {
        var c = new FormControl('', Validators.required);
        var g = new FormGroup({'one': c});
        expect(c.getError('required')).toEqual(true);
        expect(g.getError('required', ['one'])).toEqual(true);
      });

      it('should return null otherwise', () => {
        var c = new FormControl('not empty', Validators.required);
        var g = new FormGroup({'one': c});
        expect(c.getError('invalid')).toEqual(null);
        expect(g.getError('required', ['one'])).toEqual(null);
        expect(g.getError('required', ['invalid'])).toEqual(null);
      });
    });

    describe('asyncValidator', () => {
      it('should run the async validator', fakeAsync(() => {
           var c = new FormControl('value');
           var g = new FormGroup({'one': c}, null, null, asyncValidator('expected'));

           expect(g.pending).toEqual(true);

           tick(1);

           expect(g.errors).toEqual({'async': true});
           expect(g.pending).toEqual(false);
         }));

      it('should set the parent group\'s status to pending', fakeAsync(() => {
           var c = new FormControl('value', null, asyncValidator('expected'));
           var g = new FormGroup({'one': c});

           expect(g.pending).toEqual(true);

           tick(1);

           expect(g.pending).toEqual(false);
         }));

      it('should run the parent group\'s async validator when children are pending',
         fakeAsync(() => {
           var c = new FormControl('value', null, asyncValidator('expected'));
           var g = new FormGroup({'one': c}, null, null, asyncValidator('expected'));

           tick(1);

           expect(g.errors).toEqual({'async': true});
           expect(g.get('one').errors).toEqual({'async': true});
         }));
    });
  });
}
