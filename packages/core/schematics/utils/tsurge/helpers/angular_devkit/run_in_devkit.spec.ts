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
  TsurgeComplexMigration,
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

/** Migrates all files of each unit, inserting different text per unit. */
class TestComplexMigration extends TsurgeComplexMigration<{}, {}> {
  private unitCount = 0;

  override async analyze(): Promise<Serializable<{}>> {
    return confirmAsSerializable({});
  }

  override async combine(): Promise<Serializable<{}>> {
    return confirmAsSerializable({});
  }

  override async globalMeta(): Promise<Serializable<{}>> {
    return confirmAsSerializable({});
  }

  override async stats(): Promise<Serializable<unknown>> {
    return confirmAsSerializable({});
  }

  override async migrate(_data: {}, info: ProgramInfo): Promise<{replacements: Replacement[]}> {
    const replacements: Replacement[] = [];
    const toInsert = `after${++this.unitCount}`;

    for (const sf of info.fullProgramSourceFiles) {
      const start = sf.text.indexOf('before');
      if (start !== -1) {
        replacements.push(
          new Replacement(
            projectFile(sf, info),
            new TextUpdate({position: start, end: start + 'before'.length, toInsert}),
          ),
        );
      }
    }

    return {replacements};
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

  it('only applies changes from one compilation unit to files shared between tsconfigs', async () => {
    tree.create(
      '/angular.json',
      JSON.stringify({
        version: 1,
        projects: {
          app: {
            root: '',
            architect: {
              build: {options: {tsConfig: './tsconfig.app.json'}},
              test: {options: {tsConfig: './tsconfig.spec.json'}},
            },
          },
        },
      }),
    );
    const tsconfig = JSON.stringify({
      compilerOptions: {module: 'preserve', target: 'ES2022', noLib: true},
      include: ['src/**/*.ts'],
    });
    tree.create('/tsconfig.app.json', tsconfig);
    tree.create('/tsconfig.spec.json', tsconfig);
    tree.create('/src/app/app.ts', `export const value = 'before';\n`);

    await runMigrationInDevkit({
      tree,
      getMigration: () => new TestComplexMigration(),
    });

    expect(tree.readContent('/src/app/app.ts')).toBe(`export const value = 'after1';\n`);
  });
});
