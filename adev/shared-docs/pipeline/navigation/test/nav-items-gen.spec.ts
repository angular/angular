import {generateNavItems} from '../nav-items-gen';
import {NavigationItemGenerationStrategy} from '../types';
import fs from 'fs';
import readline from 'readline';

const readlineMock = {
  close: () => null,
  on: (_: string, lineFn: (line: string) => void) => {
    lineFn('Doc first line');
  },
};

describe('generateNavItems', () => {
  it('should test the default case', async () => {
    spyOn(fs, 'createReadStream').and.returnValue({destroy: () => null} as any);
    spyOn(readline, 'createInterface').and.returnValue(readlineMock as any);

    const strategy: NavigationItemGenerationStrategy = {
      pathPrefix: 'page',
      contentPath: 'content/directory',
      labelGeneratorFn: (fileName, firstLine) => fileName + ' // ' + firstLine,
    };

    const navItems = await generateNavItems(['directory/home.md', 'directory/about.md'], strategy);

    expect(navItems).toEqual([
      {
        label: 'home // Doc first line',
        path: 'page/home',
        contentPath: 'content/directory/home',
      },
      {
        label: 'about // Doc first line',
        path: 'page/about',
        contentPath: 'content/directory/about',
      },
    ]);
  });
});
