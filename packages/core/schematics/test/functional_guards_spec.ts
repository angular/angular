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
import {runfiles} from '@bazel/runfiles';
import shx from 'shelljs';

describe('functional guards migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematic('migration-v16-functional-guards', {}, tree);
  }

  beforeEach(() => {
    runner = new SchematicTestRunner('test', runfiles.resolvePackageRelative('../migrations.json'));
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
      projects: {t: {root: '', architect: {build: {options: {tsConfig: './tsconfig.json'}}}}}
    }));

    // We need to declare the Angular symbols we're testing for, otherwise type checking won't work.
    writeFile('/node_modules/@angular/core/index.d.ts', `
    export declare class InjectionToken<T> {
      protected _desc: string;
      readonly ɵprov: unknown;
      constructor(_desc: string, options?: {
          providedIn?: Type<any> | 'root' | 'platform' | 'any' | null;
          factory: () => T;
      });
      toString(): string;
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

  it('should migrate canActivate with only class-based guards', async () => {
    writeFile('/index.ts', `
          export class MyGuard {
          }

          const route = {
            path: '',
            canActivate: [MyGuard],
          };
        `);

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain('canActivate: mapToCanActivate([MyGuard])');
  });

  it('should migrate not canActivate with only functional guards', async () => {
    writeFile('/index.ts', `
          const route = {
            path: '',
            canActivate: [() => true],
          };
        `);

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).not.toContain('mapToCanActivate');
  });

  it('should migrate when using a matcher instead of path on the route', async () => {
    writeFile('/index.ts', `
          export class MyGuard { }

          const route = {
            matcher: () => {},
            canActivate: [MyGuard],
          };
        `);

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain('mapToCanActivate([MyGuard])');
  });

  it('should not migrate when there is no path or matcher (these are required on the route)',
     async () => {
       writeFile('/index.ts', `
          export class MyGuard { }

          const route = {
            canActivate: [MyGuard],
          };
        `);

       await runMigration();

       const content = tree.readContent('/index.ts');
       expect(content).not.toContain('mapToCanActivate');
     });

  it('should migrate canActivate with mixed guards', async () => {
    writeFile('/index.ts', `
          export class MyGuard {}

          const route = {
            path: '',
            canActivate: [() => true, MyGuard],
          };
        `);

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain('canActivate: [() => true, ...mapToCanActivate([MyGuard])]');
  });

  it('should migrate resolve properties', async () => {
    writeFile('/index.ts', `
          export class ResolveMyData2 {}
          export class ResolveMyData3 {}

          const route = {
            path: '',
            resolve: {
              'data1': () => 'data1',
              'data2': ResolveMyData2,
              data3: ResolveMyData3,
            }
          };
        `);

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain(`'data1': () => 'data1'`);
    expect(content).toContain(`'data2': mapToResolve(ResolveMyData2)`);
    expect(content).toContain(`data3: mapToResolve(ResolveMyData3)`);
  });

  it('should migrate title resolvers', async () => {
    writeFile('/index.ts', `
          export class ResolveTitle {}

          const route = {
            path: '',
            title: ResolveTitle,
          };
        `);

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain(`title: mapToResolve(ResolveTitle)`);
  });

  it('should migrate all properties at once', async () => {
    writeFile('/index.ts', `
          export class MyClass {}

          const route = {
            path: '',
            title: MyClass,
            resolve: {
              data: MyClass
            },
            canActivate: [MyClass],
            canActivateChild: [MyClass],
            canDeactivate: [MyClass],
            canMatch: [MyClass],
          };
        `);

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain(`title: mapToResolve(MyClass)`);
    expect(content).toContain(`data: mapToResolve(MyClass)`);
    expect(content).toContain(`canActivate: mapToCanActivate([MyClass])`);
    expect(content).toContain(`canActivateChild: mapToCanActivateChild([MyClass])`);
    expect(content).toContain(`canDeactivate: mapToCanDeactivate([MyClass])`);
    expect(content).toContain(`canMatch: mapToCanMatch([MyClass])`);
  });

  it('migrates injection token guards and resolvers', async () => {
    writeFile('/index.ts', `
    import {InjectionToken} from '@angular/core';

    const resolveTitleToken = new InjectionToken<() => string>('');
    const canActivateToken = new InjectionToken<() => boolean>('');

    const route = {
      path: '',
      title: resolveTitleToken,
      canActivate: [canActivateToken],
    };
  `);

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain(`title: (...params) => inject(resolveTitleToken)(...params)`);
    expect(content).toContain(`canActivate: [(...params) => inject(canActivateToken)(...params)]`);
  });

  // TODO: test imported classes
});
