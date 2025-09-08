/*!
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

describe('bootstrapApplication for server migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematic('add-bootstrap-context-to-server-main', {}, tree);
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
        projects: {
          t: {
            root: '',
            architect: {
              build: {options: {tsConfig: './tsconfig.json'}},
              server: {options: {main: './main.server.ts'}},
            },
          },
        },
      }),
    );

    tmpDirPath = getSystemPath(host.root);

    // Switch into the temporary directory path. This allows us to run
    // the schematic against our custom unit test tree.
    shx.cd(tmpDirPath);
  });

  it('should add BootstrapContext to bootstrapApplication call', async () => {
    const inputContent = `
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;
`;
    const expectedContent = `
import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

const bootstrap = (context: BootstrapContext) => bootstrapApplication(AppComponent, config, context);

export default bootstrap;
`;
    writeFile('/main.server.ts', inputContent);
    await runMigration();
    const newContent = tree.readContent('/main.server.ts');
    expect(newContent).toEqual(expectedContent);
  });

  it('should add BootstrapContext to bootstrapApplication call in a block body', async () => {
    const inputContent = `
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

const bootstrap = () => {
  return bootstrapApplication(AppComponent, config);
};

export default bootstrap;
`;
    const expectedContent = `
import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

const bootstrap = (context: BootstrapContext) => {
  return bootstrapApplication(AppComponent, config, context);
};

export default bootstrap;
`;
    writeFile('/main.server.ts', inputContent);
    await runMigration();
    const newContent = tree.readContent('/main.server.ts');
    expect(newContent).toEqual(expectedContent);
  });

  it('should not change bootstrapApplication call that already has a context', async () => {
    const inputContent = `
import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

const bootstrap = (context: BootstrapContext) => bootstrapApplication(AppComponent, config, context);

export default bootstrap;
`;
    writeFile('/main.server.ts', inputContent);
    await runMigration();
    const newContent = tree.readContent('/main.server.ts');
    expect(newContent).toEqual(inputContent);
  });

  it('should add BootstrapContext to existing platform-browser import', async () => {
    const inputContent = `
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;
`;
    const expectedContent = `
import { bootstrapApplication, BrowserModule, BootstrapContext } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

const bootstrap = (context: BootstrapContext) => bootstrapApplication(AppComponent, config, context);

export default bootstrap;
`;
    writeFile('/main.server.ts', inputContent);
    await runMigration();
    const newContent = tree.readContent('/main.server.ts');
    expect(newContent).toEqual(expectedContent);
  });

  it('should not modify other files', async () => {
    const inputContent = `
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;
`;
    writeFile('/main.ts', inputContent);
    await runMigration();
    const newContent = tree.readContent('/main.ts');
    expect(newContent).toEqual(inputContent);
  });
});
