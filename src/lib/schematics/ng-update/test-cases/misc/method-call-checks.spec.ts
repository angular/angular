import {resolveBazelDataFile, runTestCases} from '../index.spec';

describe('v6 method call checks', () => {

  it('should properly report invalid method calls', async () => {
    const {logOutput} = await runTestCases('migration-01', {
      'method-call-checks': resolveBazelDataFile(`misc/method-call-checks_input.ts`)
    });

    // TODO(devversion): Move this test case to the CDK and assert that this failure has been
    // reported by TSLint.
    expect(logOutput)
      .not.toMatch(/\[15,.*Found call to "FocusMonitor\.monitor".*renderer.*has been removed/);
    expect(logOutput)
      .not.toMatch(/\[16,.*Found call to "FocusMonitor\.monitor".*renderer.*has been removed/);
  });
});


