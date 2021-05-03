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

describe('ActivatedRouteSnapshot.fragment migration', () => {
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
      compilerOptions: {lib: ['es2015'], strictNullChecks: true},
    }));
    writeFile('/angular.json', JSON.stringify({
      projects: {t: {architect: {build: {options: {tsConfig: './tsconfig.json'}}}}}
    }));
    // We need to declare the Angular symbols we're testing for, otherwise type checking won't work.
    writeFile('/node_modules/@angular/router.d.ts', `
      export declare class ActivatedRoute {
        get children(): ActivatedRoute[];
        fragment: Observable<string | null>;
        snapshot: ActivatedRouteSnapshot;
        url: Observable<unknown[]>;
      }

      export declare class ActivatedRouteSnapshot {
        fragment: string | null;
        url: unknown[];
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

  it('should add non-null assertions to accesses of `ActivatedRouteSnapshot.fragment`',
     async () => {
       writeFile('/index.ts', `
          import {ActivatedRoute} from '@angular/router';

          class App {
            private _route: ActivatedRoute;

            getFragment() {
              return this._getSnapshot().fragment.foo;
            }

            private _getSnapshot() {
              return this._route.snapshot;
            }
          }
        `);

       await runMigration();

       expect(tree.readContent('/index.ts')).toContain('return this._getSnapshot().fragment!.foo');
     });

  it('should not add non-null assertions to accesses of `ActivatedRouteSnapshot.fragment` if there is one already',
     async () => {
       writeFile('/index.ts', `
        import {ActivatedRoute} from '@angular/router';

        class App {
          private _route: ActivatedRoute;

          getFragment() {
            return this._route.snapshot.fragment!.foo;
          }
        }
      `);

       await runMigration();

       expect(tree.readContent('/index.ts'))
           .toContain('return this._route.snapshot.fragment!.foo;');
     });

  it('should not add non-null assertions if the `ActivatedRouteSnapshot.fragment` has been null checked in an if statement',
     async () => {
       writeFile('/index.ts', `
        import {ActivatedRouteSnapshot} from '@angular/router';

        function getFragmentValue(snapshot: ActivatedRouteSnapshot) {
          if (snapshot.fragment) {
            return snapshot.fragment.value;
          }

          return null;
        }
      `);

       await runMigration();

       const content = tree.readContent('/index.ts');
       expect(content).toContain(`if (snapshot.fragment) {`);
       expect(content).toContain(`return snapshot.fragment.value;`);
     });

  it('should not add non-null assertions if the `ActivatedRouteSnapshot.fragment` has been null checked in an else if statement',
     async () => {
       writeFile('/index.ts', `
        import {ActivatedRouteSnapshot} from '@angular/router';

        function getSnapshotValue(foo: boolean, snapshot: ActivatedRouteSnapshot) {
          if (foo) {
            return foo;
          } else if (snapshot.fragment) {
            return snapshot.fragment.value;
          }

          return null;
        }
      `);

       await runMigration();

       const content = tree.readContent('/index.ts');
       expect(content).toContain(`} else if (snapshot.fragment) {`);
       expect(content).toContain(`return snapshot.fragment.value;`);
     });

  it('should not add non-null assertions if the `ActivatedRouteSnapshot.fragment` has been null checked in a ternary expression',
     async () => {
       writeFile('/index.ts', `
        import {ActivatedRouteSnapshot} from '@angular/router';

        function getSnapshotValue(snapshot: ActivatedRouteSnapshot) {
          return snapshot.fragment ? snapshot.fragment.value : null;
        }
      `);

       await runMigration();

       expect(tree.readContent('/index.ts'))
           .toContain(`return snapshot.fragment ? snapshot.fragment.value : null;`);
     });

  it('should not add non-null assertion to `ActivatedRouteSnapshot.fragment` if there is a safe access',
     async () => {
       writeFile('/index.ts', `
        import {ActivatedRouteSnapshot} from '@angular/router';

        function getSnapshotValue(snapshot: ActivatedRouteSnapshot) {
          return snapshot.fragment?.value;
        }
      `);

       await runMigration();
       expect(tree.readContent('/index.ts')).toContain(`return snapshot.fragment?.value;`);
     });

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematicAsync('migration-v12-activated-route-snapshot-fragment', {}, tree)
        .toPromise();
  }
});
