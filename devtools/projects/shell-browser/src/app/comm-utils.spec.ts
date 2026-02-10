/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {stripUrlQueryParamsAndFragment} from './comm-utils';

describe('Communication utils', () => {
  describe('stripUrlQueryParamsAndFragment', () => {
    it('should return the URL', () => {
      const url = stripUrlQueryParamsAndFragment('https://example.com');
      expect(url).toEqual('https://example.com');
    });

    it('should strip the URL from its query parameters', () => {
      const url = stripUrlQueryParamsAndFragment('https://example.com?foo=bar&baz=314');
      expect(url).toEqual('https://example.com');
    });

    it('should strip the URL from its fragment', () => {
      const url = stripUrlQueryParamsAndFragment('https://example.com#main-heading');
      expect(url).toEqual('https://example.com');
    });

    it('should strip the URL from both its query params and fragment', () => {
      const url = stripUrlQueryParamsAndFragment('https://example.com?foo=bar#main-heading');
      expect(url).toEqual('https://example.com');
    });
  });
});
