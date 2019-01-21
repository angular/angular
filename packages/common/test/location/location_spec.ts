/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Location} from '@angular/common';

const baseUrl = '/base';

describe('Location Class', () => {
  describe('stripTrailingSlash', () => {
    it('should strip single character slash', () => {
      const input = '/';
      expect(Location.stripTrailingSlash(input)).toBe('');
    });

    it('should normalize strip a trailing slash', () => {
      const input = baseUrl + '/';
      expect(Location.stripTrailingSlash(input)).toBe(baseUrl);
    });

    it('should ignore query params when stripping a slash', () => {
      const input = baseUrl + '/?param=1';
      expect(Location.stripTrailingSlash(input)).toBe(baseUrl + '?param=1');
    });

    it('should not remove slashes inside query params', () => {
      const input = baseUrl + '?test/?=3';
      expect(Location.stripTrailingSlash(input)).toBe(input);
    });

    it('should not remove slashes after a pound sign', () => {
      const input = baseUrl + '#test/?=3';
      expect(Location.stripTrailingSlash(input)).toBe(input);
    });
  });
});