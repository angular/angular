import {createTestCaseSetup} from '@angular/cdk/schematics/testing';
import {migrationCollection} from '../index.spec';

describe('v6 import misc checks', () => {

  it('should report imports for deleted animation constants', async () => {
    const {removeTempDir, runFixers} = createTestCaseSetup('migration-v6',
      migrationCollection, [require.resolve('./import-checks_input.ts')]);

    const {logOutput} = await runFixers();

    expect(logOutput).toMatch(/Found deprecated symbol "SHOW_ANIMATION"/);
    expect(logOutput).toMatch(/Found deprecated symbol "HIDE_ANIMATION"/);

    removeTempDir();
  });
});


