/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {generateNavItems} from '../nav-items-gen.mjs';
import {NavigationItemGenerationStrategy} from '../types.mjs';
import fs from 'fs';
import readline from 'readline';

const readlineInterfaceMock = {
  close: () => {},
  async *[Symbol.asyncIterator]() {
    yield '<!-- Comment -->';
    yield 'Some random text';
    yield '## Heading';
    yield 'Some text';
  },
};

describe('generateNavItems', () => {
  it('should test the default case', async () => {
    spyOn(fs, 'createReadStream').and.returnValue({destroy: () => null} as any);
    spyOn(readline, 'createInterface').and.returnValue(readlineInterfaceMock as any);

    const strategy: NavigationItemGenerationStrategy = {
      pathPrefix: 'page',
      contentPath: 'content/directory',
      labelGeneratorFn: (fileName, firstLine) => fileName + ' // ' + firstLine,
    };

    const navItems = await generateNavItems(['directory/home.md', 'directory/about.md'], strategy);

    expect(navItems).toEqual([
      {
        label: 'home // Heading',
        path: 'page/home',
        contentPath: 'content/directory/home',
      },
      {
        label: 'about // Heading',
        path: 'page/about',
        contentPath: 'content/directory/about',
      },
    ]);
  });
});
