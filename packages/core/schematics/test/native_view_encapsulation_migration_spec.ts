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

describe('ViewEncapsulation.Native migration', () => {
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

  it('should change Native view encapsulation usages to ShadowDom', async () => {
    writeFile('/index.ts', `
      import {Component, ViewEncapsulation} from '@angular/core';

      @Component({
        template: 'hello',
        encapsulation: ViewEncapsulation.Native
      })
      class App {}
    `);

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain('encapsulation: ViewEncapsulation.ShadowDom');
  });

  it('should change Native view encapsulation usages if the enum is aliased', async () => {
    writeFile('/index.ts', `
      import {Component, ViewEncapsulation as Encapsulation} from '@angular/core';

      @Component({
        template: 'hello',
        encapsulation: Encapsulation.Native
      })
      class App {}
    `);

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain('encapsulation: Encapsulation.ShadowDom');
  });

  it('should change Native view encapsulation usages inside a variable', async () => {
    writeFile('/index.ts', `
      import {Component, ViewEncapsulation} from '@angular/core';

      const encapsulation = ViewEncapsulation.Native;

      @Component({template: 'hello', encapsulation})
      class App {}

      @Component({template: 'click me', encapsulation})
      class Button {}
    `);

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain('const encapsulation = ViewEncapsulation.ShadowDom;');
  });

  it('should not change components that do not set an encapsulation', async () => {
    const source = `
      import {Component} from '@angular/core';

      @Component({
        template: 'hello'
      })
      class App {}
    `;

    writeFile('/index.ts', source);

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toBe(source);
  });

  it('should not change components that use an encapsulation different from Native', async () => {
    const source = `
      import {Component, ViewEncapsulation} from '@angular/core';

      @Component({
        template: 'hello',
        encapsulation: ViewEncapsulation.None
      })
      class App {}
    `;

    writeFile('/index.ts', source);

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toBe(source);
  });

  it('should not change cases where ViewEncapsulation does not come from @angular/core',
     async () => {
       const source = `
        import {Component} from '@angular/core';
        import {ViewEncapsulation} from '@not-angular/core';

        @Component({
          template: 'hello',
          encapsulation: ViewEncapsulation.Native
        })
        class App {}
      `;

       writeFile('/index.ts', source);

       await runMigration();

       const content = tree.readContent('/index.ts');
       expect(content).toBe(source);
     });

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematicAsync('migration-v11-native-view-encapsulation', {}, tree)
        .toPromise();
  }
});
