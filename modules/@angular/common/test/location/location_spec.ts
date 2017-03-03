/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Location} from '../../src/location/location';

export function main() {
  describe('Location', () => {

    describe('stripTrailingSlash', () => {
      describe('should strip trailing slash when url contains', () => {
        it('no params', () => {
          expect(Location.stripTrailingSlash('/test')).toBe('/test');
          expect(Location.stripTrailingSlash('/test/')).toBe('/test');
        });
        it('query params',
           () => expect(Location.stripTrailingSlash('/test/?a=b')).toBe('/test?a=b'));
        it('matrix params',
           () => expect(Location.stripTrailingSlash('/test/;a=b')).toBe('/test;a=b'));
      });
    });

  });
}
