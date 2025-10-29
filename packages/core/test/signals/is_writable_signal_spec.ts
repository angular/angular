/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, isWritableSignal, signal} from '../../src/core';

describe('isWritableSignal', () => {
  it('should return true for writable signal', () => {
    const writableSignal = signal('Angular');
    expect(isWritableSignal(writableSignal)).toBe(true);
  });

  it('should return false for readonly signal (computed)', () => {
    const readonlySignal = computed(() => 10);
    expect(isWritableSignal(readonlySignal)).toBe(false);
  });

  it('should return false for readonly signal (asReadonly)', () => {
    const writableSignal = signal('Angular');
    const readonlySignal = writableSignal.asReadonly();
    expect(isWritableSignal(readonlySignal)).toBe(false);
  });

  it('should return false for primitive', () => {
    const primitive = 0;
    expect(isWritableSignal(primitive)).toBe(false);
  });

  it('should return false for object', () => {
    const object = {name: 'Angular'};
    expect(isWritableSignal(object)).toBe(false);
  });

  it('should return false for function', () => {
    const fn = () => {};
    expect(isWritableSignal(fn)).toBe(false);
  });

  it('should return false for object with set method', () => {
    const obj = {
      set: (value: any) => {},
    };
    expect(isWritableSignal(obj)).toBe(false);
  });

  it('should return false for function with set property', () => {
    const fn = () => {};
    (fn as any).set = (value: any) => {};
    expect(isWritableSignal(fn)).toBe(false);
  });

  it('should correctly identify writable signal with complex value', () => {
    const complexSignal = signal({name: 'Angular', version: 17});
    expect(isWritableSignal(complexSignal)).toBe(true);
  });

  it('should return false for null', () => {
    expect(isWritableSignal(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isWritableSignal(undefined)).toBe(false);
  });
});
