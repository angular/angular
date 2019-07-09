import {createTestCaseSetup} from '../../../testing';
import {migrationCollection} from '../index.spec';

describe('v6 method call checks', () => {
  it('should properly report invalid method calls', async () => {
    const {runFixers, removeTempDir} = await createTestCaseSetup(
        'migration-v6', migrationCollection, [require.resolve('./method-call-checks_input.ts')]);

    const {logOutput} = await runFixers();

    expect(logOutput).toMatch(
        /@15:5 - Found call to "FocusMonitor\.monitor".*renderer.*has been removed/);
    expect(logOutput).toMatch(
        /@16:5 - Found call to "FocusMonitor\.monitor".*renderer.*has been removed/);

    removeTempDir();
  });
});
