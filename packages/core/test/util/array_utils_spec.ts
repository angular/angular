/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {flatten} from '../../src/util/array_utils';

describe('flatten', () => {

  it('should flatten an empty array', () => { expect(flatten([])).toEqual([]); });

  it('should flatten a flat array', () => { expect(flatten([1, 2, 3])).toEqual([1, 2, 3]); });

  it('should flatten a nested array depth-first', () => {
    expect(flatten([1, [2], 3])).toEqual([1, 2, 3]);
    expect(flatten([[1], 2, [3]])).toEqual([1, 2, 3]);
    expect(flatten([1, [2, [3]], 4])).toEqual([1, 2, 3, 4]);
    expect(flatten([1, [2, [3]], [4]])).toEqual([1, 2, 3, 4]);
    expect(flatten([1, [2, [3]], [[[4]]]])).toEqual([1, 2, 3, 4]);
    expect(flatten([1, [], 2])).toEqual([1, 2]);
  });
});