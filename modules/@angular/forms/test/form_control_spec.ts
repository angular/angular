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

  function otherAsyncValidator() { return Promise.resolve({'other': true}); }

  describe('FormControl', () => {
    it('should default the value to null', () => {
      var c = new FormControl();
      expect(c.value).toBe(null);
    });

    describe('validator', () => {
      it('should run validator with the initial value', () => {
        var c = new FormControl('value', Validators.required);
        expect(c.valid).toEqual(true);
      });

      it('should rerun the validator when the value changes', () => {
        var c = new FormControl('value', Validators.required);
        c.setValue(null);
        expect(c.valid).toEqual(false);
      });

      it('should support arrays of validator functions if passed', () => {
        const c = new FormControl('value', [Validators.required, Validators.minLength(3)]);
        c.setValue('a');
        expect(c.valid).toEqual(false);

        c.setValue('aaa');
        expect(c.valid).toEqual(true);
      });

      it('should return errors', () => {
        var c = new FormControl(null, Validators.required);
        expect(c.errors).toEqual({'required': true});
      });

      it('should set single validator', () => {
        var c = new FormControl(null);
        expect(c.valid).toEqual(true);

        c.setValidators(Validators.required);

        c.setValue(null);
        expect(c.valid).toEqual(false);

        c.setValue('abc');
        expect(c.valid).toEqual(true);
      });

      it('should set multiple validators from array', () => {
        var c = new FormControl('');
        expect(c.valid).toEqual(true);

        c.setValidators([Validators.minLength(5), Validators.required]);

        c.setValue('');
        expect(c.valid).toEqual(false);

        c.setValue('abc');
        expect(c.valid).toEqual(false);

        c.setValue('abcde');
        expect(c.valid).toEqual(true);
      });

      it('should clear validators', () => {
        var c = new FormControl('', Validators.required);
        expect(c.valid).toEqual(false);

        c.clearValidators();
        expect(c.validator).toEqual(null);

        c.setValue('');
        expect(c.valid).toEqual(true);
      });

      it('should add after clearing', () => {
        var c = new FormControl('', Validators.required);
        expect(c.valid).toEqual(false);

        c.clearValidators();
        expect(c.validator).toEqual(null);

        c.setValidators([Validators.required]);
        expect(c.validator).not.toBe(null);
      });
    });

    describe('asyncValidator', () => {
      it('should run validator with the initial value', fakeAsync(() => {
           var c = new FormControl('value', null, asyncValidator('expected'));
           tick();

           expect(c.valid).toEqual(false);
           expect(c.errors).toEqual({'async': true});
         }));

      it('should support validators returning observables', fakeAsync(() => {
           var c = new FormControl('value', null, asyncValidatorReturningObservable);
           tick();

           expect(c.valid).toEqual(false);
           expect(c.errors).toEqual({'async': true});
         }));

      it('should rerun the validator when the value changes', fakeAsync(() => {
           var c = new FormControl('value', null, asyncValidator('expected'));

           c.setValue('expected');
           tick();

           expect(c.valid).toEqual(true);
         }));

      it('should run the async validator only when the sync validator passes', fakeAsync(() => {
           var c = new FormControl('', Validators.required, asyncValidator('expected'));
           tick();

           expect(c.errors).toEqual({'required': true});

           c.setValue('some value');
           tick();

           expect(c.errors).toEqual({'async': true});
         }));

      it('should mark the control as pending while running the async validation', fakeAsync(() => {
           var c = new FormControl('', null, asyncValidator('expected'));

           expect(c.pending).toEqual(true);

           tick();

           expect(c.pending).toEqual(false);
         }));

      it('should only use the latest async validation run', fakeAsync(() => {
           var c = new FormControl(
               '', null, asyncValidator('expected', {'long': 200, 'expected': 100}));

           c.setValue('long');
           c.setValue('expected');

           tick(300);

           expect(c.valid).toEqual(true);
         }));

      it('should support arrays of async validator functions if passed', fakeAsync(() => {
           const c =
               new FormControl('value', null, [asyncValidator('expected'), otherAsyncValidator]);
           tick();

           expect(c.errors).toEqual({'async': true, 'other': true});
         }));

      it('should add single async validator', fakeAsync(() => {
           var c = new FormControl('value', null);

           c.setAsyncValidators(asyncValidator('expected'));
           expect(c.asyncValidator).not.toEqual(null);

           c.setValue('expected');
           tick();

           expect(c.valid).toEqual(true);
         }));

      it('should add async validator from array', fakeAsync(() => {
           var c = new FormControl('value', null);

           c.setAsyncValidators([asyncValidator('expected')]);
           expect(c.asyncValidator).not.toEqual(null);

           c.setValue('expected');
           tick();

           expect(c.valid).toEqual(true);
         }));

      it('should clear async validators', fakeAsync(() => {
           var c = new FormControl('value', [asyncValidator('expected'), otherAsyncValidator]);

           c.clearValidators();

           expect(c.asyncValidator).toEqual(null);
         }));
    });

    describe('dirty', () => {
      it('should be false after creating a control', () => {
        const c = new FormControl('value');
        expect(c.dirty).toEqual(false);
      });

      it('should be true after changing the value of the control', () => {
        const c = new FormControl('value');
        c.markAsDirty();
        expect(c.dirty).toEqual(true);
      });
    });

    describe('touched', () => {
      it('should be false after creating a control', () => {
        const c = new FormControl('value');
        expect(c.touched).toEqual(false);
      });

      it('should be true after markAsTouched runs', () => {
        const c = new FormControl('value');
        c.markAsTouched();
        expect(c.touched).toEqual(true);
      });
    });

    describe('setValue', () => {
      let g: FormGroup, c: FormControl;
      beforeEach(() => {
        c = new FormControl('oldValue');
        g = new FormGroup({'one': c});
      });

      it('should set the value of the control', () => {
        c.setValue('newValue');
        expect(c.value).toEqual('newValue');
      });

      it('should invoke ngOnChanges if it is present', () => {
        let ngOnChanges: any;
        c.registerOnChange((v: any) => ngOnChanges = ['invoked', v]);

        c.setValue('newValue');

        expect(ngOnChanges).toEqual(['invoked', 'newValue']);
      });

      it('should not invoke on change when explicitly specified', () => {
        let onChange: any = null;
        c.registerOnChange((v: any) => onChange = ['invoked', v]);

        c.setValue('newValue', {emitModelToViewChange: false});

        expect(onChange).toBeNull();
      });

      it('should set the parent', () => {
        c.setValue('newValue');
        expect(g.value).toEqual({'one': 'newValue'});
      });

      it('should not set the parent when explicitly specified', () => {
        c.setValue('newValue', {onlySelf: true});
        expect(g.value).toEqual({'one': 'oldValue'});
      });

      it('should fire an event', fakeAsync(() => {
           c.valueChanges.subscribe((value) => { expect(value).toEqual('newValue'); });

           c.setValue('newValue');
           tick();
         }));

      it('should not fire an event when explicitly specified', fakeAsync(() => {
           c.valueChanges.subscribe((value) => { throw 'Should not happen'; });

           c.setValue('newValue', {emitEvent: false});
           tick();
         }));
    });

    describe('patchValue', () => {
      let g: FormGroup, c: FormControl;
      beforeEach(() => {
        c = new FormControl('oldValue');
        g = new FormGroup({'one': c});
      });

      it('should set the value of the control', () => {
        c.patchValue('newValue');
        expect(c.value).toEqual('newValue');
      });

      it('should invoke ngOnChanges if it is present', () => {
        let ngOnChanges: any;
        c.registerOnChange((v: any) => ngOnChanges = ['invoked', v]);

        c.patchValue('newValue');

        expect(ngOnChanges).toEqual(['invoked', 'newValue']);
      });

      it('should not invoke on change when explicitly specified', () => {
        let onChange: any = null;
        c.registerOnChange((v: any) => onChange = ['invoked', v]);

        c.patchValue('newValue', {emitModelToViewChange: false});

        expect(onChange).toBeNull();
      });

      it('should set the parent', () => {
        c.patchValue('newValue');
        expect(g.value).toEqual({'one': 'newValue'});
      });

      it('should not set the parent when explicitly specified', () => {
        c.patchValue('newValue', {onlySelf: true});
        expect(g.value).toEqual({'one': 'oldValue'});
      });

      it('should fire an event', fakeAsync(() => {
           c.valueChanges.subscribe((value) => { expect(value).toEqual('newValue'); });

           c.patchValue('newValue');
           tick();
         }));

      it('should not fire an event when explicitly specified', fakeAsync(() => {
           c.valueChanges.subscribe((value) => { throw 'Should not happen'; });

           c.patchValue('newValue', {emitEvent: false});

           tick();
         }));
    });

    describe('reset()', () => {
      let c: FormControl;

      beforeEach(() => { c = new FormControl('initial value'); });

      it('should restore the initial value of the control if passed', () => {
        c.setValue('new value');
        expect(c.value).toBe('new value');

        c.reset('initial value');
        expect(c.value).toBe('initial value');
      });

      it('should clear the control value if no value is passed', () => {
        c.setValue('new value');
        expect(c.value).toBe('new value');

        c.reset();
        expect(c.value).toBe(null);
      });

      it('should update the value of any parent controls with passed value', () => {
        const g = new FormGroup({'one': c});
        c.setValue('new value');
        expect(g.value).toEqual({'one': 'new value'});

        c.reset('initial value');
        expect(g.value).toEqual({'one': 'initial value'});
      });

      it('should update the value of any parent controls with null value', () => {
        const g = new FormGroup({'one': c});
        c.setValue('new value');
        expect(g.value).toEqual({'one': 'new value'});

        c.reset();
        expect(g.value).toEqual({'one': null});
      });


      it('should mark the control as pristine', () => {
        c.markAsDirty();
        expect(c.pristine).toBe(false);

        c.reset();
        expect(c.pristine).toBe(true);
      });

      it('should set the parent pristine state if all pristine', () => {
        const g = new FormGroup({'one': c});
        c.markAsDirty();
        expect(g.pristine).toBe(false);

        c.reset();
        expect(g.pristine).toBe(true);
      });

      it('should not set the parent pristine state if it has other dirty controls', () => {
        const c2 = new FormControl('two');
        const g = new FormGroup({'one': c, 'two': c2});
        c.markAsDirty();
        c2.markAsDirty();

        c.reset();
        expect(g.pristine).toBe(false);
      });

      it('should mark the control as untouched', () => {
        c.markAsTouched();
        expect(c.untouched).toBe(false);

        c.reset();
        expect(c.untouched).toBe(true);
      });

      it('should set the parent untouched state if all untouched', () => {
        const g = new FormGroup({'one': c});
        c.markAsTouched();
        expect(g.untouched).toBe(false);

        c.reset();
        expect(g.untouched).toBe(true);
      });

      it('should not set the parent untouched state if other touched controls', () => {
        const c2 = new FormControl('two');
        const g = new FormGroup({'one': c, 'two': c2});
        c.markAsTouched();
        c2.markAsTouched();

        c.reset();
        expect(g.untouched).toBe(false);
      });

      describe('reset() events', () => {
        let g: FormGroup, c2: FormControl, logger: any[];

        beforeEach(() => {
          c2 = new FormControl('two');
          g = new FormGroup({'one': c, 'two': c2});
          logger = [];
        });

        it('should emit one valueChange event per reset control', () => {
          g.valueChanges.subscribe(() => logger.push('group'));
          c.valueChanges.subscribe(() => logger.push('control1'));
          c2.valueChanges.subscribe(() => logger.push('control2'));

          c.reset();
          expect(logger).toEqual(['control1', 'group']);
        });

        it('should emit one statusChange event per reset control', () => {
          g.statusChanges.subscribe(() => logger.push('group'));
          c.statusChanges.subscribe(() => logger.push('control1'));
          c2.statusChanges.subscribe(() => logger.push('control2'));

          c.reset();
          expect(logger).toEqual(['control1', 'group']);
        });
      });

    });

    describe('valueChanges & statusChanges', () => {
      var c: any /** TODO #9100 */;

      beforeEach(() => { c = new FormControl('old', Validators.required); });

      it('should fire an event after the value has been updated',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           c.valueChanges.subscribe({
             next: (value: any) => {
               expect(c.value).toEqual('new');
               expect(value).toEqual('new');
               async.done();
             }
           });
           c.setValue('new');
         }));

      it('should fire an event after the status has been updated to invalid', fakeAsync(() => {
           c.statusChanges.subscribe({
             next: (status: any) => {
               expect(c.status).toEqual('INVALID');
               expect(status).toEqual('INVALID');
             }
           });

           c.setValue('');
           tick();
         }));

      it('should fire an event after the status has been updated to pending', fakeAsync(() => {
           var c = new FormControl('old', Validators.required, asyncValidator('expected'));

           var log: any[] /** TODO #9100 */ = [];
           c.valueChanges.subscribe({next: (value: any) => log.push(`value: '${value}'`)});

           c.statusChanges.subscribe({next: (status: any) => log.push(`status: '${status}'`)});

           c.setValue('');
           tick();

           c.setValue('nonEmpty');
           tick();

           c.setValue('expected');
           tick();

           expect(log).toEqual([
             '' +
                 'value: \'\'',
             'status: \'INVALID\'',
             'value: \'nonEmpty\'',
             'status: \'PENDING\'',
             'status: \'INVALID\'',
             'value: \'expected\'',
             'status: \'PENDING\'',
             'status: \'VALID\'',
           ]);
         }));

      // TODO: remove the if statement after making observable delivery sync
      it('should update set errors and status before emitting an event',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           c.valueChanges.subscribe((value: any /** TODO #9100 */) => {
             expect(c.valid).toEqual(false);
             expect(c.errors).toEqual({'required': true});
             async.done();
           });
           c.setValue('');
         }));

      it('should return a cold observable',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           c.setValue('will be ignored');
           c.valueChanges.subscribe({
             next: (value: any) => {
               expect(value).toEqual('new');
               async.done();
             }
           });
           c.setValue('new');
         }));
    });

    describe('setErrors', () => {
      it('should set errors on a control', () => {
        var c = new FormControl('someValue');

        c.setErrors({'someError': true});

        expect(c.valid).toEqual(false);
        expect(c.errors).toEqual({'someError': true});
      });

      it('should reset the errors and validity when the value changes', () => {
        var c = new FormControl('someValue', Validators.required);

        c.setErrors({'someError': true});
        c.setValue('');

        expect(c.errors).toEqual({'required': true});
      });

      it('should update the parent group\'s validity', () => {
        var c = new FormControl('someValue');
        var g = new FormGroup({'one': c});

        expect(g.valid).toEqual(true);

        c.setErrors({'someError': true});

        expect(g.valid).toEqual(false);
      });

      it('should not reset parent\'s errors', () => {
        var c = new FormControl('someValue');
        var g = new FormGroup({'one': c});

        g.setErrors({'someGroupError': true});
        c.setErrors({'someError': true});

        expect(g.errors).toEqual({'someGroupError': true});
      });

      it('should reset errors when updating a value', () => {
        var c = new FormControl('oldValue');
        var g = new FormGroup({'one': c});

        g.setErrors({'someGroupError': true});
        c.setErrors({'someError': true});

        c.setValue('newValue');

        expect(c.errors).toEqual(null);
        expect(g.errors).toEqual(null);
      });
    });
  });
}
