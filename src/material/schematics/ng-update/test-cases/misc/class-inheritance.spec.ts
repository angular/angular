import {createTestCaseSetup} from '@angular/cdk/schematics/testing';
import {migrationCollection} from '../index.spec';

describe('class inheritance misc checks', () => {

  describe('v6 class which extends MatFormFieldControl', () => {

    it('should report if class does not declare "shouldLabelFloat"', async () => {
      const {removeTempDir, runFixers} = await createTestCaseSetup('migration-v6',
        migrationCollection, [require.resolve('./class-inheritance_input.ts')]);

      const {logOutput} = await runFixers();

      expect(logOutput).toMatch(/Found class "WithoutLabelProp".*extends "MatFormFieldControl.*must define "shouldLabelFloat"/);
      expect(logOutput).not.toMatch(/Found class "WithLabelProp".*extends "MatFormFieldControl".*must define "shouldLabelFloat"/);

      removeTempDir();
    });
  });
});
