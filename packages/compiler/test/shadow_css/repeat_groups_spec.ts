/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {repeatGroups} from '../../src/shadow_css';

describe('ShadowCss, repeatGroups()', () => {
  it('should do nothing if `multiples` is 0', () => {
    const groups = [
      ['a1', 'b1', 'c1'],
      ['a2', 'b2', 'c2'],
    ];
    repeatGroups(groups, 0);
    expect(groups).toEqual([
      ['a1', 'b1', 'c1'],
      ['a2', 'b2', 'c2'],
    ]);
  });

  it('should do nothing if `multiples` is 1', () => {
    const groups = [
      ['a1', 'b1', 'c1'],
      ['a2', 'b2', 'c2'],
    ];
    repeatGroups(groups, 1);
    expect(groups).toEqual([
      ['a1', 'b1', 'c1'],
      ['a2', 'b2', 'c2'],
    ]);
  });

  it('should add clones of the original groups if `multiples` is greater than 1', () => {
    const group1 = ['a1', 'b1', 'c1'];
    const group2 = ['a2', 'b2', 'c2'];
    const groups = [group1, group2];
    repeatGroups(groups, 3);
    expect(groups).toEqual([group1, group2, group1, group2, group1, group2]);
    expect(groups[0]).toBe(group1);
    expect(groups[1]).toBe(group2);
    expect(groups[2]).not.toBe(group1);
    expect(groups[3]).not.toBe(group2);
    expect(groups[4]).not.toBe(group1);
    expect(groups[5]).not.toBe(group2);
  });
});
