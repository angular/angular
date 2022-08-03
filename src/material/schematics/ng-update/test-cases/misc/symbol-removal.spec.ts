import {runfiles} from '@bazel/runfiles';
import {createTestCaseSetup} from '@angular/cdk/schematics/testing';
import {MIGRATION_PATH} from '../../../paths';

describe('symbol removal check', () => {
  it('should report symbols that have been removed', async () => {
    const {runFixers} = await createTestCaseSetup('migration-v13', MIGRATION_PATH, [
      runfiles.resolvePackageRelative('test-cases/misc/symbol-removal_input.ts'),
    ]);

    const {logOutput} = await runFixers();

    expect(logOutput)
      .not.withContext('Expected check not to report symbols that have not been removed.')
      .toContain('MatRipple');

    expect(logOutput)
      .not.withContext(
        'Expected check not to report symbols with the same name as a ' +
          'removed symbol, but from a different module.',
      )
      .toContain('HasInitializedCtor');

    expect(logOutput)
      .withContext('Expected check to report a removed symbol')
      .toContain('@2:3 - `CanColorCtor` is no longer necessary and has been removed.');

    expect(logOutput)
      .withContext('Expected check to report a removed symbol that has been aliased')
      .toContain('@3:3 - `CanDisableRippleCtor` is no longer necessary and has been removed.');
  });
});
