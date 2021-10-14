import {resolveBazelPath} from '@angular/cdk/schematics/testing';
import {MIGRATION_PATH} from '../../../paths';
import {createTestCaseSetup} from '../../../testing';

describe('v6 method call checks', () => {
  it('should properly report invalid method calls', async () => {
    const {runFixers} = await createTestCaseSetup('migration-v6', MIGRATION_PATH, [
      resolveBazelPath(__dirname, './method-call-checks_input.ts'),
    ]);

    const {logOutput} = await runFixers();

    expect(logOutput).toMatch(
      /@15:5 - Found call to "FocusMonitor\.monitor".*renderer.*has been removed/,
    );
    expect(logOutput).toMatch(
      /@16:5 - Found call to "FocusMonitor\.monitor".*renderer.*has been removed/,
    );
  });
});
