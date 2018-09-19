import {SchematicTestRunner} from '@angular-devkit/schematics/testing';
import {runPostScheduledTasks} from '../../../test-setup/post-scheduled-tasks';
import {migrationCollection} from '../../../test-setup/test-app';
import {createTestAppWithTestCase, resolveBazelDataFile} from '../index.spec';

describe('constructor checks', () => {

  it('should properly report invalid constructor expression signatures', async () => {
    const inputPath = resolveBazelDataFile(`misc/constructor-checks_input.ts`);
    const runner = new SchematicTestRunner('schematics', migrationCollection);

    runner.runSchematic('migration-01', {}, createTestAppWithTestCase(inputPath));

    let output = '';
    runner.logger.subscribe(entry => output += entry.message);

    await runPostScheduledTasks(runner, 'tslint-fix').toPromise();

    expect(output).toMatch(/\[22.*Found "NativeDateAdapter"/,
      'Expected the constructor checks to report if an argument is not assignable.');
    expect(output).not.toMatch(/\[26.*Found "NativeDateAdapter".*/,
      'Expected the constructor to not report if an argument is assignable.');

    expect(output).not.toMatch(/Found "NonMaterialClass".*: new NonMaterialClass\(\)/);

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

    expect(output).toMatch(/Found "MatDrawerContent".*super.*: super\((any, ){4}any\)/);
    expect(output).toMatch(/Found "MatDrawerContent".*: new \w+\((any, ){4}any\)/);

    expect(output).toMatch(/Found "MatSidenavContent".*super.*: super\((any, ){4}any\)/);
    expect(output).toMatch(/Found "MatSidenavContent".*: new \w+\((any, ){4}any\)/);

    expect(output).toMatch(/Found "ExtendedDateAdapter".*super.*: super\(string, Platform\)/);
    expect(output).toMatch(/Found "ExtendedDateAdapter".*: new \w+\(string, Platform\)/);
  });
});


