/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {parseTimingExp} from '../../../src/render3/animations/util';

describe('animation utils', () => {
  describe('parseTimingExp', () => {
    it('should parse a duration value in s, ms and as a number', () => {
      expect(parseTimingExp('1.5s').duration).toEqual(1500);
      expect(parseTimingExp('1000ms').duration).toEqual(1000);
      expect(parseTimingExp(1000).duration).toEqual(1000);
    });

    it('should parse a delay value in s, ms and as a number', () => {
      expect(parseTimingExp('1s 2.5s').delay).toEqual(2500);
      expect(parseTimingExp('1000ms 250ms').delay).toEqual(250);
      expect(parseTimingExp(1000).delay).toEqual(0);
    });

    it('should parse an easing value from a timing expression', () => {
      expect(parseTimingExp('1s ease-out').easing).toEqual('ease-out');
      expect(parseTimingExp('1s 1000ms ease-in').easing).toEqual('ease-in');
      expect(parseTimingExp(1000).easing).toEqual(null);
    });
  });
});