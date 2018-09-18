import {SchematicTestRunner} from '@angular-devkit/schematics/testing';
import {runPostScheduledTasks} from '../../../test-setup/post-scheduled-tasks';
import {migrationCollection} from '../../../test-setup/test-app';
import {createTestAppWithTestCase, resolveBazelDataFile} from '../index.spec';

describe('v6 import misc checks', () => {

  it('should report imports for deleted animation constants', async () => {
    const inputPath = resolveBazelDataFile(`misc/import-checks_input.ts`);
    const runner = new SchematicTestRunner('schematics', migrationCollection);

    runner.runSchematic('migration-01', {}, createTestAppWithTestCase(inputPath));

    let output = '';
    runner.logger.subscribe(entry => output += entry.message);

    await runPostScheduledTasks(runner, 'tslint-fix').toPromise();

    expect(output).toMatch(/Found deprecated symbol "SHOW_ANIMATION"/);
    expect(output).toMatch(/Found deprecated symbol "HIDE_ANIMATION"/);
  });
});


