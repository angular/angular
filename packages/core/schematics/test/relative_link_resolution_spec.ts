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

describe('Relative link resolution config migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematic('migration-v15-relative-link-resolution', {}, tree);
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

  it('should drop `relativeLinkResolution` config option when used with RouterModule.forRoot',
     async () => {
       writeFile('/index.ts', `
          import { RouterModule } from '@angular/router';

          let providers = RouterModule.forRoot([], {
            onSameUrlNavigation: 'reload',
            paramsInheritanceStrategy: 'always',
            relativeLinkResolution: 'legacy',
            enableTracing: false,
          });

          providers = RouterModule.forRoot([], {
            onSameUrlNavigation: 'reload',
            paramsInheritanceStrategy: 'always',
            relativeLinkResolution: 'corrected',
            enableTracing: false,
          });
        `);

       await runMigration();

       const content = tree.readContent('/index.ts');
       expect(content).not.toContain('relativeLinkResolution');
     });

  it('should drop `relativeLinkResolution` config option when used without RouterModule.forRoot',
     async () => {
       writeFile('/index.ts', `
          const routerConfig = {
            onSameUrlNavigation: 'reload',
            paramsInheritanceStrategy: 'always',
            relativeLinkResolution: 'legacy',
            enableTracing: false,
          };
        `);

       await runMigration();

       const content = tree.readContent('/index.ts');
       expect(content).not.toContain('relativeLinkResolution');
     });

  it('should not touch `` if a value is unknown', async () => {
    writeFile('/index.ts', `
      const routerConfig = {
        relativeLinkResolution: 'some-unknown-value',
      };
    `);

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain(`relativeLinkResolution: 'some-unknown-value'`);
  });

  it('should retain an empty object if `relativeLinkResolution` was the only property',
     async () => {
       writeFile('/index.ts', `
          const routerConfig = {
            relativeLinkResolution: 'legacy',
          };
        `);

       await runMigration();

       const content = tree.readContent('/index.ts');
       expect(content).toContain(`const routerConfig = {}`);
     });
});
