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
import {CanMatchSnapshotRequiredMigration} from './migration';

describe('CanMatchSnapshotRequired migration (Type-Based)', () => {
  beforeEach(() => {
    initMockFileSystem('Native');
  });

  it('should add the third argument to canMatch calls in classes implementing CanMatch', async () => {
    const {fs} = await runTsurgeMigration(new CanMatchSnapshotRequiredMigration(), [
      {
        name: absoluteFrom('/index.ts'),
        isProgramRootFile: true,
        contents: `
          interface CanMatch {}
          class MyGuard implements CanMatch {
            canMatch(route: any, segments: any) {}
          }
          const guard = new MyGuard();
          guard.canMatch({}, []);
        `,
      },
    ]);

    const content = fs.readFile(absoluteFrom('/index.ts'));
    expect(content).toContain('guard.canMatch({}, [], {} as any /* added by migration */)');
  });

  it('should NOT add argument if the class does NOT implement CanMatch', async () => {
    const {fs} = await runTsurgeMigration(new CanMatchSnapshotRequiredMigration(), [
      {
        name: absoluteFrom('/index.ts'),
        isProgramRootFile: true,
        contents: `
          class MyGuard {
            canMatch(route: any, segments: any) {}
          }
          const guard = new MyGuard();
          guard.canMatch({}, []);
        `,
      },
    ]);

    const content = fs.readFile(absoluteFrom('/index.ts'));
    expect(content).not.toContain('{} as any /* added by migration */');
  });

  it('should add the third argument to canMatch calls for functions typed as CanMatchFn', async () => {
    const {fs} = await runTsurgeMigration(new CanMatchSnapshotRequiredMigration(), [
      {
        name: absoluteFrom('/index.ts'),
        isProgramRootFile: true,
        contents: `
          type CanMatchFn = (route: any, segments: any) => boolean;
          const canMatch: CanMatchFn = (route, segments) => true;
          canMatch({}, []);
        `,
      },
    ]);

    const content = fs.readFile(absoluteFrom('/index.ts'));
    expect(content).toContain('canMatch({}, [], {} as any /* added by migration */)');
  });

  it('should NOT add argument if the function is NOT typed as CanMatchFn', async () => {
    const {fs} = await runTsurgeMigration(new CanMatchSnapshotRequiredMigration(), [
      {
        name: absoluteFrom('/index.ts'),
        isProgramRootFile: true,
        contents: `
          function canMatch(route: any, segments: any) { return true; }
          canMatch({}, []);
        `,
      },
    ]);

    const content = fs.readFile(absoluteFrom('/index.ts'));
    expect(content).not.toContain('{} as any /* added by migration */');
  });
});
