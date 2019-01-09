import {migrationCollection} from '../index.spec';
import {runTestCases} from '@angular/cdk/schematics/testing';

describe('constructor checks', () => {

  it('should properly report invalid constructor expression signatures', async () => {
    const {logOutput, removeTempDir} = await runTestCases('migration-v6', migrationCollection,
      [require.resolve('./constructor-checks_input.ts')]);

    expect(logOutput).toMatch(/:22.*Found "NativeDateAdapter"/,
      'Expected the constructor checks to report if an argument is not assignable.');
    expect(logOutput).not.toMatch(/:26.*Found "NativeDateAdapter".*/,
      'Expected the constructor to not report if an argument is assignable.');

    expect(logOutput).not.toMatch(/Found "NonMaterialClass".*: new NonMaterialClass\(\)/);

    expect(logOutput).toMatch(/Found "NativeDateAdapter".*super.*: super\(string, Platform\)/);
    expect(logOutput).toMatch(/Found "NativeDateAdapter".*: new \w+\(string, Platform\)/);

    expect(logOutput).toMatch(/Found "MatAutocomplete".*super.*: super\(any, any, string\[]\)/);
    expect(logOutput).toMatch(/Found "MatAutocomplete".*: new \w+\(any, any, string\[]\)/);

    expect(logOutput).toMatch(/Found "MatTooltip".*super.*: super\((any, ){10}{ opt1: string; }\)/);
    expect(logOutput).toMatch(/Found "MatTooltip".*: new \w+\((any, ){10}{ opt1: string; }\)/);

    expect(logOutput).toMatch(/Found "MatIconRegistry".*super.*: super\(any, any, Document\)/);
    expect(logOutput).toMatch(/Found "MatIconRegistry".*: new \w+\(any, any, Document\)/);

    expect(logOutput).toMatch(/Found "MatCalendar".*super.*: super\(any, any, any, any\)/);
    expect(logOutput).toMatch(/Found "MatCalendar".*: new \w+\(any, any, any, any\)/);

    expect(logOutput).toMatch(/Found "MatDrawerContent".*super.*: super\((any, ){4}any\)/);
    expect(logOutput).toMatch(/Found "MatDrawerContent".*: new \w+\((any, ){4}any\)/);

    expect(logOutput).toMatch(/Found "MatSidenavContent".*super.*: super\((any, ){4}any\)/);
    expect(logOutput).toMatch(/Found "MatSidenavContent".*: new \w+\((any, ){4}any\)/);

    expect(logOutput).toMatch(/Found "ExtendedDateAdapter".*super.*: super\(string, Platform\)/);
    expect(logOutput).toMatch(/Found "ExtendedDateAdapter".*: new \w+\(string, Platform\)/);

    removeTempDir();
  });
});


