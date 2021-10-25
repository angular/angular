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

describe('XhrFactory migration', () => {
  let tree: UnitTestTree;
  const runner = new SchematicTestRunner('test', require.resolve('../migrations.json'));

  beforeEach(() => {
    tree = new UnitTestTree(new EmptyTree());
  });

  it(`should replace 'XhrFactory' from '@angular/common/http' to '@angular/common'`, async () => {
    tree.create('/index.ts', tags.stripIndents`
      import { HttpClient } from '@angular/common';
      import { HttpErrorResponse, HttpResponse, XhrFactory } from '@angular/common/http';
    `);

    await runMigration();
    expect(tree.readContent('/index.ts')).toBe(tags.stripIndents`
      import { HttpClient, XhrFactory } from '@angular/common';
      import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
    `);
  });

  it(`should replace import for 'XhrFactory' to '@angular/common'`, async () => {
    tree.create('/index.ts', tags.stripIndents`
      import { Injecable } from '@angular/core';
      import { XhrFactory } from '@angular/common/http';
      import { BrowserModule } from '@angular/platform-browser';
    `);

    await runMigration();
    expect(tree.readContent('/index.ts')).toBe(tags.stripIndents`
      import { Injecable } from '@angular/core';
      import { XhrFactory } from '@angular/common';
      import { BrowserModule } from '@angular/platform-browser';
    `);
  });

  it(`should remove http import when 'XhrFactory' is the only imported symbol`, async () => {
    tree.create('/index.ts', tags.stripIndents`
      import { HttpClient } from '@angular/common';
      import { XhrFactory as XhrFactory2 } from '@angular/common/http';
      import { Injecable } from '@angular/core';
    `);

    await runMigration();
    expect(tree.readContent('/index.ts')).toBe(tags.stripIndents`
      import { HttpClient, XhrFactory as XhrFactory2 } from '@angular/common';
      import { Injecable } from '@angular/core';
    `);
  });

  it(`should add named import when '@angular/common' is a namespace import`, async () => {
    tree.create('/index.ts', tags.stripIndents`
      import * as common from '@angular/common';
      import { XhrFactory } from '@angular/common/http';
    `);

    await runMigration();
    expect(tree.readContent('/index.ts')).toBe(tags.stripIndents`
      import * as common from '@angular/common';
      import { XhrFactory } from '@angular/common';
    `);
  });

  async function runMigration(): Promise<void> {
    await runner.runSchematicAsync('migration-v12-xhr-factory', {}, tree).toPromise();
  }
});
