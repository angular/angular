import {SchematicTestRunner} from '@angular-devkit/schematics/testing';
import {runPostScheduledTasks} from '../../../../test-setup/post-scheduled-tasks';
import {migrationCollection} from '../../../../test-setup/test-app';
import {createTestAppWithTestCase, resolveBazelDataFile} from '../../index.spec';

describe('v5 constructor checks', () => {

  it('should properly report invalid constructor expression signatures', async () => {
    const inputPath = resolveBazelDataFile(`v5/checks/constructor-checks_input.ts`);
    const runner = new SchematicTestRunner('schematics', migrationCollection);

    runner.runSchematic('migration-01', {}, createTestAppWithTestCase(inputPath));

    let output = '';
    runner.logger.subscribe(entry => output += entry.message);

    await runPostScheduledTasks(runner, 'tslint-fix').toPromise();

    expect(output).toMatch(/Found "NativeDateAdapter".*super.*: super\(string, Platform\)/);
    expect(output).toMatch(/Found "NativeDateAdapter".*: new \w+\(string, Platform\)/);

    expect(output).toMatch(/Found "MatAutocomplete".*super.*: super\(any, any, string\[]\)/);
    expect(output).toMatch(/Found "MatAutocomplete".*: new \w+\(any, any, string\[]\)/);

    expect(output).toMatch(/Found "MatTooltip".*super.*: super\((any, ){10}{ opt1: string; }\)/);
    expect(output).toMatch(/Found "MatTooltip".*: new \w+\((any, ){10}{ opt1: string; }\)/);

    expect(output).toMatch(/Found "MatIconRegistry".*super.*: super\(any, any, Document\)/);
    expect(output).toMatch(/Found "MatIconRegistry".*: new \w+\(any, any, Document\)/);

    expect(output).toMatch(/Found "MatCalendar".*super.*: super\(any, any, any, any\)/);
    expect(output).toMatch(/Found "MatCalendar".*: new \w+\(any, any, any, any\)/);
  });
});


