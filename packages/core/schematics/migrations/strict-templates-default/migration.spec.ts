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

function parseConfig(tree: UnitTestTree, path: string) {
  return JSON.parse(tree.readContent(path).replace(/\/\/.*$/gm, ''));
}

describe('strict-templates-default migration', () => {
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

    const tsconfig = parseConfig(tree, '/tsconfig.json');
    expect(tsconfig.angularCompilerOptions).toBeUndefined();
  });

  it('should not add options if compilerOptions is missing', async () => {
    tree.create('/tsconfig.json', JSON.stringify({}));

    await migrate()(tree, {} as any);

    const tsconfig = parseConfig(tree, '/tsconfig.json');
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

    const tsconfig = parseConfig(tree, '/tsconfig.json');
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

    const tsconfig = parseConfig(tree, '/tsconfig.json');
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

    const tsconfig = parseConfig(tree, '/tsconfig.json');
    expect(tsconfig.angularCompilerOptions.strictTemplates).toBe(true);
  });

  it('should handle tsconfig with comments', async () => {
    tree.create(
      '/tsconfig.json',
      `{
        // This is a comment
        "compilerOptions": {
          "target": "es2020"
        }
      }`,
    );

    const runMigration = migrate();
    await runMigration(tree, {} as any);

    const tsconfig = parseConfig(tree, '/tsconfig.json');
    expect(tsconfig.compilerOptions.target).toBe('es2020');
    expect(tsconfig.angularCompilerOptions.strictTemplates).toBe(false);
  });

  it('should not add strictTemplates to child tsconfig that inherits it from parent', async () => {
    tree.create(
      '/tsconfig.json',
      JSON.stringify({
        compilerOptions: {target: 'es2020'},
        angularCompilerOptions: {strictTemplates: true},
        include: ['src/**/*.d.ts'],
      }),
    );

    tree.create(
      '/tsconfig.app.json',
      JSON.stringify({
        extends: './tsconfig.json',
        compilerOptions: {outDir: './out-tsc/app'},
      }),
    );

    await migrate()(tree, {} as any);

    // The child MUST NOT receive strictTemplates because it inherits it
    const childTsconfig = parseConfig(tree, '/tsconfig.app.json');
    expect(childTsconfig.angularCompilerOptions).toBeUndefined();
  });

  it('should resolve strictTemplates from a multi-level inheritance chain', async () => {
    // Level 1: Root Config
    tree.create(
      '/tsconfig.json',
      JSON.stringify({
        angularCompilerOptions: {
          strictTemplates: true,
          strictInjectionParameters: false,
        },
      }),
    );

    // Level 2: Base Config (Inherits from Root)
    tree.create(
      '/tsconfig.base.json',
      JSON.stringify({
        extends: './tsconfig.json',
        angularCompilerOptions: {
          strictInjectionParameters: true, // Override property parent
        },
      }),
    );

    // Level 3: App Config (Inherits from Base)
    tree.create(
      '/tsconfig.app.json',
      JSON.stringify({
        extends: './tsconfig.base.json',
        compilerOptions: {outDir: './dist'},
      }),
    );

    await migrate()(tree, {} as any);

    const tsconfig = JSON.parse(tree.readText('/tsconfig.json'));
    const baseTsconfig = JSON.parse(tree.readText('/tsconfig.base.json'));
    const appTsconfig = JSON.parse(tree.readText('/tsconfig.app.json'));

    expect(tsconfig.angularCompilerOptions.strictTemplates).toBe(true); // Defined in root tsconfig
    expect(baseTsconfig.angularCompilerOptions).toBeDefined();
    expect(appTsconfig.angularCompilerOptions).toBeUndefined();
  });
});
