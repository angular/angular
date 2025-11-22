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

describe('signal input migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration(options?: {bestEffortMode?: boolean; path?: string}) {
    return runner.runSchematic('signal-input-migration', options, tree);
  }

  const collectionJsonPath = resolve('../collection.json');
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

  it('should work', async () => {
    writeFile(
      '/index.ts',
      `
      import {Input, Directive} from '@angular/core';

      @Directive({})
      export class SomeDirective {
        @Input({required: true}) name = '';
      }`,
    );

    await runMigration();

    const content = tree.readContent('/index.ts').replace(/\s+/g, ' ');
    expect(content).toContain('readonly name = input.required<string>()');
  });

  it('should work when extending tsconfig from node_modules', async () => {
    writeFile(`node_modules/@tsconfig/strictest/tsconfig.json`, `{}`);
    writeFile(
      `tsconfig.json`,
      JSON.stringify({
        extends: `@tsconfig/strictest/tsconfig.json`,
      }),
    );
    writeFile(
      '/index.ts',
      `
      import {Input, Directive} from '@angular/core';

      @Directive({})
      export class SomeDirective {
        @Input({required: true}) name = '';
      }`,
    );

    await runMigration();

    const content = tree.readContent('/index.ts').replace(/\s+/g, ' ');
    expect(content).toContain('readonly name = input.required<string>()');
  });

  it('should report correct statistics', async () => {
    writeFile(`node_modules/@tsconfig/strictest/tsconfig.json`, `{}`);
    writeFile(
      `tsconfig.json`,
      JSON.stringify({
        extends: `@tsconfig/strictest/tsconfig.json`,
      }),
    );
    writeFile(
      '/index.ts',
      `
      import {Input, Directive} from '@angular/core';

      @Directive({})
      export class SomeDirective {
        @Input({required: true}) name = '';
        @Input({required: true}) lastName = '';

        someFn() {
          this.lastName = 'other name';
        }
      }`,
    );

    const messages: string[] = [];
    runner.logger.subscribe((m) => messages.push(m.message));

    await runMigration();

    expect(messages).toContain(`  -> Migrated 1/2 inputs.`);
  });

  it('should report correct statistics with best effort mode', async () => {
    writeFile(`node_modules/@tsconfig/strictest/tsconfig.json`, `{}`);
    writeFile(
      `tsconfig.json`,
      JSON.stringify({
        extends: `@tsconfig/strictest/tsconfig.json`,
      }),
    );
    writeFile(
      '/index.ts',
      `
      import {Input, Directive} from '@angular/core';

      @Directive({})
      export class SomeDirective {
        @Input({required: true}) name = '';
        @Input({required: true}) lastName = '';

        someFn() {
          this.lastName = 'other name';
        }
      }`,
    );

    const messages: string[] = [];
    runner.logger.subscribe((m) => messages.push(m.message));

    await runMigration({bestEffortMode: true});

    expect(messages).toContain(`  -> Migrated 2/2 inputs.`);
  });

  it('should only migrate inputs in specified path', async () => {
    writeFile(
      '/app/test-path/app.component.ts',
      `
    import {Component, Input} from '@angular/core';
    @Component({template: ''})
    export class AppComponent {
      @Input() name = '';
    }
  `,
    );

    writeFile(
      '/app/test-path-not/other.component.ts',
      `
    import {Component, Input} from '@angular/core';
    @Component({template: ''})
    export class OtherComponent {
      @Input() title = '';
    }
  `,
    );

    await runMigration({path: 'app/test-path'});

    const appContent = tree.readContent('/app/test-path/app.component.ts');
    expect(appContent).toContain('readonly name = input');

    const otherContent = tree.readContent('/app/test-path-not/other.component.ts');
    expect(otherContent).toContain('@Input() title');
  });
});
