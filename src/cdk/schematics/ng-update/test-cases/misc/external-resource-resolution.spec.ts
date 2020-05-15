import {resolveBazelPath} from '@angular/cdk/schematics/testing';
import {MIGRATION_PATH} from '../../../index.spec';
import {createTestCaseSetup} from '../../../testing';

describe('ng-update external resource resolution', () => {

  it('should properly resolve referenced resources in components', async () => {
    const {runFixers, writeFile, removeTempDir, appTree} = await createTestCaseSetup(
      'migration-v6', MIGRATION_PATH,
      [resolveBazelPath(__dirname, './external-resource-resolution_input.ts')]);

    const testContent = `<div cdk-connected-overlay [origin]="test"></div>`;
    const expected = `<div cdk-connected-overlay [cdkConnectedOverlayOrigin]="test"></div>`;

    writeFile('/projects/material/test.html', testContent);
    writeFile('/projects/cdk-testing/src/some-tmpl.html', testContent);
    writeFile('/projects/cdk-testing/src/test-cases/local.html', testContent);

    await runFixers();

    expect(appTree.readContent('/projects/material/test.html'))
        .toBe(expected, 'Expected absolute devkit tree paths to work.');
    expect(appTree.readContent('/projects/cdk-testing/src/some-tmpl.html'))
        .toBe(expected, 'Expected relative paths with parent segments to work.');
    expect(appTree.readContent('/projects/cdk-testing/src/test-cases/local.html'))
        .toBe(expected, 'Expected relative paths without explicit dot to work.');

    removeTempDir();
  });
});
