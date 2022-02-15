/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// These tests mainly check the types of strongly typed form controls, which is generally enforced
// at compile time.

import {FormBuilder, UntypedFormBuilder} from '../src/form_builder';
import {FormArray, FormControl, FormGroup, FormRecord, UntypedFormArray, UntypedFormControl, UntypedFormGroup} from '../src/forms';

describe('Typed Class', () => {
  describe('FormControl', () => {
    it('supports inferred controls', () => {
      const c = new FormControl('', {initialValueIsDefault: true});
      {
        type ValueType = string;
        let t: ValueType = c.value;
        let t1 = c.value;
        t1 = null as unknown as ValueType;
      }
      {
        type RawValueType = string;
        let t: RawValueType = c.getRawValue();
        let t1 = c.getRawValue();
        t1 = null as unknown as RawValueType;
      }
      c.setValue('');
      // @ts-expect-error
      c.setValue(null);
      c.patchValue('');
      c.reset('');
    });

    it('supports explicit controls', () => {
      const c = new FormControl<string>('', {initialValueIsDefault: true});
      {
        type ValueType = string;
        let t: ValueType = c.value;
        let t1 = c.value;
        t1 = null as unknown as ValueType;
      }
      {
        type RawValueType = string;
        let t: RawValueType = c.getRawValue();
        let t1 = c.getRawValue();
        t1 = null as unknown as RawValueType;
      }
      c.setValue('');
      c.patchValue('');
      c.reset('');
    });

    it('supports nullable controls', () => {
      const c = new FormControl<string|null>('');
      {
        type ValueType = string|null;
        let t: ValueType = c.value;
        let t1 = c.value;
        t1 = null as unknown as ValueType;
      }
      {
        type RawValueType = string|null;
        let t: RawValueType = c.getRawValue();
        let t1 = c.getRawValue();
        t1 = null as unknown as RawValueType;
      }
      c.setValue(null);
      c.setValue('');
      // @ts-expect-error
      c.setValue(7);
      c.patchValue(null);
      c.patchValue('');
      c.reset();
      c.reset('');
    });

    it('should create a nullable control without {initialValueIsDefault: true}', () => {
      const c = new FormControl<string>('');
      {
        type ValueType = string|null;
        let t: ValueType = c.value;
        let t1 = c.value;
        t1 = null as unknown as ValueType;
      }
      {
        type RawValueType = string|null;
        let t: RawValueType = c.getRawValue();
        let t1 = c.getRawValue();
        t1 = null as unknown as RawValueType;
      }
      c.setValue(null);
      c.setValue('');
      c.patchValue(null);
      c.patchValue('');
      c.reset();
      c.reset('');
    });

    it('should not allow assignment to an incompatible control', () => {
      let fcs = new FormControl('bob');
      let fcn = new FormControl(42);
      // @ts-expect-error
      fcs = fcn;
      // @ts-expect-error
      fcn = fcs;
    });

    it('is assignable to UntypedFormControl', () => {
      const c = new FormControl<string>('');
      let ufc: UntypedFormControl;
      ufc = c;
    });
  });

  describe('FormGroup', () => {
    it('supports inferred groups', () => {
      const c = new FormGroup({
        c: new FormControl('', {initialValueIsDefault: true}),
        d: new FormControl(0, {initialValueIsDefault: true})
      });
      {
        type ValueType = Partial<{c: string, d: number}>;
        let t: ValueType = c.value;
        let t1 = c.value;
        t1 = null as unknown as ValueType;
      }
      {
        type RawValueType = {c: string, d: number};
        let t: RawValueType = c.getRawValue();
        let t1 = c.getRawValue();
        t1 = null as unknown as RawValueType;
      }
      c.registerControl('c', new FormControl('', {initialValueIsDefault: true}));
      c.addControl('c', new FormControl('', {initialValueIsDefault: true}));
      c.setControl('c', new FormControl('', {initialValueIsDefault: true}));
      c.contains('c');
      c.setValue({c: '', d: 0});
      c.patchValue({c: ''});
      c.reset({c: '', d: 0});
    });

    it('supports explicit groups', () => {
      const c = new FormGroup<{c: FormControl<string>, d: FormControl<number>}>({
        c: new FormControl('', {initialValueIsDefault: true}),
        d: new FormControl(0, {initialValueIsDefault: true})
      });
      {
        type ValueType = Partial<{c: string, d: number}>;
        let t: ValueType = c.value;
        let t1 = c.value;
        t1 = null as unknown as ValueType;
      }
      {
        type RawValueType = {c: string, d: number};
        let t: RawValueType = c.getRawValue();
        let t1 = c.getRawValue();
        t1 = null as unknown as RawValueType;
      }
      c.registerControl('c', new FormControl('', {initialValueIsDefault: true}));
      c.addControl('c', new FormControl('', {initialValueIsDefault: true}));
      c.setControl('c', new FormControl('', {initialValueIsDefault: true}));
      c.contains('c');
      c.setValue({c: '', d: 0});
      c.patchValue({c: ''});
      c.reset({c: '', d: 0});
    });

    it('supports groups with nullable controls', () => {
      const c = new FormGroup({
        c: new FormControl<string|null>(''),
        d: new FormControl('', {initialValueIsDefault: true})
      });
      {
        type ValueType = Partial<{c: string | null, d: string}>;
        let t: ValueType = c.value;
        let t1 = c.value;
        t1 = null as unknown as ValueType;
      }
      {
        type RawValueType = {c: string | null, d: string};
        let t: RawValueType = c.getRawValue();
        let t1 = c.getRawValue();
        t1 = null as unknown as RawValueType;
      }
      c.registerControl('c', new FormControl<string|null>(null));
      c.addControl('c', new FormControl<string|null>(null));
      c.setControl('c', new FormControl<string|null>(null));
      c.contains('c');
      c.setValue({c: '', d: ''});
      c.setValue({c: null, d: ''});
      c.patchValue({});
      c.reset({});
      c.reset({d: ''});
      c.reset({c: ''});
      c.reset({c: '', d: ''});
    });

    it('supports groups with the default type', () => {
      let c: FormGroup;
      let c2 = new FormGroup(
          {c: new FormControl(''), d: new FormControl('', {initialValueIsDefault: true})});
      c = c2;
      expect(c.value.d).toBe('');
      c.value;
      c.reset();
      c.reset({c: ''});
      c.reset({c: '', d: ''});
      c.reset({c: '', d: ''}, {});
      c.setValue({c: '', d: ''});
      c.setValue({c: 99, d: 42});
      c.setControl('c', new FormControl(0));
      c.setControl('notpresent', new FormControl(0));
      c.controls.d.valueChanges.subscribe((v) => {});
    });

    it('supports groups with explicit named interface types', () => {
      interface Cat {
        lives: number;
      }
      interface CatControls {
        lives: FormControl<number>;
      }
      const c =
          new FormGroup<CatControls>({lives: new FormControl(9, {initialValueIsDefault: true})});
      {
        type ValueType = Partial<Cat>;
        let t: ValueType = c.value;
        let t1 = c.value;
        t1 = null as unknown as ValueType;
      }
      {
        type RawValueType = Cat;
        let t: RawValueType = c.getRawValue();
        let t1 = c.getRawValue();
        t1 = null as unknown as RawValueType;
      }
      c.registerControl('lives', new FormControl(0, {initialValueIsDefault: true}));
      c.addControl('lives', new FormControl(0, {initialValueIsDefault: true}));
      c.setControl('lives', new FormControl(0, {initialValueIsDefault: true}));
      c.contains('lives');
      c.setValue({lives: 0});
      c.patchValue({});
      c.reset({lives: 0});
    });

    it('supports groups with nested explicit named interface types', () => {
      interface CatInterface {
        name: string;
        lives: number;
      }
      interface CatControlsInterface {
        name: FormControl<string>;
        lives: FormControl<number>;
      }

      interface LitterInterface {
        brother: CatInterface;
        sister: CatInterface;
      }
      interface LitterControlsInterface {
        brother: FormGroup<CatControlsInterface>;
        sister: FormGroup<CatControlsInterface>;
      }
      const bro = new FormGroup<CatControlsInterface>({
        name: new FormControl('bob', {initialValueIsDefault: true}),
        lives: new FormControl(9, {initialValueIsDefault: true})
      });
      const sis = new FormGroup<CatControlsInterface>({
        name: new FormControl('lucy', {initialValueIsDefault: true}),
        lives: new FormControl(9, {initialValueIsDefault: true})
      });
      const litter = new FormGroup<LitterControlsInterface>({
        brother: bro,
        sister: sis,
      });
      {
        type ValueType = Partial<{brother: Partial<CatInterface>, sister: Partial<CatInterface>}>;
        let t: ValueType = litter.value;
        let t1 = litter.value;
        t1 = null as unknown as ValueType;
      }
      {
        type RawValueType = LitterInterface;
        let t: RawValueType = litter.getRawValue();
        let t1 = litter.getRawValue();
        t1 = null as unknown as RawValueType;
      }
      litter.patchValue({brother: {name: 'jim'}});
      litter.controls.brother.setValue({name: 'jerry', lives: 1});
    });

    it('supports nested inferred groups', () => {
      const c = new FormGroup({
        innerGroup:
            new FormGroup({innerControl: new FormControl('', {initialValueIsDefault: true})})
      });
      {
        type ValueType = Partial<{innerGroup: Partial<{innerControl: string}>}>;
        let t: ValueType = c.value;
        let t1 = c.value;
        t1 = null as unknown as ValueType;
      }
      {
        type RawValueType = {innerGroup: {innerControl: string}};
        let t: RawValueType = c.getRawValue();
        let t1 = c.getRawValue();
        t1 = null as unknown as RawValueType;
      }
      c.registerControl(
          'innerGroup',
          new FormGroup({innerControl: new FormControl('', {initialValueIsDefault: true})}));
      c.addControl(
          'innerGroup',
          new FormGroup({innerControl: new FormControl('', {initialValueIsDefault: true})}));
      c.setControl(
          'innerGroup',
          new FormGroup({innerControl: new FormControl('', {initialValueIsDefault: true})}));
      c.contains('innerGroup');
      c.setValue({innerGroup: {innerControl: ''}});
      c.patchValue({});
      c.reset({innerGroup: {innerControl: ''}});
    });

    it('supports nested explicit groups', () => {
      const ig = new FormControl('', {initialValueIsDefault: true});
      const og = new FormGroup({innerControl: ig});
      const c = new FormGroup<{innerGroup: FormGroup<{innerControl: FormControl<string>}>}>(
          {innerGroup: og});
      {
        type ValueType = Partial<{innerGroup: Partial<{innerControl: string}>}>;
        let t: ValueType = c.value;
        let t1 = c.value;
        t1 = null as unknown as ValueType;
      }
      {
        type RawValueType = {innerGroup: {innerControl: string}};
        let t: RawValueType = c.getRawValue();
        let t1 = c.getRawValue();
        t1 = null as unknown as RawValueType;
      }
      // Methods are tested in the inferred case
    });

    it('supports groups with a single optional control', () => {
      const c = new FormGroup<{c?: FormControl<string>}>({
        c: new FormControl<string>('', {initialValueIsDefault: true}),
      });
      {
        type ValueType = Partial<{c?: string}>;
        let t: ValueType = c.value;
        let t1 = c.value;
        t1 = null as unknown as ValueType;
      }
      {
        type RawValueType = {c?: string};
        let t: RawValueType = c.getRawValue();
        let t1 = c.getRawValue();
        t1 = null as unknown as RawValueType;
      }
    });

    it('supports groups with mixed optional controls', () => {
      const c = new FormGroup<{c?: FormControl<string>, d: FormControl<string>}>({
        c: new FormControl<string>('', {initialValueIsDefault: true}),
        d: new FormControl('', {initialValueIsDefault: true})
      });
      {
        type ValueType = Partial<{c?: string, d: string}>;
        let t: ValueType = c.value;
        let t1 = c.value;
        t1 = null as unknown as ValueType;
      }
      {
        type RawValueType = {c?: string, d: string};
        let t: RawValueType = c.getRawValue();
        let t1 = c.getRawValue();
        t1 = null as unknown as RawValueType;
      }
      c.registerControl('c', new FormControl<string>('', {initialValueIsDefault: true}));
      c.addControl('c', new FormControl<string>('', {initialValueIsDefault: true}));
      c.removeControl('c');
      c.setControl('c', new FormControl<string>('', {initialValueIsDefault: true}));
      c.contains('c');
      c.setValue({c: '', d: ''});
      c.patchValue({});
      c.reset({});
      c.reset({c: ''});
      c.reset({d: ''});
      c.reset({c: '', d: ''});
      // @ts-expect-error
      c.removeControl('d');  // This is not allowed
    });

    it('supports nested groups with optional controls', () => {
      type t = FormGroup<{meal: FormGroup<{dessert?: FormControl<string>}>}>;
      const menu = new FormGroup<{meal: FormGroup<{dessert?: FormControl<string>}>}>(
          {meal: new FormGroup({})});
      {
        type ValueType = Partial<{meal: Partial<{dessert?: string}>}>;
        let t: ValueType = menu.value;
        let t1 = menu.value;
        t1 = null as unknown as ValueType;
      }
      {
        type RawValueType = {meal: {dessert?: string}};
        let t: RawValueType = menu.getRawValue();
        let t1 = menu.getRawValue();
        t1 = null as unknown as RawValueType;
      }
      menu.controls.meal.removeControl('dessert');
    });

    it('supports groups with inferred nested arrays', () => {
      const arr = new FormArray([new FormControl('', {initialValueIsDefault: true})]);
      const c = new FormGroup({a: arr});
      {
        type ValueType = Partial<{a: Array<string>}>;
        let t: ValueType = c.value;
        let t1 = c.value;
        t1 = null as unknown as ValueType;
      }
      {
        type RawValueType = {a: Array<string>};
        let t: RawValueType = c.getRawValue();
        let t1 = c.getRawValue();
        t1 = null as unknown as RawValueType;
      }
      c.registerControl('a', new FormArray([
                          new FormControl('', {initialValueIsDefault: true}),
                          new FormControl('', {initialValueIsDefault: true})
                        ]));
      c.registerControl('a', new FormArray([new FormControl('', {initialValueIsDefault: true})]));
      c.registerControl('a', new FormArray([]));
      c.addControl('a', new FormArray([
                     new FormControl('', {initialValueIsDefault: true}),
                     new FormControl('', {initialValueIsDefault: true})
                   ]));
      c.addControl('a', new FormArray([new FormControl('', {initialValueIsDefault: true})]));
      c.addControl('a', new FormArray([]));
      c.setControl('a', new FormArray([
                     new FormControl('', {initialValueIsDefault: true}),
                     new FormControl('', {initialValueIsDefault: true})
                   ]));
      c.setControl('a', new FormArray([new FormControl('', {initialValueIsDefault: true})]));
      c.setControl('a', new FormArray([]));
      c.contains('a');
      c.patchValue({a: ['', '']});
      c.patchValue({a: ['']});
      c.patchValue({a: []});
      c.patchValue({});
      c.reset({a: ['', '']});
      c.reset({a: ['']});
      c.reset({a: []});
    });

    it('supports groups with explicit nested arrays', () => {
      const arr =
          new FormArray<FormControl<string>>([new FormControl('', {initialValueIsDefault: true})]);
      const c = new FormGroup<{a: FormArray<FormControl<string>>}>({a: arr});
      {
        type ValueType = Partial<{a: Array<string>}>;
        let t: ValueType = c.value;
        let t1 = c.value;
        t1 = null as unknown as ValueType;
      }
      {
        type RawValueType = {a: Array<string>};
        let t: RawValueType = c.getRawValue();
        let t1 = c.getRawValue();
        t1 = null as unknown as RawValueType;
      }
      // Methods are tested in the inferred case
    });

    it('supports a complex, deeply nested case', () => {
      interface Meal {
        entree: FormControl<string>;
        dessert: FormControl<string>;
      }
      const myParty = new FormGroup({
        venue: new FormGroup({
          loCation: new FormControl('San Francisco', {initialValueIsDefault: true}),
          date: new FormGroup({
            year: new FormControl(2022, {initialValueIsDefault: true}),
            month: new FormControl('May', {initialValueIsDefault: true}),
            day: new FormControl(1, {initialValueIsDefault: true}),
          }),
        }),
        dinnerOptions: new FormArray([
          new FormGroup({
            food: new FormGroup<Meal>({
              entree: new FormControl('Baked Tofu', {initialValueIsDefault: true}),
              dessert: new FormControl('Cheesecake', {initialValueIsDefault: true}),
            }),
            price: new FormGroup({
              amount: new FormControl(10, {initialValueIsDefault: true}),
              currency: new FormControl('USD', {initialValueIsDefault: true}),
            }),
          }),
          new FormGroup({
            food: new FormGroup<Meal>({
              entree: new FormControl('Eggplant Parm', {initialValueIsDefault: true}),
              dessert: new FormControl('Chocolate Mousse', {initialValueIsDefault: true}),
            }),
            price: new FormGroup({
              amount: new FormControl(12, {initialValueIsDefault: true}),
              currency: new FormControl('USD', {initialValueIsDefault: true}),
            }),
          })
        ])
      });
      {
        type ValueType = Partial<{
          venue: Partial<{
            loCation: string,
            date: Partial<{
              year: number,
              month: string,
              day: number,
            }>,
          }>,
          dinnerOptions: Partial<{
            food: Partial<{
              entree: string,
              dessert: string,
            }>,
            price: Partial<{
              amount: number,
              currency: string,
            }>,
          }>[],
        }>;
        let t: ValueType = myParty.value;
        let t1 = myParty.value;
        t1 = null as unknown as ValueType;
      }
      {
        type RawValueType = {
          venue: {
            loCation: string,
            date: {
              year: number,
              month: string,
              day: number,
            },
          },
          dinnerOptions: {
            food: {
              entree: string,
              dessert: string,
            },
            price: {
              amount: number,
              currency: string,
            },
          }[],
        };
        let t: RawValueType = myParty.getRawValue();
        let t1 = myParty.getRawValue();
        t1 = null as unknown as RawValueType;
      }
    });

    it('supports groups with an index type', () => {
      // This test is required for the default case, which relies on an index type with values
      // AbstractControl<any>.
      interface AddressBookValues {
        returnIfFound: string;
        [name: string]: string;
      }
      interface AddressBookControls {
        returnIfFound: FormControl<string>;
        [name: string]: FormControl<string>;
      }
      const c = new FormGroup<AddressBookControls>({
        returnIfFound: new FormControl('1234 Geary, San Francisco', {initialValueIsDefault: true}),
        alex: new FormControl('999 Valencia, San Francisco', {initialValueIsDefault: true}),
        andrew: new FormControl('100 Lombard, San Francisco', {initialValueIsDefault: true})
      });
      {
        type ValueType = Partial<AddressBookValues>;
        let t: ValueType = c.value;
        let t1 = c.value;
        t1 = null as unknown as ValueType;
      }
      {
        type RawValueType = AddressBookValues;
        let t: RawValueType = c.getRawValue();
        let t1 = c.getRawValue();
        t1 = null as unknown as RawValueType;
      }
      // Named fields.
      c.registerControl(
          'returnIfFound',
          new FormControl('200 Ellis, San Francisco', {initialValueIsDefault: true}));
      c.addControl(
          'returnIfFound',
          new FormControl('200 Ellis, San Francisco', {initialValueIsDefault: true}));
      c.setControl(
          'returnIfFound',
          new FormControl('200 Ellis, San Francisco', {initialValueIsDefault: true}));
      // c.removeControl('returnIfFound'); // Not allowed
      c.contains('returnIfFound');
      c.setValue({returnIfFound: '200 Ellis, San Francisco', alex: '1 Main', andrew: '2 Main'});
      c.patchValue({});
      c.reset({returnIfFound: '200 Ellis, San Francisco'});
      // Indexed fields.
      c.registerControl(
          'igor', new FormControl('300 Page, San Francisco', {initialValueIsDefault: true}));
      c.addControl(
          'igor', new FormControl('300 Page, San Francisco', {initialValueIsDefault: true}));
      c.removeControl('igor');
      c.setControl(
          'igor', new FormControl('300 Page, San Francisco', {initialValueIsDefault: true}));
      c.contains('igor');
      c.setValue({
        returnIfFound: '200 Ellis, San Francisco',
        igor: '300 Page, San Francisco',
        alex: '1 Main',
        andrew: '2 Page',
      });
      c.patchValue({});
      c.reset({returnIfFound: '200 Ellis, San Francisco', igor: '300 Page, San Francisco'});
    });

    it('should have strongly-typed get', () => {
      const c = new FormGroup({
        venue: new FormGroup({
          address: new FormControl('2200 Bryant', {initialValueIsDefault: true}),
          date: new FormGroup({
            day: new FormControl(21, {initialValueIsDefault: true}),
            month: new FormControl('March', {initialValueIsDefault: true})
          })
        })
      });
      const rv = c.getRawValue();
      {
        type ValueType = {day: number, month: string};
        let t: ValueType = c.get('venue.date')!.value;
        let t1 = c.get('venue.date')!.value;
        t1 = null as unknown as ValueType;
      }
      {
        type ValueType = string;
        let t: ValueType = c.get('venue.date.month')!.value;
        let t1 = c.get('venue.date.month')!.value;
        t1 = null as unknown as ValueType;
      }
      {
        type ValueType = string;
        let t: ValueType = c.get(['venue', 'date', 'month'] as const)!.value;
        let t1 = c.get(['venue', 'date', 'month'] as const)!.value;
        t1 = null as unknown as ValueType;
      }
    });

    it('is assignable to UntypedFormGroup', () => {
      let ufg: UntypedFormGroup;
      const fg = new FormGroup({name: new FormControl('bob')});
      ufg = fg;
    });

    it('is assignable to UntypedFormGroup in a complex case', () => {
      interface Cat {
        name: FormControl<string|null>;
        lives?: FormControl<number>;
      }
      let ufg: UntypedFormGroup;
      const fg = new FormGroup(
          {myCats: new FormArray([new FormGroup<Cat>({name: new FormControl('bob')})])});
      ufg = fg;
    });
  });

  describe('FormRecord', () => {
    it('supports inferred records', () => {
      const c = new FormRecord({
        c: new FormControl('', {initialValueIsDefault: true}),
        d: new FormControl('', {initialValueIsDefault: true})
      });
      {
        type ValueType = Partial<{[key: string]: string}>;
        let t: ValueType = c.value;
        let t1 = c.value;
        t1 = null as unknown as ValueType;
      }
      {
        type RawValueType = {[key: string]: string};
        let t: RawValueType = c.getRawValue();
        let t1 = c.getRawValue();
        t1 = null as unknown as RawValueType;
      }
      c.registerControl('c', new FormControl('', {initialValueIsDefault: true}));
      c.addControl('c', new FormControl('', {initialValueIsDefault: true}));
      c.setControl('c', new FormControl('', {initialValueIsDefault: true}));
      c.contains('c');
      c.setValue({c: '', d: ''});
      c.patchValue({c: ''});
      c.reset({c: '', d: ''});
    });
  });

  describe('FormArray', () => {
    it('supports inferred arrays', () => {
      const c = new FormArray([new FormControl('', {initialValueIsDefault: true})]);
      {
        type ValueType = string[];
        let t: ValueType = c.value;
        let t1 = c.value;
        t1 = null as unknown as ValueType;
      }
      c.at(0);
      c.push(new FormControl('', {initialValueIsDefault: true}));
      c.insert(0, new FormControl('', {initialValueIsDefault: true}));
      c.removeAt(0);
      c.setControl(0, new FormControl('', {initialValueIsDefault: true}));
      c.setValue(['', '']);
      c.patchValue([]);
      c.patchValue(['']);
      c.reset();
      c.reset([]);
      c.reset(['']);
      c.clear();
    });

    it('supports explicit arrays', () => {
      const c =
          new FormArray<FormControl<string>>([new FormControl('', {initialValueIsDefault: true})]);
      {
        type ValueType = string[];
        let t: ValueType = c.value;
        let t1 = c.value;
        t1 = null as unknown as ValueType;
      }
    });

    it('supports arrays with the default type', () => {
      let c: FormArray;
      c = new FormArray([new FormControl('', {initialValueIsDefault: true})]);
      {
        type ValueType = any[];
        let t: ValueType = c.value;
        let t1 = c.value;
        t1 = null as unknown as ValueType;
      }
      c.at(0);
      c.at(0).valueChanges.subscribe(v => {});
      c.push(new FormControl('', {initialValueIsDefault: true}));
      c.insert(0, new FormControl('', {initialValueIsDefault: true}));
      c.removeAt(0);
      c.setControl(0, new FormControl('', {initialValueIsDefault: true}));
      c.setValue(['', '']);
      c.patchValue([]);
      c.patchValue(['']);
      c.reset();
      c.reset(['']);
      c.clear();
    });

    it('supports arrays with nullable controls', () => {
      const c = new FormArray([new FormControl<string|null>('')]);
      {
        type ValueType = Array<string|null>;
        let t: ValueType = c.value;
        let t1 = c.value;
        t1 = null as unknown as ValueType;
      }
      c.at(0);
      c.push(new FormControl<string|null>(null));
      c.insert(0, new FormControl<string|null>(null));
      c.removeAt(0);
      c.setControl(0, new FormControl<string|null>(null));
      c.setValue(['', '']);
      c.patchValue([]);
      c.patchValue(['']);
      c.reset();
      c.reset([]);
      c.reset(['']);
      c.clear();
    });

    it('supports inferred nested arrays', () => {
      const c =
          new FormArray([new FormArray([new FormControl('', {initialValueIsDefault: true})])]);
      {
        type ValueType = Array<Array<string>>;
        let t: ValueType = c.value;
        let t1 = c.value;
        t1 = null as unknown as ValueType;
      }
    });

    it('supports explicit nested arrays', () => {
      const c = new FormArray<FormArray<FormControl<string>>>(
          [new FormArray([new FormControl('', {initialValueIsDefault: true})])]);
      {
        type ValueType = Array<Array<string>>;
        let t: ValueType = c.value;
        let t1 = c.value;
        t1 = null as unknown as ValueType;
      }
    });

    it('supports arrays with inferred nested groups', () => {
      const fg = new FormGroup({c: new FormControl('', {initialValueIsDefault: true})});
      const c = new FormArray([fg]);
      {
        type ValueType = Array<Partial<{c: string}>>;
        let t: ValueType = c.value;
        let t1 = c.value;
        t1 = null as unknown as ValueType;
      }
      {
        type RawValueType = Array<{c: string}>;
        let t: RawValueType = c.getRawValue();
        let t1 = c.getRawValue();
        t1 = null as unknown as RawValueType;
      }
    });

    it('supports arrays with explicit nested groups', () => {
      const fg = new FormGroup<{c: FormControl<string>}>(
          {c: new FormControl('', {initialValueIsDefault: true})});
      const c = new FormArray<FormGroup<{c: FormControl<string>}>>([fg]);
      {
        type ValueType = Array<Partial<{c: string}>>;
        let t: ValueType = c.value;
        let t1 = c.value;
        t1 = null as unknown as ValueType;
      }
      {
        type RawValueType = Array<{c: string}>;
        let t: RawValueType = c.getRawValue();
        let t1 = c.getRawValue();
        t1 = null as unknown as RawValueType;
      }
    });

    it('is assignable to UntypedFormArray', () => {
      let ufa: UntypedFormArray;
      const fa = new FormArray([new FormControl('bob')]);
      ufa = fa;
    });
  });

  describe('FormBuilder', () => {
    let fb: FormBuilder;

    beforeEach(() => {
      fb = new FormBuilder();
    });

    it('should build FormControls', () => {
      const fc = fb.control(42);
      expect(fc.value).toEqual(42);
    });

    it('should build FormGroups', () => {
      const fc = fb.group({
        'foo': 1,
        'bar': 2,
      });
      expect(fc.value.foo).toEqual(1);
    });
  });
});

describe('Untyped Class', () => {
  describe('UntypedFormControl', () => {
    it('should function like a FormControl with the default type', () => {
      const ufc = new UntypedFormControl('foo');
      expect(ufc.value).toEqual('foo');
    });

    it('should default to null with no argument', () => {
      const ufc = new UntypedFormControl();
      expect(ufc.value).toEqual(null);
    });

    it('is assignable to FormControl', () => {
      let fc: FormControl;
      const ufc = new UntypedFormControl('foo');
      fc = ufc;
    });

    it('is an escape hatch from a strongly-typed FormControl', () => {
      let fc = new FormControl<number>(42);
      const ufc = new UntypedFormControl('foo');
      fc = ufc;
    });
  });

  describe('UntypedFormGroup', () => {
    it('should function like a FormGroup with the default type', () => {
      const ufc = new UntypedFormGroup({foo: new FormControl('bar')});
      expect(ufc.value).toEqual({foo: 'bar'});
    });

    it('should allow dotted access to properties', () => {
      const ufc = new UntypedFormGroup({foo: new FormControl('bar')});
      expect(ufc.value.foo).toEqual('bar');
    });

    it('should allow access to AbstractControl methods', () => {
      const ufc = new UntypedFormGroup({foo: new FormControl('bar')});
      expect(ufc.validator).toBe(null);
    });

    it('is assignable to FormGroup', () => {
      let fg: FormGroup;
      const ufg = new UntypedFormGroup({foo: new FormControl('bar')});
      fg = ufg;
    });

    it('is assignable to FormGroup', () => {
      let fg: FormGroup;
      const ufg = new UntypedFormGroup({foo: new FormControl('bar')});
      fg = ufg;
    });

    it('is an escape hatch from a strongly-typed FormGroup', () => {
      let fg = new FormGroup({foo: new FormControl<number>(42)});
      const ufg = new UntypedFormGroup({foo: new FormControl('bar')});
      fg = ufg;
    });
  });

  describe('UntypedFormArray', () => {
    it('should function like a FormArray with the default type', () => {
      const ufc = new UntypedFormArray([new FormControl('foo')]);
      expect(ufc.value).toEqual(['foo']);
    });

    it('is assignable to FormArray', () => {
      let fa: FormArray;
      const ufa = new UntypedFormArray([new FormControl('foo')]);
      fa = ufa;
    });
  });

  describe('UntypedFormBuilder', () => {
    let ufb: UntypedFormBuilder;

    beforeEach(() => {
      ufb = new UntypedFormBuilder();
    });

    it('should build untyped FormControls', () => {
      const ufc = ufb.control(42);
      expect(ufc.value).toEqual(42);
    });

    it('should build untyped FormGroups', () => {
      const ufc = ufb.group({
        'foo': 1,
        'bar': 2,
      });
      expect(ufc.value.foo).toEqual(1);
    });
  });
});
