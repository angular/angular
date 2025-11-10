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
import {rmSync} from 'node:fs';

describe('self-closing-tags migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;
  let logs: string[];

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration(options?: {path?: string}) {
    return runner.runSchematic('self-closing-tag', options, tree);
  }

  const collectionJsonPath = resolve('../collection.json');
  beforeEach(() => {
    runner = new SchematicTestRunner('test', collectionJsonPath);
    host = new TempScopedNodeJsSyncHost();
    tree = new UnitTestTree(new HostTree(host));
    logs = [];

    writeFile('/tsconfig.json', '{}');
    writeFile(
      '/angular.json',
      JSON.stringify({
        version: 1,
        projects: {t: {root: '', architect: {build: {options: {tsConfig: './tsconfig.json'}}}}},
      }),
    );

    previousWorkingDir = process.cwd();
    tmpDirPath = getSystemPath(host.root);
    runner.logger.subscribe((log) => logs.push(log.message));
    process.chdir(tmpDirPath);
  });

  afterEach(() => {
    process.chdir(previousWorkingDir);
    rmSync(tmpDirPath, {recursive: true});
  });

  it('should work', async () => {
    writeFile(
      '/app.component.ts',
      `
      import {Component} from '@angular/core';
      @Component({ template: '<my-cmp></my-cmp>' })
      export class Cmp {}
      `,
    );

    await runMigration();

    const content = tree.readContent('/app.component.ts').replace(/\s+/g, ' ');
    expect(content).toContain('<my-cmp />');
    expect(logs.pop()).toBe(
      '  -> Migrated 1 components to self-closing tags in 1 component files.',
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
      '/app.component.ts',
      `
      import {Component} from '@angular/core';
      @Component({ template: '<my-cmp></my-cmp>' })
      export class Cmp {}
      `,
    );

    await runMigration();

    const content = tree.readContent('/app.component.ts').replace(/\s+/g, ' ');
    expect(content).toContain('<my-cmp />');
    expect(logs.pop()).toBe(
      '  -> Migrated 1 components to self-closing tags in 1 component files.',
    );
  });

  it('should only migrate files in specified path', async () => {
    writeFile(
      '/app/app.component.ts',
      `
    import {Component} from '@angular/core';
    @Component({ template: '<my-cmp></my-cmp>' })
    export class AppComponent {}
  `,
    );

    writeFile(
      '/other/other.component.ts',
      `
    import {Component} from '@angular/core';
    @Component({ template: '<my-other></my-other>' })
    export class OtherComponent {}
  `,
    );

    await runMigration({path: 'app'});

    const appContent = tree.readContent('/app/app.component.ts');
    expect(appContent).toContain('<my-cmp />');

    const otherContent = tree.readContent('/other/other.component.ts');
    expect(otherContent).toContain('<my-other></my-other>');
  });
});
