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

describe('strict-safe-navigation-narrow migration', () => {
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

    const runMigration = migrate();
    await runMigration(tree, {} as any);

    const tsconfig = parseConfig(tree, '/tsconfig.json');
    expect(tsconfig.angularCompilerOptions).toBeUndefined();
  });

  it('should not add options if compilerOptions is missing', async () => {
    tree.create('/tsconfig.json', JSON.stringify({}));

    const runMigration = migrate();
    await runMigration(tree, {} as any);

    const tsconfig = parseConfig(tree, '/tsconfig.json');
    expect(tsconfig.angularCompilerOptions).toBeUndefined();
  });

  it('should add suppress options if compilerOptions is not empty', async () => {
    tree.create(
      '/tsconfig.json',
      JSON.stringify({
        compilerOptions: {
          target: 'es2020',
        },
      }),
    );

    const runMigration = migrate();
    await runMigration(tree, {} as any);

    const tsconfig = parseConfig(tree, '/tsconfig.json');
    expect(
      tsconfig.angularCompilerOptions.extendedDiagnostics.checks.nullishCoalescingNotNullable,
    ).toBe('suppress');
    expect(
      tsconfig.angularCompilerOptions.extendedDiagnostics.checks.optionalChainNotNullable,
    ).toBe('suppress');
  });

  it('should preserve existing checks', async () => {
    tree.create(
      '/tsconfig.json',
      JSON.stringify({
        compilerOptions: {
          target: 'es2020',
        },
        angularCompilerOptions: {
          extendedDiagnostics: {
            checks: {
              somethingElse: 'warning',
            },
          },
        },
      }),
    );

    const runMigration = migrate();
    await runMigration(tree, {} as any);

    const tsconfig = parseConfig(tree, '/tsconfig.json');
    expect(tsconfig.angularCompilerOptions.extendedDiagnostics.checks.somethingElse).toBe(
      'warning',
    );
    expect(
      tsconfig.angularCompilerOptions.extendedDiagnostics.checks.nullishCoalescingNotNullable,
    ).toBe('suppress');
    expect(
      tsconfig.angularCompilerOptions.extendedDiagnostics.checks.optionalChainNotNullable,
    ).toBe('suppress');
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
    expect(
      tsconfig.angularCompilerOptions.extendedDiagnostics.checks.nullishCoalescingNotNullable,
    ).toBe('suppress');
  });
});
