import {MIGRATION_PATH} from '../../../paths';
import {createTestCaseSetup} from '../../../testing';

describe('ng update typescript program module resolution', () => {
  // Regression test for: https://github.com/angular/components/issues/22919.
  it(
    'should not error if module resolution tries a non-existent path where a path segment ' +
      'matches an existing file',
    async () => {
      const {runFixers, writeFile} = await createTestCaseSetup('migration-v6', MIGRATION_PATH, []);

      writeFile('/node_modules/some-other-module/package.json', `{}`);
      writeFile('/node_modules/some-other-module/styles.css', '');

      // We add an import to a non-existent sub-path of `some-other-module/styles`. The TypeScript
      // module resolution logic could try various sub-paths. This previously resulted in an error
      // as the devkit tree `getDir` logic accidentally walked up the path and threw an error if
      // a path segment is an actual file.
      writeFile(
        '/projects/cdk-testing/src/main.ts',
        `import 'some-other-module/styles.css/non/existent';`,
      );

      await expectAsync(runFixers()).toBeResolved();
    },
  );
});
