/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {form} from '../../public_api';

describe('FieldTree proxy', () => {
  it('should not forward methods through the proxy', () => {
    const f = form(signal(new Date()), {injector: TestBed.inject(Injector)});
    // @ts-expect-error
    expect(f.getDate).toBe(undefined as any);
  });

  it('should allow spreading field arrays', () => {
    const f = form(signal([0, 1, 2]), {injector: TestBed.inject(Injector)});
    expect([...f].map((i) => i().value())).toEqual([0, 1, 2]);
  });

  it('should not allow mutation of the field structure', () => {
    const f = form(signal({arr: [0, 1]}), {injector: TestBed.inject(Injector)});
    // Just to have an expectation, really this test is just to check the typings below.
    expect(f).toBeDefined();
    // @ts-expect-error
    f.arr = f.arr;
    // @ts-expect-error
    f.arr[0] = f.arr[0];
  });

  it('should get keys and values for object field', () => {
    const f = form(signal({x: 1, y: 2}), {injector: TestBed.inject(Injector)});
    expect(Object.keys(f)).toEqual(['x', 'y']);
    expect(Object.getOwnPropertyNames(f)).toEqual(['x', 'y']);
    expect(Object.entries(f).map(([key, child]) => [key, child().value()])).toEqual([
      ['x', 1],
      ['y', 2],
    ]);
    expect(Object.values(f).map((child) => child().value())).toEqual([1, 2]);
  });

  it('should get keys and values for array field', () => {
    const f = form(signal([1, 2]), {injector: TestBed.inject(Injector)});
    expect(Object.keys(f)).toEqual(['0', '1']);
    expect(Object.getOwnPropertyNames(f)).toEqual(['0', '1', 'length']);
    expect(Object.entries(f).map(([key, child]) => [key, child().value()])).toEqual([
      ['0', 1],
      ['1', 2],
    ]);
    expect(Object.values(f).map((child) => child().value())).toEqual([1, 2]);
  });

  it('should get keys and values for primitive field', () => {
    const f = form(signal(1), {injector: TestBed.inject(Injector)});
    expect(Object.keys(f)).toEqual([]);
    expect(Object.getOwnPropertyNames(f)).toEqual([]);
    expect(Object.entries(f)).toEqual([]);
    expect(Object.values(f)).toEqual([]);
  });

  it('should iterate over object field', () => {
    const f = form(signal({x: 1, y: 2}), {injector: TestBed.inject(Injector)});
    const result: [string, number][] = [];
    for (const [key, child] of f) {
      result.push([key, child().value()]);
    }
    expect(result).toEqual([
      ['x', 1],
      ['y', 2],
    ]);
  });

  it('should iterate over array field', () => {
    const f = form(signal([1, 2]), {injector: TestBed.inject(Injector)});
    const result: number[] = [];
    for (const child of f) {
      result.push(child().value());
    }
    expect(result).toEqual([1, 2]);
  });

  it('should not iterate over primitive field', () => {
    const f = form(signal(1), {injector: TestBed.inject(Injector)});
    expect(() => {
      // @ts-expect-error - not iterable
      for (const child of f) {
      }
    }).toThrow();
  });
});
