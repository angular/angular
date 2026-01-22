/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DefaultIterableDiffer} from '@angular/core';
import {diff} from './index';

interface TestItem {
  name: string;
  value: number;
}

describe('diff', () => {
  const trackBy = (_: number, item: TestItem) => `#${item.name}`;
  const differ = new DefaultIterableDiffer<TestItem>(trackBy);

  let host: TestItem[] = [];
  let hostCopy: TestItem[] = [];

  beforeEach(() => {
    host = [
      {name: 'foo', value: 1},
      {name: 'bar', value: 2},
      {name: 'baz', value: 3},
    ];
    hostCopy = structuredClone(host);
  });

  it('should remove all items from the host if the new array is empty', () => {
    const output = diff(differ, host, []);

    expect(output).toEqual({
      newItems: [],
      removedItems: [hostCopy[0], hostCopy[1], hostCopy[2]],
      movedItems: [],
      updatedItems: [],
    });
    expect(host).toEqual([]);
  });

  it('should add all items to the host if the host is empty', () => {
    host = [];
    const newArr = [{name: 'qux', value: 4}];
    const output = diff(differ, host, newArr);

    expect(output).toEqual({
      newItems: [newArr[0]],
      removedItems: [],
      movedItems: [],
      updatedItems: [],
    });
    expect(host).toEqual(newArr);
  });

  it('should add a new item', () => {
    const newArr = [host[0], host[1], {name: 'qux', value: 2.5}, host[2]];
    const output = diff(differ, host, newArr);

    expect(output).toEqual({
      newItems: [newArr[2]],
      removedItems: [],
      movedItems: [newArr[3]],
      updatedItems: [],
    });
    expect(host).toEqual(newArr);
  });

  it('should add remove an item', () => {
    const newArr = [host[0], host[2]];
    const output = diff(differ, host, newArr);

    expect(output).toEqual({
      newItems: [],
      removedItems: [hostCopy[1]],
      movedItems: [newArr[1]],
      updatedItems: [],
    });
    expect(host).toEqual(newArr);
  });

  it('should add remove an item', () => {
    // Note that an item will be marked as
    // updated only if its reference changes.
    const newArr = [
      host[0], // Same ref
      hostCopy[1],
      {
        name: 'baz',
        value: 4,
      },
    ];
    const output = diff(differ, host, newArr);

    expect(output).toEqual({
      newItems: [],
      removedItems: [],
      movedItems: [],
      updatedItems: [hostCopy[1], {name: 'baz', value: 4}],
    });
    expect(host).toEqual(newArr);
  });
});
