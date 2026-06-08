/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HostTree} from '@angular-devkit/schematics';
import {UnitTestTree} from '@angular-devkit/schematics/testing/index.js';
import {
  confirmAsSerializable,
  ProgramInfo,
  projectFile,
  Replacement,
  Serializable,
  TextUpdate,
  TsurgeFunnelMigration,
} from '../../index';
import {runMigrationInDevkit} from './run_in_devkit';

interface TestMigrationData {
  replacements: Replacement[];
}

class TestMigration extends TsurgeFunnelMigration<TestMigrationData, TestMigrationData> {
  override async analyze(info: ProgramInfo): Promise<Serializable<TestMigrationData>> {
    const replacements: Replacement[] = [];

    for (const sf of info.sourceFiles) {
      const start = sf.text.indexOf('before');
      if (start === -1) {
        continue;
      }

      replacements.push(
        new Replacement(
          projectFile(sf, info),
          new TextUpdate({position: start, end: start + 'before'.length, toInsert: 'after'}),
        ),
      );
    }

    return confirmAsSerializable({replacements});
  }

  override async combine(
    unitA: TestMigrationData,
    unitB: TestMigrationData,
  ): Promise<Serializable<TestMigrationData>> {
    return confirmAsSerializable({
      replacements: [...unitA.replacements, ...unitB.replacements],
    });
  }

  override async globalMeta(data: TestMigrationData): Promise<Serializable<TestMigrationData>> {
    return confirmAsSerializable(data);
  }

  override async stats(): Promise<Serializable<unknown>> {
    return confirmAsSerializable({});
  }

  override async migrate(data: TestMigrationData): Promise<{replacements: Replacement[]}> {
    return {replacements: data.replacements};
  }
}

describe('runMigrationInDevkit', () => {
  let tree: UnitTestTree;

  beforeEach(() => {
    tree = new UnitTestTree(new HostTree());
  });

  it('applies replacements when no rootDir is specified', async () => {
    tree.create(
      '/angular.json',
      JSON.stringify({
        version: 1,
        projects: {
          app: {
            root: '',
            architect: {
              build: {
                options: {
                  tsConfig: './tsconfig.app.json',
                },
              },
            },
          },
        },
      }),
    );
    tree.create(
      '/tsconfig.app.json',
      JSON.stringify({
        compilerOptions: {
          module: 'preserve',
          target: 'ES2022',
          noLib: true,
        },
        include: ['src/**/*.ts'],
      }),
    );
    tree.create('/src/app/app.ts', `export const value = 'before';\n`);

    await runMigrationInDevkit({
      tree,
      getMigration: () => new TestMigration(),
    });

    expect(tree.readContent('/src/app/app.ts')).toContain(`'after'`);
  });

  it('applies replacements to workspace-relative paths when tsconfig rootDir is narrower', async () => {
    tree.create(
      '/angular.json',
      JSON.stringify({
        version: 1,
        projects: {
          app: {
            root: '',
            architect: {
              build: {
                options: {
                  tsConfig: './tsconfig.app.json',
                },
              },
            },
          },
        },
      }),
    );
    tree.create(
      '/tsconfig.app.json',
      JSON.stringify({
        compilerOptions: {
          rootDir: './src',
          module: 'preserve',
          target: 'ES2022',
          noLib: true,
        },
        include: ['src/**/*.ts'],
      }),
    );
    tree.create('/src/app/app.ts', `export const value = 'before';\n`);

    await runMigrationInDevkit({
      tree,
      getMigration: () => new TestMigration(),
    });

    expect(tree.readContent('/src/app/app.ts')).toContain(`'after'`);
  });
});
