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

describe('NavigationExtras preserveQueryParams migration', () => {
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
    writeFile('/node_modules/@angular/router/index.d.ts', `
      export declare class Router {
        navigate(url: string, extras?: any);
        createUrlTree(commands: any[], extras?: any);
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

  describe('updates the', () => {
    it('`navigate` function', async () => {
      writeFile('/index.ts', `
      import {Router} from '@angular/router';

      class Navigator {
        constructor(private _router: Router) {}

        goHome() {
          this._router.navigate('/', {preserveQueryParams: true});
        }
      }
    `);

      await runMigration();

      const content = tree.readContent('/index.ts');
      expect(content).toContain(`this._router.navigate('/', { queryParamsHandling: 'preserve' });`);
    });

    it('`createUrlTree` function', async () => {
      writeFile('/index.ts', `
      import {Router} from '@angular/router';

      class Navigator {
        constructor(private _router: Router) {}

        goHome() {
          this._router.createUrlTree('/', {preserveQueryParams: false});
        }
      }
    `);

      await runMigration();

      const content = tree.readContent('/index.ts');
      expect(content).toContain(`this._router.createUrlTree('/', {});`);
    });
  });

  describe('updates an object which is used for the parameter', () => {
    it('should migrate when the value is `true`', async () => {
      writeFile('/index.ts', `
        import {Router} from '@angular/router';

        const config = {preserveQueryParams: true, replaceUrl: true, fragment: 'foo', state: {}};

        class Navigator {
          constructor(private _router: Router) {}

          goHome() {
            this._router.createUrlTree(['/'], config);
          }
        }
      `);

      await runMigration();

      const content = tree.readContent('/index.ts');
      expect(content).toContain(
          `const config = { replaceUrl: true, fragment: 'foo', state: {}, queryParamsHandling: 'preserve' };`);
    });

    it('should remove when the value is `false`', async () => {
      writeFile('/index.ts', `
        import {Router} from '@angular/router';

        const config = {preserveQueryParams: false, replaceUrl: true, fragment: 'foo', state: {}};

        class Navigator {
          constructor(private _router: Router) {}

          goHome() {
            this._router.createUrlTree(['/'], config);
          }
        }
      `);

      await runMigration();

      const content = tree.readContent('/index.ts');
      expect(content).toContain(`const config = { replaceUrl: true, fragment: 'foo', state: {} };`);
    });

    it('should not modify when the property is no present', async () => {
      writeFile('/index.ts', `
        import {Router} from '@angular/router';

        const config = {replaceUrl: true, fragment: 'foo', state: {}};

        class Navigator {
          constructor(private _router: Router) {}

          goHome() {
            this._router.navigate('/', config);
          }
        }
      `);

      await runMigration();

      const content = tree.readContent('/index.ts');
      expect(content).toContain(`const config = {replaceUrl: true, fragment: 'foo', state: {}};`);
    });
  });

  describe('updates an the locally defined parameter in the method', () => {
    it('should migrate when the value is `true`', async () => {
      writeFile('/index.ts', `
        import {Router} from '@angular/router';

        class Navigator {
          constructor(private _router: Router) {}

          goHome() {
            this._router.navigate('/', {preserveQueryParams: true, replaceUrl: true, fragment: 'foo', state: {}});
          }
        }
      `);

      await runMigration();

      const content = tree.readContent('/index.ts');
      expect(content).toContain(
          `this._router.navigate('/', { replaceUrl: true, fragment: 'foo', state: {}, queryParamsHandling: 'preserve' });`);
    });

    it('should remove when the value is `false`', async () => {
      writeFile('/index.ts', `
        import {Router} from '@angular/router';

        class Navigator {
          constructor(private _router: Router) {}

          goHome() {
            this._router.createUrlTree(['/'], {preserveQueryParams: false, replaceUrl: true, fragment: 'foo', state: {}};);
          }
        }
      `);

      await runMigration();

      const content = tree.readContent('/index.ts');
      expect(content).toContain(
          `this._router.createUrlTree(['/'], { replaceUrl: true, fragment: 'foo', state: {} };`);
    });

    it('should not modify when the property is not present', async () => {
      writeFile('/index.ts', `
        import {Router} from '@angular/router';

        class Navigator {
          constructor(private _router: Router) {}

          goHome() {
            this._router.navigate('/', {replaceUrl: true, fragment: 'foo', state: {}});
          }
        }
      `);

      await runMigration();

      const content = tree.readContent('/index.ts');
      expect(content).toContain(
          `this._router.navigate('/', {replaceUrl: true, fragment: 'foo', state: {}});`);
    });
  });
  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematicAsync('migration-v11-router-preserve-query-params', {}, tree)
        .toPromise();
  }
});
