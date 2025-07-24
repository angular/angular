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

describe('combined signals migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration(migrations: string[]) {
    return runner.runSchematic('signals', {migrations}, tree);
  }

  function stripWhitespace(value: string) {
    return value.replace(/\s/g, '');
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

    previousWorkingDir = shx.pwd();
    tmpDirPath = getSystemPath(host.root);
    shx.cd(tmpDirPath);
  });

  afterEach(() => {
    shx.cd(previousWorkingDir);
    shx.rm('-r', tmpDirPath);
  });

  it('should be able to run multiple migrations at the same time', async () => {
    writeFile(
      '/index.ts',
      `
      import {ContentChild, Input, ElementRef, Output, Component, EventEmitter} from '@angular/core';

      @Component({
        template: 'The value is {{value}}',
      })
      export class SomeComponent {
        @ContentChild('ref') ref!: ElementRef;
        @Input('alias') value: string = 'initial';
        @Output() clicked = new EventEmitter<void>();
      }`,
    );

    await runMigration(['inputs', 'queries', 'outputs']);

    expect(stripWhitespace(tree.readContent('/index.ts'))).toBe(
      stripWhitespace(`
      import {ElementRef, Component, input, output, contentChild} from '@angular/core';

      @Component({
        template: 'The value is {{value()}}',
      })
      export class SomeComponent {
        readonly ref = contentChild.required<ElementRef>('ref');
        readonly value = input<string>('initial', { alias: "alias" });
        readonly clicked = output<void>();
      }
    `),
    );
  });

  it('should be able to run only specific migrations', async () => {
    writeFile(
      '/index.ts',
      `
      import {ContentChild, Input, ElementRef, Component} from '@angular/core';

      @Component({
        template: 'The value is {{value}}',
      })
      export class SomeComponent {
        @ContentChild('ref') ref!: ElementRef;
        @Input('alias') value: string = 'initial';
      }`,
    );

    await runMigration(['queries']);

    expect(stripWhitespace(tree.readContent('/index.ts'))).toBe(
      stripWhitespace(`
      import {Input, ElementRef, Component, contentChild} from '@angular/core';

      @Component({
        template: 'The value is {{value}}',
      })
      export class SomeComponent {
        readonly ref = contentChild.required<ElementRef>('ref');
        @Input('alias') value: string = 'initial';
      }
    `),
    );
  });
});
