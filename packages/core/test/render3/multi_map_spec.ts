/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {UniqueValueMultiKeyMap} from '../../src/render3/list_reconciliation';

describe('MultiMap', () => {
  it('should set, get and remove items with duplicated keys', () => {
    const map = new UniqueValueMultiKeyMap();

    map.set('k', 'v1');
    map.set('k', 'v2');

    expect(map.has('k')).toBeTrue();
    expect(map.get('k')).toBe('v1');

    map.delete('k');
    expect(map.has('k')).toBeTrue();
    expect(map.get('k')).toBe('v2');

    map.delete('k');
    expect(map.has('k')).toBeFalse();
  });

  it('should set, get and remove items without duplicated keys', () => {
    const map = new UniqueValueMultiKeyMap();

    map.set('k', 'v1');

    expect(map.has('k')).toBeTrue();
    expect(map.get('k')).toBe('v1');

    map.delete('k');
    expect(map.has('k')).toBeFalse();
  });

  it('should iterate with forEach', () => {
    const map = new UniqueValueMultiKeyMap<string, string>();

    map.set('km', 'v1');
    map.set('km', 'v2');
    map.set('ks', 'v');

    const items: string[][] = [];

    map.forEach((v, k) => items.push([v, k]));
    expect(items).toEqual([
      ['v1', 'km'],
      ['v2', 'km'],
      ['v', 'ks'],
    ]);
  });

  it('should throw upon detecting duplicate values', () => {
    const map = new UniqueValueMultiKeyMap();

    map.set('k', 'v');
    expect(() => {
      map.set('k', 'v');
    }).toThrowError(/Detected a duplicated value v for the key k/);
  });
});
