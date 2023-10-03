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

describe('provideClientHydration migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematic('provide-client-hydration', {}, tree);
  }

  beforeEach(() => {
    runner = new SchematicTestRunner('test', runfiles.resolvePackageRelative('../migrations.json'));
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

  it('should migrate with withNoDomReuse', async () => {
    writeFile(
        '/main.ts',
        `
    import {Component} from '@angular/core';
    import {bootstrapApplication, provideClientHydration,withNoDomReuse} from '@angular/platform-browser';
    
    @Component({
      standalone: true,
      selector: 'app-root',
      template: '',
    })
    class AppComponent {}
    
    bootstrapApplication(AppComponent, {providers: [provideClientHydration(withNoDomReuse())]});
    `,
    );

    await runMigration();
    const content = tree.readContent('/main.ts');

    expect(content).toContain('provideClientHydration({domReuse: false})');
  });

  it('should migrate with withNoHttpTransferCache', async () => {
    writeFile(
        '/main.ts',
        `
    import {Component} from '@angular/core';
    import {bootstrapApplication, provideClientHydration,withNoHttpTransferCache} from '@angular/platform-browser';
    
    @Component({
      standalone: true,
      selector: 'app-root',
      template: '',
    })
    class AppComponent {}
    
    bootstrapApplication(AppComponent, {providers: [provideClientHydration(withNoHttpTransferCache())]});
    `,
    );

    await runMigration();
    const content = tree.readContent('/main.ts');

    expect(content).toContain('provideClientHydration({httpTransferCache: false})');
  });

  it('should migrate with both withNoDomReuse and withNoHttpTransferCache', async () => {
    writeFile(
        '/main.ts',
        `
    import {Component} from '@angular/core';
    import {bootstrapApplication, provideClientHydration,withNoHttpTransferCache,withNoDomReuse} from '@angular/platform-browser';
    
    @Component({
      standalone: true,
      selector: 'app-root',
      template: '',
    })
    class AppComponent {}
    
    bootstrapApplication(AppComponent, {providers: [provideClientHydration(withNoDomReuse(), withNoHttpTransferCache())]});
    `,
    );

    await runMigration();
    const content = tree.readContent('/main.ts');

    expect(content).toContain(
        'provideClientHydration({domReuse: false, httpTransferCache: false})');
  });

  it('should should nothing without withNoDomReuse and withNoHttpTransferCache', async () => {
    writeFile(
        '/main.ts',
        `
    import {Component} from '@angular/core';
    import {bootstrapApplication, provideClientHydration} from '@angular/platform-browser';
    
    @Component({
      standalone: true,
      selector: 'app-root',
      template: '',
    })
    class AppComponent {}
    
    bootstrapApplication(AppComponent, {providers: [provideClientHydration()]});
    `,
    );

    await runMigration();
    const content = tree.readContent('/main.ts');

    expect(content).toContain('provideClientHydration()');
  });
});
