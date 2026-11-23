/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT, ElementRef, Renderer2, RendererFactory2} from '@angular/core';
import {TestBed} from '@angular/core/testing';

import {
  ɵNgSelectMultipleOption as NgSelectMultipleOption,
  SelectMultipleControlValueAccessor,
} from '../index';

describe('SelectMultipleControlValueAccessor', () => {
  let select: HTMLSelectElement;
  let renderer: Renderer2;
  let accessor: SelectMultipleControlValueAccessor;

  beforeEach(() => {
    select = TestBed.inject(DOCUMENT).createElement('select');
    select.multiple = true;
    renderer = TestBed.inject(RendererFactory2).createRenderer(null, null);
    accessor = new SelectMultipleControlValueAccessor(renderer, new ElementRef(select));
  });

  function addOption(value: unknown): NgSelectMultipleOption {
    const element = TestBed.inject(DOCUMENT).createElement('option');
    select.appendChild(element);
    const option = new NgSelectMultipleOption(new ElementRef(element), renderer, accessor);
    option.ngValue = value;
    return option;
  }

  function selectedStates(): boolean[] {
    return Array.from(select.options, (option) => option.selected);
  }

  it('should select only the first registered option for duplicate identities', () => {
    const value = {};
    addOption(value);
    addOption(value);
    addOption({});
    addOption('other');

    accessor.writeValue([value, 'other']);
    expect(selectedStates()).toEqual([true, false, false, true]);

    accessor.writeValue([value, value]);
    expect(selectedStates()).toEqual([true, false, false, false]);

    select.appendChild(select.options[0]);
    accessor.writeValue([value, 'other']);
    expect(selectedStates()).toEqual([false, false, true, true]);
  });

  it('should distinguish signed zero and select only the first NaN option', () => {
    for (const value of [0, -0, NaN, NaN, 'other']) addOption(value);

    accessor.writeValue([-0, NaN]);
    expect(selectedStates()).toEqual([false, true, true, false, false]);

    accessor.writeValue([0, 'other']);
    expect(selectedStates()).toEqual([true, false, false, false, true]);
  });

  it('should ignore holes in the model array', () => {
    addOption(undefined);
    addOption('selected');
    const values = new Array<unknown>(2);
    values[1] = 'selected';

    accessor.writeValue(values);
    expect(selectedStates()).toEqual([false, true]);
  });

  it('should preserve custom comparison order and first matches', () => {
    const values = [{id: 1}, {id: 1}, {id: 2}];
    for (const value of values) addOption(value);
    const compare = jasmine.createSpy('compare').and.callFake((a, b) => a.id === b.id);
    accessor.compareWith = compare;
    const selected = [{id: 2}, {id: 1}];

    accessor.writeValue(selected);
    expect(selectedStates()).toEqual([true, false, true]);
    expect(compare.calls.allArgs()).toEqual([
      [values[0], selected[0]],
      [values[1], selected[0]],
      [values[2], selected[0]],
      [values[0], selected[1]],
    ]);
  });

  it('should ignore values without registered options', () => {
    addOption('A');
    addOption('B');

    accessor.writeValue(['missing']);
    expect(selectedStates()).toEqual([false, false]);

    accessor.compareWith = (a, b) => a === b;
    accessor.writeValue(['missing', 'B']);
    expect(selectedStates()).toEqual([false, true]);
  });

  for (const binding of ['value', 'ngValue'] as const) {
    it(`should synchronously transfer the first match after a [${binding}] update`, () => {
      const first = addOption('A');
      addOption('A');
      addOption('B');
      accessor.writeValue(['A', 'B']);

      first[binding] = 'C';
      expect(selectedStates()).toEqual([false, true, true]);

      first[binding] = 'A';
      expect(selectedStates()).toEqual([true, false, true]);
    });
  }

  it('should synchronously select the next duplicate when the first match is removed', () => {
    const first = addOption('A');
    addOption('A');
    addOption('B');
    accessor.writeValue(['A', 'B']);

    first.ngOnDestroy();
    expect(selectedStates().slice(1)).toEqual([true, true]);
  });

  it('should synchronously clear native selection for an empty or null model', () => {
    addOption('A');
    addOption('B');

    accessor.writeValue(['A', 'B']);
    accessor.writeValue([]);
    expect(selectedStates()).toEqual([false, false]);

    select.options[0].selected = true;
    accessor.writeValue(null);
    expect(selectedStates()).toEqual([false, false]);
  });

  it('should synchronously clear other options when an option changes with an empty model', () => {
    addOption('A');
    const changed = addOption('B');
    accessor.writeValue([]);
    select.options[0].selected = true;

    changed.ngValue = 'C';
    expect(selectedStates()).toEqual([false, false]);
  });

  it('should scan option identities at most once when selecting many values', () => {
    const values = Array.from({length: 128}, () => ({}));
    let reads = 0;
    for (const value of values) {
      const option = addOption(value);
      Object.defineProperty(option, '_value', {
        get: () => {
          reads++;
          return value;
        },
      });
    }

    accessor.writeValue(values);
    expect(reads).toBeLessThanOrEqual(values.length * 2);
    expect(selectedStates()).toEqual(values.map(() => true));
  });
});
