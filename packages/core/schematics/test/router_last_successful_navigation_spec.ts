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
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing/index.js';
import {resolve} from 'node:path';
import shx from 'shelljs';

describe('router-last-successful-navigation migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematic('router-last-successful-navigation', {}, tree);
  }

  const migrationsJsonPath = resolve('../migrations.json');
  beforeEach(() => {
    runner = new SchematicTestRunner('test', migrationsJsonPath);
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

    writeFile(
      '/node_modules/@angular/router/index.d.ts',
      `
      export declare class Router {
        lastSuccessfulNavigation(): Navigation | null;
      }
    `,
    );

    shx.cd(tmpDirPath);
  });

  it('should migrate a usage of Router.lastSuccessfulNavigation', async () => {
    writeFile(
      '/test.ts',
      `
        import { Router } from '@angular/router';

        export class MyService {
          constructor(private router: Router) {} 

          someMethod() {
            const navigation = this.router.lastSuccessfulNavigation;
          }
        }
        `,
    );

    await runMigration();
    expect(tree.readContent('/test.ts')).toContain(
      'const navigation = this.router.lastSuccessfulNavigation();',
    );
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
      'test.ts',
      `
        import { Router } from '@angular/router';

        export class MyService {
          constructor(private router: Router) {} 

          someMethod() {
            const navigation = this.router.lastSuccessfulNavigation;
          }
        }
      `,
    );

    await runMigration();
    const content = tree.readContent('/test.ts');
    expect(content).toContain('const navigation = this.router.lastSuccessfulNavigation();');
  });

  it('should not migrate a usage of from non-angular router', async () => {
    writeFile(
      '/test.ts',
      `
        import { Router } from '@not-angular/router';

        export class MyService {
          constructor(private router: Router) {} 

          someMethod() {
            const navigation = this.router.lastSuccessfulNavigation;
          }
        }
        `,
    );

    await runMigration();
    expect(tree.readContent('/test.ts')).toContain(
      'const navigation = this.router.lastSuccessfulNavigation;',
    );
  });
});
