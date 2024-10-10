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

describe('self closing tag migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration(opts?: {path?: string}) {
    const path = opts?.path || './';
    return runner.runSchematic('self-closing-tag', {path}, tree);
  }

  function stripWhitespace(content: string) {
    return content.replace(/\s+/g, '');
  }

  beforeEach(() => {
    runner = new SchematicTestRunner('test', runfiles.resolvePackageRelative('../collection.json'));
    host = new TempScopedNodeJsSyncHost();
    tree = new UnitTestTree(new HostTree(host));

    writeFile('/tsconfig.json', '{}');

    writeFile(
      '/angular.json',
      JSON.stringify({
        version: 1,
        projects: {t: {root: '', architect: {build: {options: {tsConfig: './tsconfig.json'}}}}},
      }),
    );

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

  it('should throw an error if a path outside of the project is passed in', async () => {
    let error: string | null = null;

    writeFile('dir.ts', `const hello = 'world';`);

    try {
      await runMigration({path: '../foo'});
    } catch (e: any) {
      error = e.message;
    }

    expect(error).toBe('Cannot run self closing tag migration outside of the current project.');
  });

  it('should throw an error if the passed in path is a file', async () => {
    let error: string | null = null;

    writeFile('dir.ts', '');

    try {
      await runMigration({path: './dir.ts'});
    } catch (e: any) {
      error = e.message;
    }

    expect(error).toMatch(
      /Migration path .*\/dir\.ts has to be a directory\. Cannot run the self closing tag migration/,
    );
  });

  it('should not migrate index.html file', async () => {
    writeFile('index.html', `<app-root></app-root>`);
    await runMigration();
    expect(stripWhitespace(tree.readContent('index.html'))).toEqual(
      stripWhitespace(`<app-root></app-root>`),
    );
  });

  it('should skip dom elements', async () => {
    writeFile(
      'app.component.ts',
      `
      import {Component} from '@angular/core';
      @Component({ template: '<div></div>' })
      export class AppComponent {}
    `,
    );

    await runMigration();

    expect(stripWhitespace(tree.readContent('app.component.ts'))).toEqual(
      stripWhitespace(
        `
      import {Component} from '@angular/core';
      @Component({ template: '<div></div>' })
      export class AppComponent {}
      `,
      ),
    );
  });

  it('should migrate a component inline template correctly', async () => {
    writeFile(
      'app.component.ts',
      `
      import {Component} from '@angular/core';
      @Component({ template: '<my-cmp></my-cmp>' })
      export class AppComponent {}
      `,
    );

    await runMigration();

    expect(tree.readContent('app.component.ts')).toEqual(
      `
      import {Component} from '@angular/core';
      @Component({ template: '<my-cmp />' })
      export class AppComponent {}
      `,
    );
  });

  it('should migrate multiple components in a file correctly', async () => {
    writeFile(
      'app.component.ts',
      `
      import {Component} from '@angular/core';

      @Component({ template: '<my-cmp></my-cmp>' })
      export class Cmp1 {}

      @Component({ template: '<my-cmp></my-cmp><my-cmp></my-cmp>' })
      export class Cmp2 {}
      `,
    );

    await runMigration();

    expect(tree.readContent('app.component.ts')).toEqual(
      `
      import {Component} from '@angular/core';

      @Component({ template: '<my-cmp />' })
      export class Cmp1 {}

      @Component({ template: '<my-cmp /><my-cmp />' })
      export class Cmp2 {}
      `,
    );
  });

  it('should migrate a component html file correctly', async () => {
    writeFile(
      'src/app/app.component.ts',
      `
      import {Component} from '@angular/core';
      @Component({ templateUrl: 'app.component.html' })
      export class AppComponent {}
    `,
    );
    writeFile('src/app/app.component.html', `<my-cmp></my-cmp>`);

    await runMigration();

    expect(tree.readContent('src/app/app.component.html')).toEqual(`<my-cmp />`);
  });

  it('should migrate html with multiple nested elements', async () => {
    writeFile(
      'app.component.ts',
      `
    import {Component} from '@angular/core';
    @Component({ templateUrl: 'app.component.html' })
    export class AppComponent {}
    `,
    );
    writeFile(
      'app.component.html',
      `
      <div></div>
      <app-my-cmp1>   </app-my-cmp1>
      <app-my-cmp1>

      </app-my-cmp1>

      <app-my-cmp1 hello="world">
        <app-my-cmp1 hello="world">
        </app-my-cmp1>
      </app-my-cmp1>

      <app-my-cmp2 test="hello">123</app-my-cmp2>
      <app-my-cmp3
        test="hello">

      </app-my-cmp3>
      <app-my-cmp4
        test="hello"
      >
        123
      </app-my-cmp4>
      <app-my-cmp5
        test="hello"
      >
        123
      </app-my-cmp5>
      <app-my-cmp10 test="hello"
        [test]="hello"
        (test)="hello()"
      >
      </app-my-cmp10>

      <app-my-cmp11
        test="hello"
        [test]="hello"
        (test)="hello()"
      >
      </app-my-cmp11>
      <app-my-cmp12 test="hello"
      >

      </app-my-cmp12>
      <input type="text" />

      <app-my-cmp6 />
      <app-my-cmp7 test="hello" />

      <hello-world></hello-world>

      <pagination count="1" [test]="hello" (test)="test"></pagination>

      <pagination count="1" />

      <hello-world12>
        <hello-world13>
          <hello-world14 count="1" [test]="hello" (test)="test" ></hello-world14>
            <hello-world15>
              <hello-world16  count="1" [test]="hello" (test)="test"  />
              <hello-world17  count="1" [test]="hello" (test)="test" ></hello-world17>
              <hello-world18
               count="1" [test]="hello"
                (test)="test"
                >

              </hello-world18>
            </hello-world15>
        </hello-world13>
      </hello-world12>

      <app-management
        *ngIf="
          categoryList &&
          ((test1 && test1.length > 0) ||
          (test && test.length > 0))
        "
        [test]="test > 2"
        [test]="test"
        (testEvent)="test.length > 0 ? test($event) : null"
        (testEvent2)="test1($event)"></app-management>
      `,
    );

    await runMigration();

    expect(stripWhitespace(tree.readContent('app.component.html'))).toEqual(
      stripWhitespace(
        `
      <div></div>
      <app-my-cmp1 />
      <app-my-cmp1 />

      <app-my-cmp1 hello="world">
        <app-my-cmp1 hello="world" />
      </app-my-cmp1>

      <app-my-cmp2 test="hello">123</app-my-cmp2>
      <app-my-cmp3
        test="hello" />

      <app-my-cmp4
        test="hello"
      >
        123
      </app-my-cmp4>
      <app-my-cmp5
        test="hello"
      >
        123
      </app-my-cmp5>
      <app-my-cmp10 test="hello"
        [test]="hello"
        (test)="hello()"
      />

      <app-my-cmp11
        test="hello"
        [test]="hello"
        (test)="hello()"
      />
      <app-my-cmp12 test="hello"
      />

      <input type="text" />

      <app-my-cmp6 />
      <app-my-cmp7 test="hello" />

      <hello-world />

      <pagination count="1" [test]="hello" (test)="test" />

      <pagination count="1" />

      <hello-world12>
        <hello-world13>
          <hello-world14 count="1" [test]="hello" (test)="test" />
            <hello-world15>
              <hello-world16  count="1" [test]="hello" (test)="test"  />
              <hello-world17  count="1" [test]="hello" (test)="test" />
              <hello-world18
               count="1" [test]="hello"
                (test)="test"
                />

            </hello-world15>
        </hello-world13>
      </hello-world12>

      <app-management
        *ngIf="
          categoryList &&
          ((test1 && test1.length > 0) ||
          (test && test.length > 0))
        "
        [test]="test > 2"
        [test]="test"
        (testEvent)="test.length > 0 ? test($event) : null"
        (testEvent2)="test1($event)" />
      `,
      ),
    );
  });
});
