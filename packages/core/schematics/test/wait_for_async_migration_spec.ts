/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getSystemPath, normalize, virtualFs} from '@angular-devkit/core';
import {TempScopedNodeJsSyncHost} from '@angular-devkit/core/node/testing';
import {HostTree} from '@angular-devkit/schematics';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import * as shx from 'shelljs';

describe('waitForAsync migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;

  beforeEach(() => {
    runner = new SchematicTestRunner('test', require.resolve('../migrations.json'));
    host = new TempScopedNodeJsSyncHost();
    tree = new UnitTestTree(new HostTree(host));

    writeFile('/tsconfig.json', JSON.stringify({
      compilerOptions: {
        lib: ['es2015'],
        strictNullChecks: true,
      },
    }));
    writeFile('/angular.json', JSON.stringify({
      projects: {t: {architect: {build: {options: {tsConfig: './tsconfig.json'}}}}}
    }));
    // We need to declare the Angular symbols we're testing for, otherwise type checking won't work.
    writeFile('/node_modules/@angular/core/testing/index.d.ts', `
      export declare function async(fn: Function): any;
    `);

    previousWorkingDir = shx.pwd();
    tmpDirPath = getSystemPath(host.root);

    // Switch into the temporary directory path. This allows us to run
    // the schematic against our custom unit test tree.
    shx.cd(tmpDirPath);
  });

  afterEach(() => {
    shx.cd(previousWorkingDir);
    shx.rm('-r', tmpDirPath);
  });

  it('should change async imports to waitForAsync', async () => {
    writeFile('/index.ts', `
      import { async, inject } from '@angular/core/testing';

      it('should work', async(() => {
        expect(inject('foo')).toBe('foo');
      }));
    `);

    await runMigration();
    expect(tree.readContent('/index.ts'))
        .toContain(`import { inject, waitForAsync } from '@angular/core/testing';`);
  });

  it('should change aliased async imports to waitForAsync', async () => {
    writeFile('/index.ts', `
      import { async as renamedAsync, inject } from '@angular/core/testing';

      it('should work', renamedAsync(() => {
        expect(inject('foo')).toBe('foo');
      }));
    `);

    await runMigration();
    expect(tree.readContent('/index.ts'))
        .toContain(`import { inject, waitForAsync as renamedAsync } from '@angular/core/testing';`);
  });

  it('should not change async imports if they are not from @angular/core/testing', async () => {
    writeFile('/index.ts', `
      import { inject } from '@angular/core/testing';
      import { async } from './my-test-library';

      it('should work', async(() => {
        expect(inject('foo')).toBe('foo');
      }));
    `);

    await runMigration();
    const content = tree.readContent('/index.ts');
    expect(content).toContain(`import { inject } from '@angular/core/testing';`);
    expect(content).toContain(`import { async } from './my-test-library';`);
  });

  it('should not change imports if waitForAsync was already imported', async () => {
    writeFile('/index.ts', `
      import { async, inject, waitForAsync } from '@angular/core/testing';

      it('should work', async(() => {
        expect(inject('foo')).toBe('foo');
      }));

      it('should also work', waitForAsync(() => {
        expect(inject('bar')).toBe('bar');
      }));
    `);

    await runMigration();
    expect(tree.readContent('/index.ts'))
        .toContain(`import { async, inject, waitForAsync } from '@angular/core/testing';`);
  });

  it('should change calls from `async` to `waitForAsync`', async () => {
    writeFile('/index.ts', `
      import { async, inject } from '@angular/core/testing';

      it('should work', async(() => {
        expect(inject('foo')).toBe('foo');
      }));

      it('should also work', async(() => {
        expect(inject('bar')).toBe('bar');
      }));
    `);

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain(`import { inject, waitForAsync } from '@angular/core/testing';`);
    expect(content).toContain(`it('should work', waitForAsync(() => {`);
    expect(content).toContain(`it('should also work', waitForAsync(() => {`);
  });

  it('should not change aliased calls', async () => {
    writeFile('/index.ts', `
      import { async as renamedAsync, inject } from '@angular/core/testing';

      it('should work', renamedAsync(() => {
        expect(inject('foo')).toBe('foo');
      }));
    `);

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain(
        `import { inject, waitForAsync as renamedAsync } from '@angular/core/testing';`);
    expect(content).toContain(`it('should work', renamedAsync(() => {`);
  });

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematicAsync('migration-v11-wait-for-async', {}, tree).toPromise();
  }
});
