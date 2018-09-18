import {SchematicTestRunner} from '@angular-devkit/schematics/testing';
import {runPostScheduledTasks} from '../../../test-setup/post-scheduled-tasks';
import {migrationCollection} from '../../../test-setup/test-app';
import {createTestAppWithTestCase, resolveBazelDataFile} from '../index.spec';

describe('v6 method call checks', () => {

  it('should properly report invalid method calls', async () => {
    const inputPath = resolveBazelDataFile(`misc/method-call-checks_input.ts`);
    const runner = new SchematicTestRunner('schematics', migrationCollection);

    runner.runSchematic('migration-01', {}, createTestAppWithTestCase(inputPath));

    let output = '';
    runner.logger.subscribe(entry => output += entry.message);

    await runPostScheduledTasks(runner, 'tslint-fix').toPromise();

    expect(output)
      .toMatch(/\[15,.*Found call to "FocusMonitor\.monitor".*renderer.*has been removed/);
    expect(output)
      .toMatch(/\[16,.*Found call to "FocusMonitor\.monitor".*renderer.*has been removed/);
  });
});


