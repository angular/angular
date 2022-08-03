import {runfiles} from '@bazel/runfiles';
import {createTestCaseSetup, readFileContent} from '@angular/cdk/schematics/testing';
import {MIGRATION_PATH} from '../../../../paths';

describe('v8 material imports', () => {
  it('should re-map top-level material imports to the proper entry points', async () => {
    const {runFixers, appTree, writeFile} = await createTestCaseSetup(
      'migration-v8',
      MIGRATION_PATH,
      [runfiles.resolvePackageRelative('test-cases/v8/misc/material-imports_input.ts')],
    );
    const materialPath = '/node_modules/@angular/material';

    writeFile(
      `${materialPath}/index.d.ts`,
      `
      export * from './a';
      export * from './b';
      export * from './c';
      export * from './core';
      export * from './types';
    `,
    );

    writeFile(`${materialPath}/a/index.d.ts`, `export const a = '';`);
    writeFile(`${materialPath}/b/index.d.ts`, `export const b = '';`);
    writeFile(`${materialPath}/c/index.d.ts`, `export const c = '';`);
    writeFile(`${materialPath}/core/index.d.ts`, `export const VERSION = '';`);
    writeFile(
      `${materialPath}/types/index.d.ts`,
      `
      export declare interface SomeInterface {
        event: any;
      }
    `,
    );

    await runFixers();

    expect(
      appTree.readContent('/projects/cdk-testing/src/test-cases/material-imports_input.ts'),
    ).toBe(
      readFileContent(
        runfiles.resolvePackageRelative('test-cases/v8/misc/material-imports_expected_output.ts'),
      ),
    );
  });
});
