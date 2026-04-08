/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {absoluteFrom} from '@angular/compiler-cli';
import {initMockFileSystem} from '@angular/compiler-cli/private/testing';
import {runTsurgeMigration} from '../../utils/tsurge/testing';
import {IncrementalHydrationMigration} from './migration';

describe('IncrementalHydration migration', () => {
  beforeEach(() => {
    initMockFileSystem('Native');
  });

  it('should not change anything if withIncrementalHydration() is present', async () => {
    const {fs} = await runTsurgeMigration(new IncrementalHydrationMigration(), [
      {
        name: absoluteFrom('/index.ts'),
        isProgramRootFile: true,
        contents: `
          import { provideClientHydration, withIncrementalHydration } from '@angular/platform-browser';

          provideClientHydration(withIncrementalHydration());
        `,
      },
    ]);

    const content = fs.readFile(absoluteFrom('/index.ts'));
    expect(content).not.toContain('withNoIncrementalHydration()');
    expect(content).toContain('withIncrementalHydration()');
    expect(content).toContain('provideClientHydration()');
  });

  it('should add withNoIncrementalHydration() if withIncrementalHydration is absent', async () => {
    const {fs} = await runTsurgeMigration(new IncrementalHydrationMigration(), [
      {
        name: absoluteFrom('/index.ts'),
        isProgramRootFile: true,
        contents: `
          import { provideClientHydration } from '@angular/platform-browser';

          provideClientHydration();
        `,
      },
    ]);

    const content = fs.readFile(absoluteFrom('/index.ts'));
    expect(content).toContain('withNoIncrementalHydration()');
  });
});
