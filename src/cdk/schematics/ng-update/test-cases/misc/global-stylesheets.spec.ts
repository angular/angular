import {runfiles} from '@bazel/runfiles';
import {readFileSync} from 'fs';
import {MIGRATION_PATH} from '../../../paths';
import {createTestCaseSetup} from '../../../testing';

describe('global stylesheets migration', () => {
  it('should not check stylesheet twice if referenced in component', async () => {
    const {runFixers, writeFile, appTree} = await createTestCaseSetup(
      'migration-v6',
      MIGRATION_PATH,
      [runfiles.resolvePackageRelative('ng-update/test-cases/misc/global-stylesheets_input.ts')],
    );

    const testStylesheetPath = 'projects/cdk-testing/src/test-cases/global-stylesheets-test.scss';

    // Copy the test stylesheets file into the test CLI application. That way it will
    // be picked up by the update-tool.
    writeFile(
      testStylesheetPath,
      readFileSync(
        runfiles.resolvePackageRelative('ng-update/test-cases/misc/global-stylesheets-test.scss'),
        'utf8',
      ),
    );
    writeFile('/projects/cdk-testing/third_party/materialize.css/bundle.css', '');

    await runFixers();

    // if the external stylesheet would have been checked multiple times, the migrated
    // stylesheet would not match the expected output and the devkit would throw that
    // the same replacements were recorded for the same source file.
    expect(appTree.readContent(testStylesheetPath)).toBe(`[cdkPortalOutlet] {\n  color: red;\n}\n`);
  });

  it('should not check stylesheets outside of project target', async () => {
    const {runFixers, writeFile, appTree} = await createTestCaseSetup(
      'migration-v6',
      MIGRATION_PATH,
      [],
    );
    const subProjectStylesheet = '[cdkPortalHost] {\n  color: red;\n}\n';

    writeFile('/sub_project/node_modules/materialize.css/package.json', '');
    writeFile('/sub_project/assets/test.css', subProjectStylesheet);

    // Run the fixers and expect no error to be thrown.
    await expectAsync(runFixers()).not.toBeRejected();

    // if the external stylesheet that is not of a project target would have been checked
    // by accident, the stylesheet would differ from the original file content.
    expect(appTree.readContent('/sub_project/assets/test.css')).toBe(subProjectStylesheet);
  });
});
