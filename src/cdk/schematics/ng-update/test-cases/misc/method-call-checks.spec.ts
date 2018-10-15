import {migrationCollection} from '../index.spec';
import {runTestCases} from '../../../testing';

describe('v6 method call checks', () => {

  it('should properly report invalid method calls', async () => {
    const {logOutput} = await runTestCases('migration-v6', migrationCollection, {
      'method-call-checks': require.resolve('./method-call-checks_input.ts')
    });

    expect(logOutput)
      .toMatch(/\[15,.*Found call to "FocusMonitor\.monitor".*renderer.*has been removed/);
    expect(logOutput)
      .toMatch(/\[16,.*Found call to "FocusMonitor\.monitor".*renderer.*has been removed/);
  });
});
