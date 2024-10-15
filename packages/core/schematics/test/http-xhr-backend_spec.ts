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
import exp from 'constants';
import shx from 'shelljs';

describe('http fetch backend migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematic('http-xhr-backend', {}, tree);
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

    tmpDirPath = getSystemPath(host.root);

    // Switch into the temporary directory path. This allows us to run
    // the schematic against our custom unit test tree.
    shx.cd(tmpDirPath);
  });

  it('should update an empty provideHttpClient', async () => {
    writeFile(
      '/index.ts',
      `
          import {AppConfig} from '@angular/core';
          import {provideHttpClient} from '@angular/common/http';

          const config: AppConfig = [
            provideHttpClient(),
          ]
          `,
    );

    await runMigration();

    const content = tree.readContent('/index.ts').replace(/\s+/g, ' ');
    expect(content).toContain('provideHttpClient(withXhr())');
  });

  it('should update provideHttpClient without withFetch', async () => {
    writeFile(
      '/index.ts',
      `
          import {AppConfig} from '@angular/core';
          import {provideHttpClient, withInterceptorsFromDi, withXsrfConfiguration} from '@angular/common/http';

          const config: AppConfig = [
            provideHttpClient(withInterceptorsFromDi(), withXsrfConfiguration({})),
          ]
          `,
    );

    await runMigration();

    const content = tree.readContent('/index.ts').replace(/\s+/g, ' ');
    expect(content).toContain(
      'provideHttpClient(withXhr(), withInterceptorsFromDi(), withXsrfConfiguration({}))',
    );
    expect(content).toMatch(/import \{.*withXhr.*\}/);
  });

  it('should update provideHttpClient to remove withFetch', async () => {
    writeFile(
      '/index.ts',
      `
          import {AppConfig} from '@angular/core';
          import {provideHttpClient, withFetch, withInterceptorsFromDi, withXsrfConfiguration} from '@angular/common/http';

          const config: AppConfig = [
            provideHttpClient(withFetch(), withInterceptorsFromDi(), withXsrfConfiguration({})),
          ]
          `,
    );

    await runMigration();

    const content = tree.readContent('/index.ts').replace(/\s+/g, ' ');
    expect(content).toContain(
      'provideHttpClient(withInterceptorsFromDi(), withXsrfConfiguration({}))',
    );
    expect(content).not.toContain('withFetch');
  });
});
