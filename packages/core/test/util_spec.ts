/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {stringify} from '../src/util';

export function main() {
  describe('stringify', () => {
    it('should return string undefined when toString returns undefined',
       () => expect(stringify({toString: (): any => undefined})).toBe('undefined'));

    it('should return string null when toString returns null',
       () => expect(stringify({toString: (): any => null})).toBe('null'));
  });
}
