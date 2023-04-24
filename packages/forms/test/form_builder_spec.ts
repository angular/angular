/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Component} from '@angular/core';
import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {FormBuilder, NonNullableFormBuilder, ReactiveFormsModule, UntypedFormBuilder, Validators} from '@angular/forms';
import {of} from 'rxjs';

(function() {
function syncValidator() {
  return null;
}
function asyncValidator() {
  return Promise.resolve(null);
}

describe('Form Builder', () => {
  let b: FormBuilder;

  beforeEach(() => {
    b = new FormBuilder();
  });

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

  it('should create controls from FormStates', () => {
    const c = b.control({value: 'one', disabled: false});
    expect(c.value).toEqual('one');
    c.reset();
    expect(c.value).toEqual(null);
  });

  it('should work on a directly constructed FormBuilder object', () => {
    const g = b.group({'login': 'some value'});
    expect(g.controls['login'].value).toEqual('some value');
  });

  describe('should create control records', () => {
    it('from simple values', () => {
      const a = b.record({a: 'one', b: 'two'});
      expect(a.value).toEqual({a: 'one', b: 'two'});
    });

    it('from boxed values', () => {
      const a = b.record({a: 'one', b: {value: 'two', disabled: true}});
      expect(a.value).toEqual({a: 'one'});
      a.get('b')?.enable();
      expect(a.value).toEqual({a: 'one', b: 'two'});
    });

    it('from an array', () => {
      const a = b.record({a: ['one']});
      expect(a.value).toEqual({a: 'one'});
    });

    it('from controls whose form state is a primitive value', () => {
      const record = b.record({'login': b.control('some value', syncValidator, asyncValidator)});

      expect(record.controls['login'].value).toEqual('some value');
      expect(record.controls['login'].validator).toBe(syncValidator);
      expect(record.controls['login'].asyncValidator).toBe(asyncValidator);
    });
  });
  it('should create homogenous control arrays', () => {
    const a = b.array(['one', 'two', 'three']);
    expect(a.value).toEqual(['one', 'two', 'three']);
  });

  it('should create control arrays with FormStates and ControlConfigs', () => {
    const a = b.array(['one', 'two', {value: 'three', disabled: false}]);
    expect(a.value).toEqual(['one', 'two', 'three']);
  });

  it('should create control arrays with ControlConfigs', () => {
    const a = b.array([['one', syncValidator, asyncValidator]]);
    expect(a.value).toEqual(['one']);
    expect(a.controls[0].validator).toBe(syncValidator);
    expect(a.controls[0].asyncValidator).toBe(asyncValidator);
  });

  it('should create nested control arrays with ControlConfigs', () => {
    const a = b.array(['one', ['two', syncValidator, asyncValidator]]);
    expect(a.value).toEqual(['one', 'two']);
    expect(a.controls[1].validator).toBe(syncValidator);
    expect(a.controls[1].asyncValidator).toBe(asyncValidator);
  });

  it('should create control arrays with AbstractControls', () => {
    const ctrl = b.control('one');
    const a = b.array([ctrl], syncValidator, asyncValidator);
    expect(a.value).toEqual(['one']);
    expect(a.validator).toBe(syncValidator);
    expect(a.asyncValidator).toBe(asyncValidator);
  });

  it('should create control arrays with mixed value representations', () => {
    const a = b.array([
      'one', ['two', syncValidator, asyncValidator], {value: 'three', disabled: false},
      [{value: 'four', disabled: false}, syncValidator, asyncValidator], ['five'], b.control('six'),
      b.control({value: 'seven', disabled: false})
    ]);
    expect(a.value).toEqual(['one', 'two', 'three', 'four', 'five', 'six', 'seven']);
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

  it('should support controls with validators that are later modified', () => {
    const g = b.group({'login': b.control(null, syncValidator, asyncValidator)});
    expect(g.controls['login'].value).toBeNull();
    expect(g.controls['login'].validator).toBe(syncValidator);
    expect(g.controls['login'].asyncValidator).toBe(asyncValidator);
    g.controls['login'].addValidators(Validators.required);
    expect(g.controls['login'].hasValidator(Validators.required)).toBe(true);
    g.controls['login'].removeValidators(Validators.required);
    expect(g.controls['login'].hasValidator(Validators.required)).toBe(false);
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

  it('should create groups with null options', () => {
    const g = b.group({'login': 'some value'}, null);

    expect(g.validator).toBe(null);
    expect(g.asyncValidator).toBe(null);
  });

  it('should create groups with shorthand parameters and with right typings', () => {
    const form = b.group({
      shorthand: [3, Validators.required],
      shorthand2: [5, {validators: Validators.required}],
    });

    expect((form.get('shorthand')?.value)).toEqual(3);
    expect(((form.get('shorthand2')!.value ?? 0) + 0)).toEqual(5);


    const form2 = b.group({
      shorthand2: [5, {updateOn: 'blur'}],
    });
    expect(((form2.get('shorthand2')!.value ?? 0) + 0)).toEqual(5);
  });

  it('should create control arrays', () => {
    const c = b.control('three');
    const e = b.control(null);
    const f = b.control(undefined);
    const a = b.array(
        ['one' as any, ['two', syncValidator], c, b.array(['four']), e, f], syncValidator,
        asyncValidator);

    expect(a.value).toEqual(['one', 'two', 'three', ['four'], null, null]);
    expect(a.validator).toBe(syncValidator);
    expect(a.asyncValidator).toBe(asyncValidator);
  });

  it('should create control arrays with multiple async validators', fakeAsync(() => {
       function asyncValidator1() {
         return of({'async1': true});
       }
       function asyncValidator2() {
         return of({'async2': true});
       }

       const a = b.array(['one', 'two'], null, [asyncValidator1, asyncValidator2]);
       expect(a.value).toEqual(['one', 'two']);

       tick();

       expect(a.errors).toEqual({'async1': true, 'async2': true});
     }));

  it('should create control arrays with multiple sync validators', () => {
    function syncValidator1() {
      return {'sync1': true};
    }
    function syncValidator2() {
      return {'sync2': true};
    }

    const a = b.array(['one', 'two'], [syncValidator1, syncValidator2]);
    expect(a.value).toEqual(['one', 'two']);
    expect(a.errors).toEqual({'sync1': true, 'sync2': true});
  });

  it('should be injectable', () => {
    @Component({
      standalone: true,
      template: '...',
    })
    class MyComp {
      constructor(public fb: FormBuilder) {}
    }

    TestBed.configureTestingModule({imports: [ReactiveFormsModule]});
    const fixture = TestBed.createComponent(MyComp);

    fixture.detectChanges();
    expect(fixture.componentInstance.fb).toBeInstanceOf(FormBuilder);

    const fc = fixture.componentInstance.fb.control('foo');
    {
      // Check the type of the value by assigning in each direction
      type ValueType = string|null;
      let t: ValueType = fc.value;
      let t1 = fc.value;
      t1 = null as unknown as ValueType;
    }
    fc.reset();
    expect(fc.value).toEqual(null);
  });

  it('should be injectable as NonNullableFormBuilder', () => {
    @Component({
      standalone: true,
      template: '...',
    })
    class MyComp {
      constructor(public fb: NonNullableFormBuilder) {}
    }

    TestBed.configureTestingModule({imports: [ReactiveFormsModule]});

    const fixture = TestBed.createComponent(MyComp);
    fixture.detectChanges();
    expect(fixture.componentInstance.fb).toBeInstanceOf(FormBuilder);

    const fc = fixture.componentInstance.fb.control('foo');
    {
      // Check the type of the value by assigning in each direction
      type ValueType = string;
      let t: ValueType = fc.value;
      let t1 = fc.value;
      t1 = null as unknown as ValueType;
    }
    fc.reset();
    expect(fc.value).toEqual('foo');
  });

  describe('updateOn', () => {
    it('should default to on change', () => {
      const c = b.control('');
      expect(c.updateOn).toEqual('change');
    });

    it('should default to on change with an options obj', () => {
      const c = b.control('', {validators: Validators.required});
      expect(c.updateOn).toEqual('change');
    });

    it('should set updateOn when updating on blur', () => {
      const c = b.control('', {updateOn: 'blur'});
      expect(c.updateOn).toEqual('blur');
    });

    describe('in groups and arrays', () => {
      it('should default to group updateOn when not set in control', () => {
        const g = b.group({one: b.control(''), two: b.control('')}, {updateOn: 'blur'});

        expect(g.get('one')!.updateOn).toEqual('blur');
        expect(g.get('two')!.updateOn).toEqual('blur');
      });

      it('should default to array updateOn when not set in control', () => {
        const a = b.array([b.control(''), b.control('')], {updateOn: 'blur'});

        expect(a.get([0])!.updateOn).toEqual('blur');
        expect(a.get([1])!.updateOn).toEqual('blur');
      });

      it('should set updateOn with nested groups', () => {
        const g = b.group(
            {
              group: b.group({one: b.control(''), two: b.control('')}),
            },
            {updateOn: 'blur'});

        expect(g.get('group.one')!.updateOn).toEqual('blur');
        expect(g.get('group.two')!.updateOn).toEqual('blur');
        expect(g.get('group')!.updateOn).toEqual('blur');
      });

      it('should set updateOn with nested arrays', () => {
        const g = b.group(
            {
              arr: b.array([b.control(''), b.control('')]),
            },
            {updateOn: 'blur'});

        expect(g.get(['arr', 0])!.updateOn).toEqual('blur');
        expect(g.get(['arr', 1])!.updateOn).toEqual('blur');
        expect(g.get('arr')!.updateOn).toEqual('blur');
      });

      it('should allow control updateOn to override group updateOn', () => {
        const g = b.group(
            {one: b.control('', {updateOn: 'change'}), two: b.control('')}, {updateOn: 'blur'});

        expect(g.get('one')!.updateOn).toEqual('change');
        expect(g.get('two')!.updateOn).toEqual('blur');
      });

      it('should set updateOn with complex setup', () => {
        const g = b.group({
          group: b.group(
              {one: b.control('', {updateOn: 'change'}), two: b.control('')}, {updateOn: 'blur'}),
          groupTwo: b.group({one: b.control('')}, {updateOn: 'submit'}),
          three: b.control('')
        });

        expect(g.get('group.one')!.updateOn).toEqual('change');
        expect(g.get('group.two')!.updateOn).toEqual('blur');
        expect(g.get('groupTwo.one')!.updateOn).toEqual('submit');
        expect(g.get('three')!.updateOn).toEqual('change');
      });
    });
  });
});

describe('UntypedFormBuilder', () => {
  let fb: FormBuilder = new FormBuilder();
  let ufb: UntypedFormBuilder = new UntypedFormBuilder();

  function typedFn(fb: FormBuilder): void {}
  function untypedFn(fb: UntypedFormBuilder): void {}

  it('can be provided where a FormBuilder is expected and vice versa', () => {
    typedFn(ufb);
    untypedFn(fb);
  });
});
})();
