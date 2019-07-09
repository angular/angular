import {createTestCaseSetup, readFileContent} from '@angular/cdk/schematics/testing';
import {migrationCollection} from '../index.spec';

describe('v8 material imports', () => {
  it('should report imports for deleted animation constants', async () => {
    const {runFixers, appTree, writeFile, removeTempDir} = await createTestCaseSetup(
        'migration-v8', migrationCollection, [require.resolve('./material-imports_input.ts')]);
    const materialPath = '/node_modules/@angular/material';

    writeFile(`${materialPath}/index.d.ts`, `
      export * from './a';
      export * from './b';
      export * from './c';
      export * from './core';
      export * from './types';
    `);

    writeFile(`${materialPath}/a/index.d.ts`, `export const a = '';`);
    writeFile(`${materialPath}/b/index.d.ts`, `export const b = '';`);
    writeFile(`${materialPath}/c/index.d.ts`, `export const c = '';`);
    writeFile(`${materialPath}/core/index.d.ts`, `export const VERSION = '';`);
    writeFile(`${materialPath}/types/index.d.ts`, `
      export declare interface SomeInterface {
        event: any;
      }
    `);

    await runFixers();

    expect(appTree.readContent('/projects/cdk-testing/src/test-cases/material-imports_input.ts'))
        .toBe(readFileContent(require.resolve('./material-imports_expected_output.ts')));

    removeTempDir();
  });
});
