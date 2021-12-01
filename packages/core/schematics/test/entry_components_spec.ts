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


describe('entryComponents migration', () => {
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
      version: 1,
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

  it('should remove `entryComponents` usages from NgModule', async () => {
    writeFile('/index.ts', `
      import { NgModule, Component } from '@angular/core';

      @Component({selector: 'my-comp', template: ''})
      export class MyComp {}

      @NgModule({
        declarations: [MyComp],
        entryComponents: [MyComp],
        exports: [MyComp]
      })
      export class MyModule {}
    `);

    await runMigration();

    expect(stripWhitespace(tree.readContent('/index.ts'))).toContain(stripWhitespace(`
      @NgModule({
        declarations: [MyComp],
        exports: [MyComp]
      })
    `));
  });

  it('should remove `entryComponents` usages from Component', async () => {
    writeFile('/index.ts', `
      import { Component } from '@angular/core';

      @Component({selector: 'comp-a', template: ''})
      export class CompA {}

      @Component({
        selector: 'comp-b',
        entryComponents: [CompA],
        template: ''
      })
      export class CompB {}
    `);

    await runMigration();

    expect(stripWhitespace(tree.readContent('/index.ts'))).toContain(stripWhitespace(`
      @Component({
        selector: 'comp-b',
        template: ''
      })
    `));
  });

  it('should remove multiple `entryComponents` usages from a single file', async () => {
    writeFile('/index.ts', `
      import { NgModule, Component } from '@angular/core';

      @Component({selector: 'comp-a', template: ''})
      export class CompA {}

      @Component({
        selector: 'comp-b',
        entryComponents: [CompA],
        template: ''
      })
      export class CompB {}

      @NgModule({
        declarations: [CompA, CompB],
        entryComponents: [CompB],
        exports: [CompA, CompB]
      })
      export class MyModule {}
    `);

    await runMigration();

    const content = stripWhitespace(tree.readContent('/index.ts'));

    expect(content).toContain(stripWhitespace(`
      @Component({
        selector: 'comp-b',
        template: ''
      })
    `));

    expect(content).toContain(stripWhitespace(`
      @NgModule({
        declarations: [CompA, CompB],
        exports: [CompA, CompB]
      })
    `));
  });

  it('should not remove `entryComponents` usages from decorators that do not come from Angular',
     async () => {
       writeFile('/index.ts', `
        import { Component } from '@angular/core';
        import { NgModule } from '@not-angular/core';

        @Component({selector: 'my-comp', template: ''})
        export class MyComp {}

        @NgModule({
          declarations: [MyComp],
          entryComponents: [MyComp],
          exports: [MyComp]
        })
        export class MyModule {}
      `);

       await runMigration();

       expect(stripWhitespace(tree.readContent('/index.ts'))).toContain(stripWhitespace(`
          @NgModule({
            declarations: [MyComp],
            entryComponents: [MyComp],
            exports: [MyComp]
          })
        `));
     });

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematicAsync('migration-v13.1-entry-components', {}, tree).toPromise();
  }

  function stripWhitespace(contents: string) {
    return contents.replace(/\s/g, '');
  }
});
