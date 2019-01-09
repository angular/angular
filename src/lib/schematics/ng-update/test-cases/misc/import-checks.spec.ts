import {runTestCases} from '@angular/cdk/schematics/testing';
import {migrationCollection} from '../index.spec';

describe('v6 import misc checks', () => {

  it('should report imports for deleted animation constants', async () => {
    const {logOutput, removeTempDir} = await runTestCases('migration-v6', migrationCollection,
      [require.resolve('./import-checks_input.ts')]);

    expect(logOutput).toMatch(/Found deprecated symbol "SHOW_ANIMATION"/);
    expect(logOutput).toMatch(/Found deprecated symbol "HIDE_ANIMATION"/);

    removeTempDir();
  });
});


