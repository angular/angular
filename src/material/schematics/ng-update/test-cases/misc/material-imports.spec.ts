import {createTestCaseSetup, readFileContent} from '@angular/cdk/schematics/testing';
import {migrationCollection} from '../index.spec';
import {writeFileSync, mkdirpSync} from 'fs-extra';
import {join} from 'path';

describe('v8 material imports', () => {

  function writeSecondaryEntryPoint(materialPath: string, name: string, contents: string) {
    const entryPointPath = join(materialPath, name);
    mkdirpSync(entryPointPath);
    writeFileSync(join(entryPointPath, 'index.d.ts'), contents);
  }

  it('should report imports for deleted animation constants', async () => {
    const {runFixers, removeTempDir, tempPath} = await createTestCaseSetup(
      'migration-v8', migrationCollection, [require.resolve('./material-imports_input.ts')]);
    const materialPath = join(tempPath, 'node_modules/@angular/material');

    mkdirpSync(materialPath);
    writeFileSync(join(materialPath, 'index.d.ts'), `
      export * from './a';
      export * from './b';
      export * from './c';
      export * from './core';
      export * from './types';
    `);

    writeSecondaryEntryPoint(materialPath, 'a', `export const a = '';`);
    writeSecondaryEntryPoint(materialPath, 'b', `export const b = '';`);
    writeSecondaryEntryPoint(materialPath, 'c', `export const c = ''`);
    writeSecondaryEntryPoint(materialPath, 'core', `export const VERSION = '';`);
    writeSecondaryEntryPoint(materialPath, 'types', `
      export declare interface SomeInterface {
        event: any;
      }
    `);

    await runFixers();

    const outputPath = join(tempPath,
      'projects/cdk-testing/src/test-cases/material-imports_input.ts');

    expect(readFileContent(outputPath)).toBe(
      readFileContent(require.resolve('./material-imports_expected_output.ts')));

    removeTempDir();
  });
});


