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
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {runfiles} from '@bazel/runfiles';
import shx from 'shelljs';

describe('document-core migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematic('document-core', {}, tree);
  }

  beforeEach(() => {
    runner = new SchematicTestRunner('test', runfiles.resolvePackageRelative('../migrations.json'));
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

  it('should migrate an import of DOCUMENT', async () => {
    writeFile(
      '/dir.ts',
      `
        import { Directive, inject } from '@angular/core';
        import { DOCUMENT } from '@angular/common';

        @Directive()
        export class Dir {
          protected doc = inject(DOCUMENT);
        }
      `,
    );

    await runMigration();
    const content = tree.readContent('/dir.ts');
    expect(content).toContain(`import { Directive, inject, DOCUMENT } from '@angular/core';`);
    expect(content).not.toContain(`@angular/common`);
  });

  it('should migrate an aliased import of DOCUMENT', async () => {
    writeFile(
      '/dir.ts',
      `
        import { Directive, inject } from '@angular/core';
        import { DOCUMENT as MY_DOC } from '@angular/common';

        @Directive()
        export class Dir {
          protected doc = inject(MY_DOC);
        }
      `,
    );

    await runMigration();
    const content = tree.readContent('/dir.ts');
    expect(content).toContain(
      `import { Directive, inject, DOCUMENT as MY_DOC } from '@angular/core';`,
    );
    expect(content).not.toContain(`@angular/common`);
  });

  it('should migrate a file that does not import @angular/core', async () => {
    writeFile(
      '/dir.ts',
      `
        import { DOCUMENT } from '@angular/common';

        console.log(DOCUMENT);
      `,
    );

    await runMigration();
    const content = tree.readContent('/dir.ts');
    expect(content).toContain(`import { DOCUMENT } from '@angular/core';`);
    expect(content).not.toContain(`@angular/common`);
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
      'dir.ts',
      `
        import { Directive, inject } from '@angular/core';
        import { DOCUMENT } from '@angular/common';

        @Directive()
        export class Dir {
          protected doc = inject(DOCUMENT);
        }
      `,
    );

    await runMigration();
    const content = tree.readContent('/dir.ts');
    expect(content).toContain(`import { Directive, inject, DOCUMENT } from '@angular/core';`);
    expect(content).not.toContain(`@angular/common`);
  });
});
