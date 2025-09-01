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

describe('application-config migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematic('application-config-core', {}, tree);
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

    shx.cd(tmpDirPath);
  });

  it('should migrate an import of ApplicationConfig', async () => {
    writeFile(
      '/dir.ts',
      `
        import { Directive, inject } from '@angular/core';
        import { ApplicationConfig } from '@angular/platform-browser';
      `,
    );

    await runMigration();
    const content = tree.readContent('/dir.ts');
    expect(content).toContain(
      `import { Directive, inject, ApplicationConfig } from '@angular/core';`,
    );
    expect(content).not.toContain(`@angular/platform-browser`);
  });

  it('should migrate an aliased import of ApplicationConfig', async () => {
    writeFile(
      '/dir.ts',
      `
        import { Directive, inject } from '@angular/core';
        import { ApplicationConfig as ApplicationConfigAlias } from '@angular/platform-browser';
      `,
    );

    await runMigration();
    const content = tree.readContent('/dir.ts');
    expect(content).toContain(
      `import { Directive, inject, ApplicationConfig as ApplicationConfigAlias } from '@angular/core';`,
    );
    expect(content).not.toContain(`@angular/platform-browser`);
  });

  it('should migrate a file that does not import @angular/core', async () => {
    writeFile(
      '/dir.ts',
      `
        import { ApplicationConfig } from '@angular/platform-browser';
      `,
    );

    await runMigration();
    const content = tree.readContent('/dir.ts');
    expect(content).toContain(`import { ApplicationConfig } from '@angular/core';`);
    expect(content).not.toContain(`@angular/platform-browser`);
  });
});
