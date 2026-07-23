/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {RelativeLink} from './relative-link.pipe';

describe('RelativeLink', () => {
  let pipe: RelativeLink;

  beforeEach(() => {
    pipe = new RelativeLink();
  });

  it('should transform absolute url to relative', () => {
    const absoluteUrl = 'https://angular.dev/guide/directives#test';

    const result = pipe.transform(absoluteUrl);

    expect(result).toBe('guide/directives#test');
  });

  it('should return fragment once result param is equal to `hash`', () => {
    const absoluteUrl = 'https://angular.dev/guide/directives#test';

    const result = pipe.transform(absoluteUrl, 'hash');

    expect(result).toBe('test');
  });

  it('should return relative url without fragment once result param is equal to `pathname`', () => {
    const absoluteUrl = 'https://angular.dev/guide/directives#test';

    const result = pipe.transform(absoluteUrl, 'pathname');

    expect(result).toBe('guide/directives');
  });
});
