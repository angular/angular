/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// These tests check only the types of strongly typed form controls. They do not validate behavior,
// except where the behavior shuold differ according to the provided types.
// For behavior tests, see the other specs in this directory.

import {expect} from '@angular/platform-browser/testing/src/matchers';

import {FormArray, FormControl, FormGroup} from '../src/forms';

{
  describe('FormControl', () => {
    it('should support inferred controls', () => {
      const c = new FormControl('', undefined, undefined, '');
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

    it('should support explicit controls', () => {
      const c = new FormControl<string>('', undefined, undefined, '');
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

    it('should support nullable controls', () => {
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
      c.patchValue(null);
      c.patchValue('');
      c.reset();
      c.reset('');
    });

    it('should implicitly create a nullable control when no default is provided', () => {
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
  });

  describe('FormGroup', () => {
    it('should support inferred groups', () => {
      const c = new FormGroup({
        c: new FormControl('', undefined, undefined, ''),
        d: new FormControl(0, undefined, undefined, 0)
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
      c.registerControl('c', new FormControl('', undefined, undefined, ''));
      c.addControl('c', new FormControl('', undefined, undefined, ''));
      c.setControl('c', new FormControl('', undefined, undefined, ''));
      c.contains('c');
      c.setValue({c: '', d: 0});
      c.patchValue({c: ''});
      c.reset({c: '', d: 0});
    });

    it('should support explicit groups', () => {
      const c = new FormGroup<{c: FormControl<string>, d: FormControl<number>}>({
        c: new FormControl('', undefined, undefined, ''),
        d: new FormControl(0, undefined, undefined, 0)
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
      c.registerControl('c', new FormControl('', undefined, undefined, ''));
      c.addControl('c', new FormControl('', undefined, undefined, ''));
      c.setControl('c', new FormControl('', undefined, undefined, ''));
      c.contains('c');
      c.setValue({c: '', d: 0});
      c.patchValue({c: ''});
      c.reset({c: '', d: 0});
    });

    it('should support groups with nullable controls', () => {
      const c = new FormGroup(
          {c: new FormControl<string|null>(''), d: new FormControl('', undefined, undefined, '')});
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

    it('should support untyped groups', () => {
      const c = new FormGroup<any>({
        c: new FormControl('', undefined, undefined, ''),
        d: new FormControl('', undefined, undefined, '')
      });
      c.value;
      c.reset();
      c.reset({c: ''});
      c.reset({c: '', d: ''});
      c.reset({c: '', d: ''}, {});
      c.setValue({c: '', d: ''});
      c.setControl('c', new FormControl(0));
    });

    it('should support groups with explicit named interface types', () => {
      interface cat {
        lives: number;
      }
      interface catControls {
        lives: FormControl<number>;
      }
      const g = {lives: new FormControl(9, undefined, undefined, 0)};
      const c = new FormGroup<catControls>(g);
      {
        type ValueType = Partial<{lives: number}>;
        let t: ValueType = c.value;
        let t1 = c.value;
        t1 = null as unknown as ValueType;
      }
      {
        type RawValueType = {lives: number};
        let t: RawValueType = c.getRawValue();
        let t1 = c.getRawValue();
        t1 = null as unknown as RawValueType;
      }
      c.registerControl('lives', new FormControl(0, undefined, undefined, 0));
      c.addControl('lives', new FormControl(0, undefined, undefined, 0));
      c.setControl('lives', new FormControl(0, undefined, undefined, 0));
      c.contains('lives');
      c.setValue({lives: 0});
      c.patchValue({});
      c.reset({lives: 0});
    });

    it('should support groups with nested explicit named interface types', () => {
      interface cat {
        lives: number;
      }
      interface catControls {
        lives: FormControl<number>;
      }
      const g = {lives: new FormControl(9, undefined, undefined, 0)};
      const c = new FormGroup<{a: FormGroup<catControls>}>({a: new FormGroup<catControls>(g)});
    });

    it('should support groups with union types', () => {
      interface cat {
        lives: number;
      }
      interface person {
        nickname: string;
      }
      interface catControls {
        lives: FormControl<number>;
      }
      interface personControls {
        nickname: FormControl<string>;
      }
      const kitty = new FormGroup({lives: new FormControl(9, undefined, undefined, 0)});
      const billy = new FormGroup({nickname: new FormControl('billy', undefined, undefined, '')});
      const c = new FormGroup<{who: FormGroup<catControls|personControls>}>({who: kitty});
      {
        type ValueType = Partial<{who: Partial<cat|person>}>;
        let t: ValueType = c.value;
        let t1 = c.value;
        t1 = null as unknown as ValueType;
      }
      {
        type RawValueType = {who: cat | person};
        let t: RawValueType = c.getRawValue();
        let t1 = c.getRawValue();
        t1 = null as unknown as RawValueType;
      }
      const kittyValue = {lives: 9};
      const billyValue = {nickname: 'billy'};
      c.registerControl('who', kitty);
      c.registerControl('who', billy);
      c.addControl('who', kitty);
      c.addControl('who', billy);
      c.setControl('who', kitty);
      c.setValue({who: kittyValue});
      c.setControl('who', billy);
      c.setValue({who: billyValue});
      c.contains('who');
      c.patchValue({});
      c.patchValue({who: kittyValue});
      c.patchValue({who: billyValue});
      c.reset({who: kittyValue});
      c.reset({who: billyValue});
    });

    it('should support nested inferred groups', () => {
      const c = new FormGroup({
        innerGroup: new FormGroup({innerControl: new FormControl('', undefined, undefined, '')})
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
          new FormGroup({innerControl: new FormControl('', undefined, undefined, '')}));
      c.addControl(
          'innerGroup',
          new FormGroup({innerControl: new FormControl('', undefined, undefined, '')}));
      c.setControl(
          'innerGroup',
          new FormGroup({innerControl: new FormControl('', undefined, undefined, '')}));
      c.contains('innerGroup');
      c.setValue({innerGroup: {innerControl: ''}});
      c.patchValue({});
      c.reset({innerGroup: {innerControl: ''}});
    });

    it('should support nested explicit groups', () => {
      const ig = new FormControl('', undefined, undefined, '');
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

    it('should support groups with optional controls', () => {
      const c = new FormGroup<{c?: FormControl<string>, d: FormControl<string>}>({
        c: new FormControl<string>('', undefined, undefined, ''),
        d: new FormControl('', undefined, undefined, '')
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
      c.registerControl('c', new FormControl<string>('', undefined, undefined, ''));
      c.addControl('c', new FormControl<string>('', undefined, undefined, ''));
      c.removeControl('c');
      // c.removeControl('d'); // This is not allowed
      c.setControl('c', new FormControl<string>('', undefined, undefined, ''));
      c.contains('c');
      // c.setValue({d: ''}); // This is not allowed
      c.setValue({c: '', d: ''});
      c.patchValue({});
      c.reset({});
      c.reset({c: ''});
      c.reset({d: ''});
      c.reset({c: '', d: ''});
    });

    it('should support groups with optional nested groups', () => {
      const v = {g: new FormGroup({c: new FormControl('', undefined, undefined, '')})};
      const c = new FormGroup<{g?: FormGroup<{c?: FormControl}>}>(v);
      {
        type ValueType = Partial<{g?: Partial<{c?: string}>}>;
        let t: ValueType = c.value;
        let t1 = c.value;
        t1 = null as unknown as ValueType;
      }
      {
        type RawValueType = {g?: {c?: string}};
        let t: RawValueType = c.getRawValue();
        let t1 = c.getRawValue();
        t1 = null as unknown as RawValueType;
      }
      c.registerControl('g', new FormGroup({c: new FormControl('', undefined, undefined, '')}));
      c.addControl('g', new FormGroup({c: new FormControl('', undefined, undefined, '')}));
      c.removeControl('g');
      c.setControl('g', new FormGroup({c: new FormControl('', undefined, undefined, '')}));
      c.setControl('g', undefined);
      c.contains('g');
      c.patchValue({});
      c.patchValue({g: {}});
      c.reset({g: {c: ''}});
      c.reset({g: {}});
      c.reset();
    });

    it('should support groups with inferred nested arrays', () => {
      const arr = new FormArray([new FormControl('', undefined, undefined, '')]);
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
                          new FormControl('', undefined, undefined, ''),
                          new FormControl('', undefined, undefined, '')
                        ]));
      c.registerControl('a', new FormArray([new FormControl('', undefined, undefined, '')]));
      c.registerControl('a', new FormArray([]));
      c.addControl('a', new FormArray([
                     new FormControl('', undefined, undefined, ''),
                     new FormControl('', undefined, undefined, '')
                   ]));
      c.addControl('a', new FormArray([new FormControl('', undefined, undefined, '')]));
      c.addControl('a', new FormArray([]));
      c.setControl('a', new FormArray([
                     new FormControl('', undefined, undefined, ''),
                     new FormControl('', undefined, undefined, '')
                   ]));
      c.setControl('a', new FormArray([new FormControl('', undefined, undefined, '')]));
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

    it('should support groups with explicit nested arrays', () => {
      const arr = new FormArray<Array<FormControl<string>>>(
          [new FormControl('', undefined, undefined, '')]);
      const c = new FormGroup<{a: FormArray<Array<FormControl<string>>>}>({a: arr});
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

    it('should support a complex, deeply nested case', () => {
      const v = {
        venue: new FormGroup({
          location: new FormControl('San Francisco', undefined, undefined, ''),
          date: new FormGroup({
            year: new FormControl(2022, undefined, undefined, 2000),
            month: new FormControl('May', undefined, undefined, ''),
            day: new FormControl(1, undefined, undefined, 1),
          }),
        }),
        dinnerOptions: new FormArray([
          new FormGroup({
            food: new FormGroup({
              entree: new FormControl('Baked Tofu', undefined, undefined, ''),
              dessert: new FormControl('Cheesecake', undefined, undefined, ''),
            }),
            price: new FormGroup({
              amount: new FormControl(10, undefined, undefined, 0),
              currency: new FormControl('USD', undefined, undefined, 'USD'),
            }),
          }),
          new FormGroup({
            food: new FormGroup({
              entree: new FormControl('Eggplant Parm', undefined, undefined, ''),
              dessert: new FormControl('Chocolate Mousse', undefined, undefined, ''),
            }),
            price: new FormGroup({
              amount: new FormControl(12, undefined, undefined, 0),
              currency: new FormControl('USD', undefined, undefined, 'USD'),
            }),
          })
        ])
      };
      const c = new FormGroup(v);
      {
        type ValueType = Partial<{
          venue: Partial<{
            location: string,
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
        let t: ValueType = c.value;
        let t1 = c.value;
        t1 = null as unknown as ValueType;
      }
      {
        type RawValueType = {
          venue: {
            location: string,
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
        let t: RawValueType = c.getRawValue();
        let t1 = c.getRawValue();
        t1 = null as unknown as RawValueType;
      }
    });

    it('should support groups with an index type', () => {
      interface AddressBookValues {
        returnIfFound: string;
        [name: string]: string;
      }
      interface AddressBookControls {
        returnIfFound: FormControl<string>;
        [name: string]: FormControl<string>;
      }
      const c = new FormGroup<AddressBookControls>({
        returnIfFound: new FormControl('1234 Geary, San Francisco', undefined, undefined, ''),
        alex: new FormControl('999 Valencia, San Francisco', undefined, undefined, ''),
        andrew: new FormControl('100 Lombard, San Francisco', undefined, undefined, '')
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
          'returnIfFound', new FormControl('200 Ellis, San Francisco', undefined, undefined, ''));
      c.addControl(
          'returnIfFound', new FormControl('200 Ellis, San Francisco', undefined, undefined, ''));
      c.setControl(
          'returnIfFound', new FormControl('200 Ellis, San Francisco', undefined, undefined, ''));
      // c.removeControl('returnIfFound'); // Not allowed
      c.contains('returnIfFound');
      c.setValue({returnIfFound: '200 Ellis, San Francisco', alex: '1 Main', andrew: '2 Main'});
      c.patchValue({});
      c.reset({returnIfFound: '200 Ellis, San Francisco'});
      // Indexed fields.
      c.registerControl(
          'igor', new FormControl('300 Page, San Francisco', undefined, undefined, ''));
      c.addControl('igor', new FormControl('300 Page, San Francisco', undefined, undefined, ''));
      c.removeControl('igor');
      c.setControl('igor', new FormControl('300 Page, San Francisco', undefined, undefined, ''));
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
          address: new FormControl('2200 Bryant', undefined, undefined, ''),
          date: new FormGroup({
            day: new FormControl(21, undefined, undefined, 1),
            month: new FormControl('March', undefined, undefined, 'January')
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
  });

  describe('FormArray', () => {
    it('should support inferred arrays', () => {
      const c = new FormArray([new FormControl('', undefined, undefined, '')]);
      {
        type ValueType = string[];
        let t: ValueType = c.value;
        let t1 = c.value;
        t1 = null as unknown as ValueType;
      }
      c.at(0);
      c.push(new FormControl('', undefined, undefined, ''));
      c.insert(0, new FormControl('', undefined, undefined, ''));
      c.removeAt(0);
      c.setControl(0, new FormControl('', undefined, undefined, ''));
      c.setValue(['', '']);
      c.patchValue([]);
      c.patchValue(['']);
      c.reset();
      c.reset([]);
      c.reset(['']);
      c.clear();
    });

    it('should support explicit arrays', () => {
      const c = new FormArray<Array<FormControl<string>>>(
          [new FormControl('', undefined, undefined, '')]);
      {
        type ValueType = string[];
        let t: ValueType = c.value;
        let t1 = c.value;
        t1 = null as unknown as ValueType;
      }
    });

    it('should support untyped arrays', () => {
      const c = new FormArray<any[]>([new FormControl('', undefined, undefined, '')]);
      {
        type ValueType = any[];
        let t: ValueType = c.value;
        let t1 = c.value;
        t1 = null as unknown as ValueType;
      }
      c.at(0);
      c.push(new FormControl('', undefined, undefined, ''));
      c.insert(0, new FormControl('', undefined, undefined, ''));
      c.removeAt(0);
      c.setControl(0, new FormControl('', undefined, undefined, ''));
      c.setValue(['', '']);
      c.patchValue([]);
      c.patchValue(['']);
      c.reset();
      c.reset(['']);
      c.clear();
    });

    it('should support arrays with nullable controls', () => {
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

    it('should support inferred nested arrays', () => {
      const c = new FormArray([new FormArray([new FormControl('', undefined, undefined, '')])]);
      {
        type ValueType = Array<Array<string>>;
        let t: ValueType = c.value;
        let t1 = c.value;
        t1 = null as unknown as ValueType;
      }
    });

    it('should support explicit nested arrays', () => {
      const c = new FormArray<Array<FormArray<Array<FormControl<string>>>>>(
          [new FormArray([new FormControl('', undefined, undefined, '')])]);
      {
        type ValueType = Array<Array<string>>;
        let t: ValueType = c.value;
        let t1 = c.value;
        t1 = null as unknown as ValueType;
      }
    });

    it('should support arrays with inferred nested groups', () => {
      const fg = new FormGroup({c: new FormControl('', undefined, undefined, '')});
      const c = new FormArray([fg]);
      c.controls;
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

    it('should support arrays with explicit nested groups', () => {
      const fg = new FormGroup<{c: FormControl<string>}>(
          {c: new FormControl('', undefined, undefined, '')});
      const c = new FormArray<Array<FormGroup<{c: FormControl<string>}>>>([fg]);
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

    it('should support arrays with explicit nested groups with optional fields', () => {
      const fg = new FormGroup<{c?: FormControl<string>}>(
          {c: new FormControl('', undefined, undefined, '')});
      const c = new FormArray<Array<FormGroup<{c?: FormControl<string>}>>>([fg]);
      {
        type ValueType = Array<Partial<{c?: string}>>;
        let t: ValueType = c.value;
        let t1 = c.value;
        t1 = null as unknown as ValueType;
      }
      {
        type RawValueType = Array<{c?: string}>;
        let t: RawValueType = c.getRawValue();
        let t1 = c.getRawValue();
        t1 = null as unknown as RawValueType;
      }
      c.at(0);
      c.push(fg);
      c.insert(0, fg);
      c.removeAt(0);
      c.setControl(0, fg);
      c.setValue([{c: 'foo'}, {c: 'foo'}]);
      c.patchValue([]);
      c.patchValue([{c: 'foo'}]);
      c.reset();
      c.reset([]);
      c.reset([{c: 'foo'}]);
      c.clear();
    });
  });
}
