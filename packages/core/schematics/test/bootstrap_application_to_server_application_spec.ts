/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {normalize, virtualFs} from '@angular-devkit/core';
import {TempScopedNodeJsSyncHost} from '@angular-devkit/core/node/testing';
import {HostTree} from '@angular-devkit/schematics';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing/index.js';
import {resolve} from 'path';

describe('bootstrapApplication to bootstrapServerApplication migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;

  const migrationsJsonPath = resolve('../migrations.json');

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematic('bootstrap-application-to-server-application', {}, tree);
  }

  beforeEach(() => {
    runner = new SchematicTestRunner('test', migrationsJsonPath);
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
  });

  it('should unwrap simple arrow function', async () => {
    const inputContent = `
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;
`;
    const expectedContent = `
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';
import { bootstrapServerApplication } from '@angular/platform-server';

const bootstrap = bootstrapServerApplication(AppComponent, config);

export default bootstrap;
`;
    writeFile('/main.server.ts', inputContent);
    await runMigration();
    const newContent = tree.readContent('/main.server.ts');
    expect(newContent).toEqual(expectedContent);
  });

  it('should unwrap arrow function with block body containing only a return statement', async () => {
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
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';
import { bootstrapServerApplication } from '@angular/platform-server';

const bootstrap = bootstrapServerApplication(AppComponent, config);

export default bootstrap;
`;
    writeFile('/main.server.ts', inputContent);
    await runMigration();
    const newContent = tree.readContent('/main.server.ts');
    expect(newContent).toEqual(expectedContent);
  });

  it('should preserve other statements in arrow function with block body', async () => {
    const inputContent = `
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

const bootstrap = () => {
  console.log('bootstrapping');
  return bootstrapApplication(AppComponent, config);
};

export default bootstrap;
`;
    const expectedContent = `
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';
import { Injector } from '@angular/core';
import { bootstrapServerApplication } from '@angular/platform-server';

const bootstrap = (platformInjector: Injector) => {
  console.log('bootstrapping');
  return bootstrapServerApplication(AppComponent, config)(platformInjector);
};

export default bootstrap;
`;
    writeFile('/main.server.ts', inputContent);
    await runMigration();
    const newContent = tree.readContent('/main.server.ts');
    expect(newContent).toEqual(expectedContent);
  });

  it('should only remove bootstrapApplication from existing platform-browser import', async () => {
    const inputContent = `
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;
`;
    const expectedContent = `
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';
import { bootstrapServerApplication } from '@angular/platform-server';

const bootstrap = bootstrapServerApplication(AppComponent, config);

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
