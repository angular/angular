import {runfiles} from '@bazel/runfiles';
import {createTestCaseSetup} from '@angular/cdk/schematics/testing';
import {MIGRATION_PATH} from '../../../paths';

describe('constructor checks', () => {
  it('should properly report invalid constructor expression signatures', async () => {
    const {runFixers} = await createTestCaseSetup('migration-v6', MIGRATION_PATH, [
      runfiles.resolvePackageRelative('test-cases/misc/constructor-checks_input.ts'),
    ]);

    const {logOutput} = await runFixers();

    expect(logOutput)
      .withContext('Expected the constructor checks to report if an argument is not assignable.')
      .toMatch(/@22:13 - Found "NativeDateAdapter"/);
    expect(logOutput)
      .not.withContext('Expected the constructor to not report if an argument is assignable.')
      .toMatch(/@24.*Found "NativeDateAdapter".*/);

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
  });
});
