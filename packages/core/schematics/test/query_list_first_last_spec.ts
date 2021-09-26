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


describe('QueryList first and last access migration', () => {
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
    // We need to declare the Angular symbols we're testing for, otherwise type checking won't work.
    writeFile('/node_modules/@angular/core/index.d.ts', `
      export declare class QueryList<T> {
        readonly first?: T;
        readonly last?: T;
      }
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

  const testFileMigration = async (fileContent: string, expectedPartAfterMigration: string) => {
    writeFile('/index.ts', fileContent);
    await runMigration();
    expect(stripWhitespace(tree.readContent('/index.ts')))
        .toContain(stripWhitespace(expectedPartAfterMigration));
  };

  it('should add ! to accesses to a QueryList\'s first field', async () => {
    await testFileMigration(
        `
      import { Component, QueryList, ViewChildren, OnInit } from '@angular/core';

      @Component({
        selector: 'comp-test',
        template: ''
      })
      export class CompTest {
        value = 'test';
      }

      @Component({selector: 'my-comp', template: ''})
      export class MyComp implements OnInit {
        @ViewChildren(CompTest) testElements!: QueryList<CompTest>;

        ngOnInit() {
          console.log(this.testElements.first.value);
        }
      }
    `,
        `ngOnInit() {
        console.log(this.testElements.first!.value);
     }`);
  });

  it('should add ! to accesses to a QueryList\'s last field', async () => {
    await testFileMigration(
        `
      import { Component, QueryList, ViewChildren, OnInit } from '@angular/core';

      @Component({
        selector: 'comp-test',
        template: ''
      })
      export class CompTest {
        value = 'test';
      }

      @Component({selector: 'my-comp', template: ''})
      export class MyComp implements OnInit {
        @ViewChildren(CompTest) testElements!: QueryList<CompTest>;

        ngOnInit() {
          console.log(this.testElements.last.value);
        }
      }
    `,
        `ngOnInit() {
       console.log(this.testElements.last!.value);
     }`);
  });

  it('should add ! to accesses to both QueryList\'s first and last fields', async () => {
    await testFileMigration(
        `
      import { Component, QueryList, ViewChildren, Input } from '@angular/core';

      @Component({
        selector: 'comp-test',
        template: ''
      })
      export class CompTest {
        @Input() id: string!;
      }

      @Component({selector: 'my-comp', template: ''})
      export class MyComp {
        @ViewChildren(CompTest) testElements!: QueryList<CompTest>;

        checkFirstAndLastIdsEquality() {
          return this.testElements.first.id === this.testElements.last.id;
        }
      }
    `,
        `checkFirstAndLastIdsEquality() {
      return this.testElements.first!.id === this.testElements.last!.id;
    }`);
  });

  it('should not add ! to accesses to the QueryList\'s fist/last fields if they are null checked',
     async () => {
       await testFileMigration(
           `
      import { Component, QueryList, ViewChildren, OnInit } from '@angular/core';

      @Component({
        selector: 'comp-test',
        template: ''
      })
      export class CompTest {
        value = 'test';
      }

      @Component({selector: 'my-comp', template: ''})
      export class MyComp implements OnInit {
        @ViewChildren(CompTest) testElements!: QueryList<CompTest>;

        ngOnInit() {
          this.testElements.first && console.log(this.testElements.first.value);
          this.testElements.last && console.log(this.testElements.last.value);
        }
      }
    `,
           `ngOnInit() {
          this.testElements.first && console.log(this.testElements.first.value);
          this.testElements.last && console.log(this.testElements.last.value);
     }`);
     });

  it('should add ! to accesses to QueryList\'s first and last fields even after reassignment',
     async () => {
       await testFileMigration(
           `
      import { Component, QueryList, ViewChildren, Input } from '@angular/core';

      @Component({
        selector: 'comp-test',
        template: ''
      })
      export class CompTest {
        execLogic() {}
      }

      @Component({selector: 'my-comp', template: ''})
      export class MyComp {
        @ViewChildren(CompTest) testElements!: QueryList<CompTest>;

        onClick() {
          const allCompTests = this.testElements;
          if(allCompTests.first) {
            allCompTests.first.execLogic();
          } else {
            allCompTests.last.execLogic();
          }
        }
      }
    `,
           `
        onClick() {
          const allCompTests = this.testElements;
          if(allCompTests.first) {
            allCompTests.first.execLogic();
          } else {
            allCompTests.last!.execLogic();
          }
        }`);
     });

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematicAsync('query-list-first-last', {}, tree).toPromise();
  }

  function stripWhitespace(contents: string) {
    return contents.replace(/\s/g, '');
  }
});
