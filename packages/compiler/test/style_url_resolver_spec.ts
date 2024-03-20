/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isStyleUrlResolvable} from '@angular/compiler/src/style_url_resolver';

describe('isStyleUrlResolvable', () => {
  it('should resolve relative urls', () => {
    expect(isStyleUrlResolvable('someUrl.css')).toBe(true);
  });

  it('should resolve package: urls', () => {
    expect(isStyleUrlResolvable('package:someUrl.css')).toBe(true);
  });

  it('should not resolve empty urls', () => {
    expect(isStyleUrlResolvable(null)).toBe(false);
    expect(isStyleUrlResolvable('')).toBe(false);
  });

  it('should not resolve urls with other schema', () => {
    expect(isStyleUrlResolvable('http://otherurl')).toBe(false);
  });

  it('should not resolve urls with absolute paths', () => {
    expect(isStyleUrlResolvable('/otherurl')).toBe(false);
    expect(isStyleUrlResolvable('//otherurl')).toBe(false);
  });
});
