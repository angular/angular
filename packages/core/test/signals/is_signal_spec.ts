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
  it('add remove', () => {
    const set = createLiteSet();
    const obj1 = {};
    const obj2 = {};
    console.error('@@@1', Object.keys(set));
    addToLiteSet(set, obj1);
    console.error('@@@2', Object.keys(set));
    addToLiteSet(set, obj2);
    console.error('@@@3', Object.keys(set));
    expect(set.length).toBe(2);
    removeFromLiteSet(set, obj1);
    console.error('@@@4', Object.keys(set));
    removeFromLiteSet(set, obj2);
    console.error('@@@5', Object.keys(set));
    console.error(Object.keys(set));
    expect(set.length).toBe(0);
  });
});
