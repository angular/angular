/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HostTree} from '@angular-devkit/schematics';
import {UnitTestTree} from '@angular-devkit/schematics/testing/index.js';
import {migrate} from './index';

describe('strict-template migration', () => {
  let tree: UnitTestTree;

  beforeEach(() => {
    tree = new UnitTestTree(new HostTree());
    tree.create(
      '/angular.json',
      JSON.stringify({
        version: 1,
        projects: {
          t: {
            root: '',
            architect: {
              build: {
                options: {
                  tsConfig: './tsconfig.json',
                },
              },
            },
          },
        },
      }),
    );
  });

  it('should not add options if compilerOptions is empty', async () => {
    tree.create(
      '/tsconfig.json',
      JSON.stringify({
        compilerOptions: {},
      }),
    );

    await migrate()(tree, {} as any);

    const tsconfig = JSON.parse(tree.readContent('/tsconfig.json'));
    expect(tsconfig.angularCompilerOptions).toBeUndefined();
  });

  it('should not add options if compilerOptions is missing', async () => {
    tree.create('/tsconfig.json', JSON.stringify({}));

    await migrate()(tree, {} as any);

    const tsconfig = JSON.parse(tree.readContent('/tsconfig.json'));
    expect(tsconfig.angularCompilerOptions).toBeUndefined();
  });

  it('should add strictTemplates to false if compilerOptions is not empty', async () => {
    tree.create(
      '/tsconfig.json',
      JSON.stringify({
        compilerOptions: {
          target: 'es2020',
        },
      }),
    );

    await migrate()(tree, {} as any);

    const tsconfig = JSON.parse(tree.readContent('/tsconfig.json'));
    expect(tsconfig.angularCompilerOptions.strictTemplates).toBe(false);
  });

  it('should add strictTemplates to false if angularCompilerOptions is empty but compilerOptions is not', async () => {
    tree.create(
      '/tsconfig.json',
      JSON.stringify({
        compilerOptions: {
          target: 'es2020',
        },
        angularCompilerOptions: {},
      }),
    );

    await migrate()(tree, {} as any);

    const tsconfig = JSON.parse(tree.readContent('/tsconfig.json'));
    expect(tsconfig.angularCompilerOptions.strictTemplates).toBe(false);
  });

  it('should not change strictTemplates if already present', async () => {
    tree.create(
      '/tsconfig.json',
      JSON.stringify({
        angularCompilerOptions: {
          strictTemplates: true,
        },
      }),
    );

    await migrate()(tree, {} as any);

    const tsconfig = JSON.parse(tree.readContent('/tsconfig.json'));
    expect(tsconfig.angularCompilerOptions.strictTemplates).toBe(true);
  });
});
