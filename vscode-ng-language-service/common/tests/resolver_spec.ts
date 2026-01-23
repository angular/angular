/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Version} from '../resolver';

describe('Version', () => {
  it('should parse version string correctly', () => {
    const cases: Array<[string, number, number, number]> = [
      // version string | major | minor | patch
      ['1', 1, 0, 0],
      ['1.2', 1, 2, 0],
      ['1.2.3', 1, 2, 3],
      ['9.0.0-rc.1+126.sha-0c38aae.with-local-changes', 9, 0, 0],
    ];
    for (const [versionStr, major, minor, patch] of cases) {
      const v = new Version(versionStr);
      expect(v.major).toBe(major);
      expect(v.minor).toBe(minor);
      expect(v.patch).toBe(patch);
    }
  });

  it('should compare versions correctly', () => {
    const cases: Array<[string, string, boolean]> = [
      // lhs | rhs | result
      ['1', '1', true],
      ['1', '2', false],
      ['2', '2.0', true],
      ['2', '2.1', false],
      ['2', '2.0.0', true],
      ['2', '2.0.1', false],

      ['1.2', '1', true],
      ['1.2', '2', false],
      ['2.2', '2.1', true],
      ['2.2', '2.7', false],
      ['3.2', '3.2.0', true],
      ['3.2', '3.2.1', false],

      ['1.2.3', '1', true],
      ['1.2.3', '2', false],
      ['2.2.3', '2.1', true],
      ['2.2.3', '2.3', false],
      ['3.2.3', '3.2.2', true],
      ['3.2.3', '3.2.4', false],
    ];
    for (const [s1, s2, result] of cases) {
      const v1 = new Version(s1);
      const v2 = new Version(s2);
      expect(v1.greaterThanOrEqual(v2)).toBe(result, `Expect ${v1} >= ${v2}`);
    }
  });
});
