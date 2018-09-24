import {resolveBazelDataFile, runTestCases} from '../index.spec';

describe('v6 method call checks', () => {

  it('should properly report invalid method calls', async () => {
    const {logOutput} = await runTestCases('migration-01', {
      'method-call-checks': resolveBazelDataFile(`misc/method-call-checks_input.ts`)
    });

    expect(logOutput)
      .toMatch(/\[15,.*Found call to "FocusMonitor\.monitor".*renderer.*has been removed/);
    expect(logOutput)
      .toMatch(/\[16,.*Found call to "FocusMonitor\.monitor".*renderer.*has been removed/);
  });
});


