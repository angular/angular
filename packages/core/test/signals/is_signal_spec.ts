/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  computed,
  isSignal,
  signal,
  createLiteSet,
  clearLiteSet,
  addToLiteSet,
  removeFromLiteSet,
} from '@angular/core';

describe('isSignal', () => {
  it('should return true for writable signal', () => {
    const writableSignal = signal('Angular');
    expect(isSignal(writableSignal)).toBe(true);
  });

  it('should return true for readonly signal', () => {
    const readonlySignal = computed(() => 10);
    expect(isSignal(readonlySignal)).toBe(true);
  });

  it('should return false for primitive', () => {
    const primitive = 0;
    expect(isSignal(primitive)).toBe(false);
  });

  it('should return false for object', () => {
    const object = {name: 'Angular'};
    expect(isSignal(object)).toBe(false);
  });

  it('should return false for function', () => {
    const fn = () => {};
    expect(isSignal(fn)).toBe(false);
  });
});

describe('set', () => {
  it('addToLiteSet', () => {
    const set = createLiteSet();
    const obj1 = {};
    const obj2 = {};
    addToLiteSet(set, obj1);
    addToLiteSet(set, obj2);
    expect(set.length-8).toBe(2);
    // must spread since jasmine doesn't like the extra properties we use for indexing
    expect(set.slice(8)).toEqual([obj1, obj2]);
  });

  it('addToLiteSet ignores duplicate adds', () => {
    const set = createLiteSet();
    const obj1 = {};
    const obj2 = {};
    addToLiteSet(set, obj1);
    addToLiteSet(set, obj2);
    addToLiteSet(set, obj1);
    expect(set.length-8).toBe(2);
    expect(set.slice(8)).toEqual([obj1, obj2]);
  });

  it('add remove', () => {
    const set = createLiteSet();
    const obj1 = {};
    const obj2 = {};
    addToLiteSet(set, obj1);
    addToLiteSet(set, obj2);
    expect(set.length-8).toBe(2);
    removeFromLiteSet(set, obj1);
    removeFromLiteSet(set, obj2);
    expect(set.length-8).toBe(0);
    expect(set.slice(8)).toEqual([]);
  });

  it('clear and add again', () => {
    const set = createLiteSet();
    const obj1 = {};
    const obj2 = {};
    addToLiteSet(set, obj1);
    addToLiteSet(set, obj2);
    expect(set.length-8).toBe(2);
    expect(set.slice(8)).toEqual([obj1, obj2]);
    clearLiteSet(set);
    addToLiteSet(set, obj1);
    addToLiteSet(set, obj2);
    expect(set.length-8).toBe(2);
    expect(set.slice(8)).toEqual([obj1, obj2]);
  });
});
