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
import {runfiles} from '@bazel/runfiles';
import shx from 'shelljs';

describe('ShadowDomToLegacyShadowDomMigration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematic('shadowdom-migration', {}, tree);
  }

  beforeEach(() => {
    runner = new SchematicTestRunner('test', runfiles.resolvePackageRelative('../migrations.json'));
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

    previousWorkingDir = shx.pwd();
    shx.cd(tmpDirPath);
  });

  afterEach(() => {
    shx.cd(previousWorkingDir);
    shx.rm('-r', tmpDirPath);
  });

  it('should replace ViewEncapsulation.ShadowDom with ViewEncapsulation.LegacyShadowDom', async () => {
    writeFile(
      '/index.ts',
      `
      import {Component, ViewEncapsulation} from '@angular/core';

      @Component({
        selector: 'my-comp',
        template: '',
        encapsulation: ViewEncapsulation.ShadowDom,
      })
      export class MyComponent {}
    `,
    );

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain('encapsulation: ViewEncapsulation.LegacyShadowDom');
  });

  it('should not change other ViewEncapsulation values', async () => {
    const input = `
      import {Component, ViewEncapsulation} from '@angular/core';

      @Component({
        selector: 'my-comp',
        template: '',
        encapsulation: ViewEncapsulation.Emulated,
      })
      export class MyComponent {}
    `;
    writeFile('/index.ts', input);

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toBe(input);
  });

  it('should handle multiple components in the same file', async () => {
    writeFile(
      '/index.ts',
      `
      import {Component, ViewEncapsulation} from '@angular/core';

      @Component({
        selector: 'my-comp-1',
        template: '',
        encapsulation: ViewEncapsulation.ShadowDom,
      })
      export class MyComponent1 {}

      @Component({
        selector: 'my-comp-2',
        template: '',
        encapsulation: ViewEncapsulation.ShadowDom,
      })
      export class MyComponent2 {}
    `,
    );

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain('encapsulation: ViewEncapsulation.LegacyShadowDom');
    expect(content.match(/LegacyShadowDom/g)?.length).toBe(2);
  });
});
