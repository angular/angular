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

describe('dynamic queries migration', () => {
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
      }
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

  it('should remove the options object from a dynamic ViewChild query that only has one property',
     async () => {
       writeFile('/index.ts', `
        import { Directive, ViewChild } from '@angular/core';

        @Directive()
        export class MyDirective {
          @ViewChild('child', { static: false }) child: any;
        }
      `);

       await runMigration();
       expect(tree.readContent('/index.ts')).toContain(`@ViewChild('child') child: any;`);
     });

  it('should remove the options object from a dynamic ContentChild query that only has one property',
     async () => {
       writeFile('/index.ts', `
        import { Directive, ContentChild } from '@angular/core';

        @Directive()
        export class MyComponent {
          @ContentChild('child', { static: false }) child: any;
        }
      `);

       await runMigration();
       expect(tree.readContent('/index.ts')).toContain(`@ContentChild('child') child: any;`);
     });

  it('should only remove the `static` flag from a ViewChild query if it has more than one property',
     async () => {
       writeFile('/index.ts', `
        import { Directive, ViewChild, ElementRef } from '@angular/core';

        @Directive()
        export class MyDirective {
          @ViewChild('child', { read: ElementRef, static: false }) child: ElementRef;
        }
      `);

       await runMigration();
       expect(tree.readContent('/index.ts'))
           .toContain(`@ViewChild('child', { read: ElementRef }) child: ElementRef;`);
     });

  it('should only remove the `static` flag from a ContentChild query if it has more than one property',
     async () => {
       writeFile('/index.ts', `
        import { Directive, ContentChild, ElementRef } from '@angular/core';

        @Directive()
        export class MyDirective {
          @ContentChild('child', { static: false, read: ElementRef }) child: ElementRef;
        }
      `);

       await runMigration();
       expect(tree.readContent('/index.ts'))
           .toContain(`@ContentChild('child', { read: ElementRef }) child: ElementRef;`);
     });

  it('should not change static ViewChild queries', async () => {
    writeFile('/index.ts', `
      import { Directive, ViewChild, ElementRef } from '@angular/core';

      @Directive()
      export class MyDirective {
        @ViewChild('child', { read: ElementRef, static: true }) child: ElementRef;
      }
    `);

    await runMigration();
    expect(tree.readContent('/index.ts'))
        .toContain(`@ViewChild('child', { read: ElementRef, static: true }) child: ElementRef;`);
  });

  it('should not change static ContentChild queries', async () => {
    writeFile('/index.ts', `
      import { Directive, ContentChild, ElementRef } from '@angular/core';

      @Directive()
      export class MyDirective {
        @ContentChild('child', { static: true, read: ElementRef }) child: ElementRef;
      }
    `);

    await runMigration();
    expect(tree.readContent('/index.ts'))
        .toContain(`@ContentChild('child', { static: true, read: ElementRef }) child: ElementRef;`);
  });

  it('should migrate dynamic queries on a setter', async () => {
    writeFile('/index.ts', `
     import { Directive, ContentChild, ViewChild } from '@angular/core';

     @Directive()
     export class MyDirective {
       @ContentChild('child', { static: false }) set child(c: any) {}
       @ViewChild('otherChild', { static: false }) set otherChild(c: any) {}
     }
   `);

    await runMigration();
    const content = tree.readContent('/index.ts');
    expect(content).toContain(`@ContentChild('child') set child(c: any) {}`);
    expect(content).toContain(`@ViewChild('otherChild') set otherChild(c: any) {}`);
  });

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematicAsync('migration-v9-dynamic-queries', {}, tree).toPromise();
  }
});
