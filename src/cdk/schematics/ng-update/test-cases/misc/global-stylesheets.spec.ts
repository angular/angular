import {createTestCaseSetup} from '../../../testing';
import {migrationCollection} from '../index.spec';
import {readFileSync} from 'fs';

describe('global stylesheets migration', () => {

  it('should not check stylesheet twice if referenced in component', async () => {
    const {runFixers, writeFile, removeTempDir, appTree} = await createTestCaseSetup(
      'migration-v6', migrationCollection, [require.resolve('./global-stylesheets_input.ts')]);

    const testStylesheetPath = 'projects/cdk-testing/src/test-cases/global-stylesheets-test.scss';

    // Copy the test stylesheets file into the test CLI application. That way it will
    // be picked up by the update-tool.
    writeFile(testStylesheetPath,
        readFileSync(require.resolve('./global-stylesheets-test.scss'), 'utf8'));

    await runFixers();

    // if the external stylesheet would have been checked multiple times, the migrated
    // stylesheet would not match the expected output.
    expect(appTree.readContent(testStylesheetPath))
        .toBe(`[cdkPortalOutlet] {\n  color: red;\n}\n`);

    removeTempDir();
  });
});
