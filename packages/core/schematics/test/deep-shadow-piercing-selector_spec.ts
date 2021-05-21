/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {tags} from '@angular-devkit/core';
import {EmptyTree} from '@angular-devkit/schematics';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';

describe('`/deep/` to `::ng-deep` migration', () => {
  let tree: UnitTestTree;
  const runner = new SchematicTestRunner('test', require.resolve('../migrations.json'));

  beforeEach(() => {
    tree = new UnitTestTree(new EmptyTree());
  });

  it(`should replace '/deep/' with '::ng-deep' in inline component styles`, async () => {
    const fileName = '/index.ts';
    const getFileContent = (contentToReplace: string) => tags.stripIndents`
      import { Component } from '@angular/core';

      @Component({
        selector: 'app-root',
        template: '<router-outlet></router-outlet>',
        styles: ['` +
        contentToReplace + `'],
      })
      export class AppComponent { }
   `;

    tree.create(fileName, getFileContent(':host /deep/ * { cursor: pointer; }'));
    await runMigration();
    expect(tree.readContent(fileName))
        .toBe(getFileContent(':host ::ng-deep * { cursor: pointer; }'));
  });

  for (const styleExtension of ['scss', 'sass', 'css', 'styl', 'less']) {
    it(`should replace '/deep/' with '::ng-deep' in ${styleExtension} file`, async () => {
      const fileName = `/index.${styleExtension}`;
      tree.create(fileName, ':host /deep/ * { cursor: pointer; }');
      await runMigration();
      expect(tree.readContent(fileName)).toBe(':host ::ng-deep * { cursor: pointer; }');
    });
  }

  it(`should replace '/deep/' with '::ng-deep' when used as root selector`, async () => {
    const fileName = '/index.css';
    tree.create(fileName, '/deep/ * { cursor: pointer; }');
    await runMigration();
    expect(tree.readContent(fileName)).toBe('::ng-deep * { cursor: pointer; }');
  });

  it(`should not replace '/deep/' with '::ng-deep' in unknown file extension`, async () => {
    const fileName = '/index.foo';
    const content = 'this is a not /deep/ selector';
    tree.create(fileName, content);
    await runMigration();
    expect(tree.readContent(fileName)).toBe(content);
  });

  async function runMigration(): Promise<void> {
    await runner.runSchematicAsync('migration-v12-deep-shadow-piercing-selector', {}, tree)
        .toPromise();
  }
});
