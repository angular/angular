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

describe('Intl Opt-out migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematic('intl-opt-out', {}, tree);
  }

  beforeEach(() => {
    runner = new SchematicTestRunner('test', runfiles.resolvePackageRelative('../migrations.json'));
    host = new TempScopedNodeJsSyncHost();
    tree = new UnitTestTree(new HostTree(host));

    writeFile(
        '/tsconfig.json',
        JSON.stringify({
          compilerOptions: {
            lib: ['es2015'],
            strictNullChecks: true,
          },
        }),
    );

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

  it('should opt-out bootstrapApplication', async () => {
    writeFile(
        '/index.ts',
        `
    import { bootstrapApplication } from '@angular/platform-browser';

    bootstrapApplication(AppComponent)`,
    );

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toMatch(
        /\/\/ TODO:[\S\s]*useLegacyDateFormatting\(\)[\s]*bootstrapApplication\(AppComponent\)/);
    expect(content).toMatch(/useLegacyDateFormatting.*@angular\/common/);
    expect(content).toContain('// TODO:');
  });

  it('should opt-out boostrapApplication with existing common import', async () => {
    writeFile(
        '/index.ts',
        `
    import { bootstrapApplication } from '@angular/platform-browser';
    import { provideNetlifyLoader } from '@angular/common';

    bootstrapApplication(AppComponent, {providers: [provideNetlifyLoader()]})`,
    );

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toMatch(
        /\/\/ TODO:[\S\s]*useLegacyDateFormatting\(\)[\s]*bootstrapApplication\(AppComponent/);
    expect(content).toMatch(/useLegacyDateFormatting.*@angular\/common/);
    expect(content).toContain('// TODO:');
  });

  it('should opt-out bootstrapModule', async () => {
    writeFile(
        '/index.ts',
        `
    import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';    

    platformBrowserDynamic().bootstrapModule(AppModule);`,
    );

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toMatch(
        /\/\/ TODO:[\S\s]*useLegacyDateFormatting\(\)[\s]*platformBrowserDynamic\(\)\.bootstrapModule\(AppModule\)/g);
    expect(content).toMatch(/useLegacyDateFormatting.*@angular\/common/);
    expect(content).toContain('// TODO:');
  });
});
