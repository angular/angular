import {resolveBazelDataFile, runTestCases} from '../index.spec';

describe('v6 import misc checks', () => {

  it('should report imports for deleted animation constants', async () => {
    const {logOutput} = await runTestCases('migration-v6', {
      'import-checks': resolveBazelDataFile(`misc/import-checks_input.ts`)
    });

    expect(logOutput).toMatch(/Found deprecated symbol "SHOW_ANIMATION"/);
    expect(logOutput).toMatch(/Found deprecated symbol "HIDE_ANIMATION"/);
  });
});


