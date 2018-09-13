import {SchematicTestRunner} from '@angular-devkit/schematics/testing';
import {runPostScheduledTasks} from '../../test-setup/post-scheduled-tasks';
import {migrationCollection} from '../../test-setup/test-app';
import {createTestAppWithTestCase, readFileContent, resolveBazelDataFile} from './index.spec';

describe('v6 upgrade test cases', () => {

  /**
   * Name of test cases that will be used to verify that update schematics properly update
   * a developers application.
   */
  const testCases = [
    'v6/attribute-selectors',
    'v6/class-names',
    'v6/css-names',
    'v6/element-selectors',
    'v6/input-names',
    'v6/output-names',
    'v6/property-names',
  ];

  // Iterates through every test case directory and generates a jasmine test block that will
  // verify that the update schematics properly update the test input to the expected output.
  testCases.forEach(testCaseName => {
    const inputPath = resolveBazelDataFile(`${testCaseName}_input.ts`);
    const expectedOutputPath = resolveBazelDataFile(`${testCaseName}_expected_output.ts`);

    it(`should apply update schematics to test case: ${testCaseName}`, () => {
      const runner = new SchematicTestRunner('schematics', migrationCollection);

      runner.runSchematic('migration-01', {}, createTestAppWithTestCase(inputPath));

      // Run the scheduled TSLint fix task from the update schematic. This task is responsible for
      // identifying outdated code parts and performs the fixes. Since tasks won't run automatically
      // within a `SchematicTestRunner`, we manually need to run the scheduled task.
      return runPostScheduledTasks(runner, 'tslint-fix').toPromise().then(() => {
        expect(readFileContent('projects/material/src/main.ts'))
            .toBe(readFileContent(expectedOutputPath));
      });
    });
  });
});


