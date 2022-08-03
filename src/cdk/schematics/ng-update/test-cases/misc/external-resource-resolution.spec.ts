import {runfiles} from '@bazel/runfiles';
import {MIGRATION_PATH} from '../../../paths';
import {createTestCaseSetup} from '../../../testing';

describe('ng-update external resource resolution', () => {
  it('should properly resolve referenced resources in components', async () => {
    const {runFixers, writeFile, appTree} = await createTestCaseSetup(
      'migration-v6',
      MIGRATION_PATH,
      [
        runfiles.resolvePackageRelative(
          'ng-update/test-cases/misc/external-resource-resolution_input.ts',
        ),
      ],
    );

    const testContent = `<div cdk-connected-overlay [origin]="test"></div>`;
    const expected = `<div cdk-connected-overlay [cdkConnectedOverlayOrigin]="test"></div>`;

    writeFile('/projects/material/test.html', testContent);
    writeFile('/projects/cdk-testing/src/some-tmpl.html', testContent);
    writeFile('/projects/cdk-testing/src/test-cases/local.html', testContent);

    await runFixers();

    expect(appTree.readContent('/projects/material/test.html'))
      .withContext('Expected absolute devkit tree paths to work.')
      .toBe(expected);
    expect(appTree.readContent('/projects/cdk-testing/src/some-tmpl.html'))
      .withContext('Expected relative paths with parent segments to work.')
      .toBe(expected);
    expect(appTree.readContent('/projects/cdk-testing/src/test-cases/local.html'))
      .withContext('Expected relative paths without explicit dot to work.')
      .toBe(expected);
  });
});
