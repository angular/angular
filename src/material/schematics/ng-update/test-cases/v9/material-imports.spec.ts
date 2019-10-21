import {createTestCaseSetup, readFileContent} from '@angular/cdk/schematics/testing';
import {migrationCollection} from '../index.spec';

describe('v9 material imports', () => {
  it('should re-map top-level material imports to the proper entry points when top-level ' +
    '@angular/material package does not exist', async () => {
      const {runFixers, appTree, removeTempDir} = await createTestCaseSetup(
          'migration-v9', migrationCollection, [require.resolve('./material-imports_input.ts')]);

      // Note: don't create a fake @angular/material package here, because
      // we're testing what would happen if it doesn't exist anymore.
      await runFixers();

      expect(appTree.readContent('/projects/cdk-testing/src/test-cases/material-imports_input.ts'))
          .toBe(readFileContent(require.resolve('./material-imports_expected_output.ts')));

      removeTempDir();
    });
});
