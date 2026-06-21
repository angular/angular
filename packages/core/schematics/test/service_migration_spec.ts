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

describe('service migration schematic', () => {
  const collectionJsonPath = resolve('../collection.json');
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematic('service-migration', {}, tree);
  }

  beforeEach(() => {
    runner = new SchematicTestRunner('test', collectionJsonPath);
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

    previousWorkingDir = process.cwd();
    tmpDirPath = getSystemPath(host.root);
    process.chdir(tmpDirPath);
  });

  afterEach(() => {
    process.chdir(previousWorkingDir);
    rmSync(tmpDirPath, {recursive: true});
  });

  it('should convert root injectable to @Service', async () => {
    writeFile(
      'comp.ts',
      `
        import {Injectable} from '@angular/core';

        @Injectable({providedIn: 'root'})
        export class MyService {}
      `,
    );

    await runMigration();
    const contents = tree.readContent('comp.ts');

    expect(contents).toContain('@Service()');
    expect(contents).not.toContain('@Injectable');
    expect(contents).toContain(`import { Service } from '@angular/core';`);
    expect(contents).not.toContain('Injectable');
  });

  it('should convert non-root injectable to @Service with autoProvided: false', async () => {
    writeFile(
      'comp.ts',
      `
        import {Injectable} from '@angular/core';

        @Injectable()
        export class MyService {}
      `,
    );

    await runMigration();
    const contents = tree.readContent('comp.ts');

    expect(contents).toContain('@Service({ autoProvided: false })');
    expect(contents).not.toContain('@Injectable');
    expect(contents).toContain(`import { Service } from '@angular/core';`);
    expect(contents).not.toContain('Injectable');
  });

  it('should skip injectable with `providedIn` anything other than root', async () => {
    const initialContent = `
      import {Injectable} from '@angular/core';

      @Injectable({providedIn: 'platform'})
      export class MyService {}
    `;
    writeFile('comp.ts', initialContent);

    await runMigration();
    const contents = tree.readContent('comp.ts');

    expect(contents).toContain(`providedIn: 'platform'`);
    expect(contents).toContain('@Injectable');
    expect(contents).not.toContain('@Service');
  });

  it('should skip injectable with `useClass`', async () => {
    const initialContent = `
      import {Injectable} from '@angular/core';

      class OtherService {}

      @Injectable({providedIn: 'root', useClass: OtherService})
      export class MyService {}
    `;
    writeFile('comp.ts', initialContent);

    await runMigration();
    const contents = tree.readContent('comp.ts');

    expect(contents).toContain(`useClass:`);
    expect(contents).toContain('@Injectable');
    expect(contents).not.toContain('@Service');
  });

  it('should skip injectable if the class is using constructor DI', async () => {
    const initialContent = `
      import {Injectable, NgZone} from '@angular/core';

      @Injectable({providedIn: 'root'})
      export class MyService {
        constructor(private ngZone: NgZone) {}
      }
    `;
    writeFile('comp.ts', initialContent);

    await runMigration();
    const contents = tree.readContent('comp.ts');

    expect(contents).toContain(`providedIn: 'root'`);
    expect(contents).toContain('@Injectable');
    expect(contents).not.toContain('@Service');
  });

  it('should not remove Injectable import if there are skipped injectables left in the file', async () => {
    writeFile(
      'comp.ts',
      `
        import {Injectable} from '@angular/core';

        @Injectable({providedIn: 'root'})
        export class MyService {}

        @Injectable({providedIn: 'platform'})
        export class PlatformService {}
      `,
    );

    await runMigration();
    const contents = tree.readContent('comp.ts');

    expect(contents).toContain('@Service()');
    expect(contents).toContain(`providedIn: 'platform'`);
    expect(contents).toContain(`import { Injectable, Service } from '@angular/core';`);
  });

  it('should convert injectable if `providedIn` is quoted', async () => {
    writeFile(
      'comp.ts',
      `
        import {Injectable} from '@angular/core';

        @Injectable({'providedIn': 'root'})
        export class MyService {}
      `,
    );

    await runMigration();
    const contents = tree.readContent('comp.ts');

    expect(contents).toContain('@Service()');
    expect(contents).not.toContain('@Injectable');
    expect(contents).toContain(`import { Service } from '@angular/core';`);
    expect(contents).not.toContain('Injectable');
  });
});
