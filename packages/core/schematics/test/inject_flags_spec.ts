/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {getSystemPath, normalize, virtualFs} from '@angular-devkit/core';
import {TempScopedNodeJsSyncHost} from '@angular-devkit/core/node/testing';
import {HostTree} from '@angular-devkit/schematics';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing/index.js';
import {resolve} from 'node:path';
import shx from 'shelljs';

describe('inject-flags migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematic('inject-flags', {}, tree);
  }

  const migrationsJsonPath = resolve('../migrations.json');
  beforeEach(() => {
    runner = new SchematicTestRunner('test', migrationsJsonPath);
    host = new TempScopedNodeJsSyncHost();
    tree = new UnitTestTree(new HostTree(host));
    tmpDirPath = getSystemPath(host.root);

    writeFile('/tsconfig.json', '{}');
    writeFile(
      '/angular.json',
      JSON.stringify({
        version: 1,
        projects: {t: {root: '', architect: {build: {options: {tsConfig: './tsconfig.json'}}}}},
      }),
    );

    shx.cd(tmpDirPath);
  });

  it('should migrate a single InjectFlags usage', async () => {
    writeFile(
      '/test.ts',
      `
        import { inject, InjectFlags, Directive, ElementRef } from '@angular/core';

        @Directive()
        export class Dir {
          el = inject(ElementRef, InjectFlags.Optional);
        }
      `,
    );

    await runMigration();
    const content = tree.readContent('/test.ts');
    expect(content).toContain(`import { inject, Directive, ElementRef } from '@angular/core';`);
    expect(content).toContain(`el = inject(ElementRef, { optional: true });`);
  });

  it('should migrate multiple InjectFlags', async () => {
    writeFile(
      '/test.ts',
      `
        import { inject, InjectFlags, Directive, ElementRef } from '@angular/core';

        @Directive()
        export class Dir {
          el = inject(ElementRef, InjectFlags.Optional | InjectFlags.Host | InjectFlags.SkipSelf);
        }
      `,
    );

    await runMigration();
    const content = tree.readContent('/test.ts');
    expect(content).toContain(`import { inject, Directive, ElementRef } from '@angular/core';`);
    expect(content).toContain(
      `el = inject(ElementRef, { optional: true, host: true, skipSelf: true });`,
    );
  });

  it('should not generate a property for InjectFlags.Default', async () => {
    writeFile(
      '/test.ts',
      `
        import { inject, InjectFlags, Directive, ElementRef } from '@angular/core';

        @Directive()
        export class Dir {
          el = inject(ElementRef, InjectFlags.Default);
        }
      `,
    );

    await runMigration();
    const content = tree.readContent('/test.ts');
    expect(content).toContain(`import { inject, Directive, ElementRef } from '@angular/core';`);
    expect(content).toContain(`el = inject(ElementRef, {});`);
  });

  it('should migrate InjectFlags used in a variable', async () => {
    writeFile(
      '/test.ts',
      `
        import { inject, InjectFlags, Directive, ElementRef } from '@angular/core';

        const flags = InjectFlags.SkipSelf | InjectFlags.Optional;

        @Directive()
        export class Dir {
          el = inject(ElementRef, flags);
        }
      `,
    );

    await runMigration();
    const content = tree.readContent('/test.ts');
    expect(content).toContain(`import { inject, Directive, ElementRef } from '@angular/core';`);
    expect(content).toContain(`const flags = { skipSelf: true, optional: true };`);
  });

  it('should migrate InjectFlags used in a function initializer', async () => {
    writeFile(
      '/test.ts',
      `
        import { inject, InjectFlags, Directive, ElementRef } from '@angular/core';

        function injectEl(flags = InjectFlags.SkipSelf | InjectFlags.Optional) {
          return inject(ElementRef, flags);
        }

        @Directive()
        export class Dir {
          el = injectEl();
        }
      `,
    );

    await runMigration();
    const content = tree.readContent('/test.ts');
    expect(content).toContain(`import { inject, Directive, ElementRef } from '@angular/core';`);
    expect(content).toContain(`function injectEl(flags = { skipSelf: true, optional: true })`);
  });

  it('should remove InjectFlags import even if InjectFlags is not used', async () => {
    writeFile(
      '/test.ts',
      `
        import { inject, InjectFlags, Directive, ElementRef } from '@angular/core';

        @Directive()
        export class Dir {}
      `,
    );

    await runMigration();
    const content = tree.readContent('/test.ts');
    expect(content).not.toContain('InjectFlags');
  });

  it('should migrate InjectFlags within a parenthesized expression', async () => {
    writeFile(
      '/test.ts',
      `
        import { inject, InjectFlags, Directive, ElementRef } from '@angular/core';

        @Directive()
        export class Dir {
          el = inject(ElementRef, ((InjectFlags.Optional) | InjectFlags.SkipSelf));
        }
      `,
    );

    await runMigration();
    const content = tree.readContent('/test.ts');
    expect(content).toContain(`import { inject, Directive, ElementRef } from '@angular/core';`);
    expect(content).toContain(`el = inject(ElementRef, { optional: true, skipSelf: true });`);
  });

  it('should handle a file that is present in multiple projects', async () => {
    writeFile('/tsconfig-2.json', '{}');
    writeFile(
      '/angular.json',
      JSON.stringify({
        version: 1,
        projects: {
          a: {root: '', architect: {build: {options: {tsConfig: './tsconfig.json'}}}},
          b: {root: '', architect: {build: {options: {tsConfig: './tsconfig-2.json'}}}},
        },
      }),
    );

    writeFile(
      'test.ts',
      `
        import { inject, InjectFlags, Directive, ElementRef } from '@angular/core';

        @Directive()
        export class Dir {
          el = inject(ElementRef, InjectFlags.Optional | InjectFlags.SkipSelf);
        }
      `,
    );

    await runMigration();
    const content = tree.readContent('/test.ts');
    expect(content).toContain(`import { inject, Directive, ElementRef } from '@angular/core';`);
    expect(content).toContain(`el = inject(ElementRef, { optional: true, skipSelf: true });`);
  });

  it('should handle aliased InjectFlags', async () => {
    writeFile(
      '/test.ts',
      `
        import { inject, InjectFlags as Foo, Directive, ElementRef } from '@angular/core';

        @Directive()
        export class Dir {
          el = inject(ElementRef, Foo.Optional | Foo.Host | Foo.SkipSelf);
        }
      `,
    );

    await runMigration();
    const content = tree.readContent('/test.ts');
    expect(content).toContain(`import { inject, Directive, ElementRef } from '@angular/core';`);
    expect(content).toContain(
      `el = inject(ElementRef, { optional: true, host: true, skipSelf: true });`,
    );
  });
});
