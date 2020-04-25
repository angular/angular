import {Tree} from '@angular-devkit/schematics';
import {SchematicTestRunner} from '@angular-devkit/schematics/testing';
import {COLLECTION_PATH} from '../index.spec';
import {createTestApp, getFileContent} from '../testing';
import {addPackageToPackageJson} from './package-config';

describe('CDK ng-add', () => {
  let runner: SchematicTestRunner;
  let appTree: Tree;

  beforeEach(async () => {
    runner = new SchematicTestRunner('schematics', COLLECTION_PATH);
    appTree = await createTestApp(runner);
  });

  it('should update the package.json', async () => {
    const tree = await runner.runSchematicAsync('ng-add', {}, appTree).toPromise();
    const packageJson = JSON.parse(getFileContent(tree, '/package.json'));
    const dependencies = packageJson.dependencies;

    expect(dependencies['@angular/cdk']).toBe('~0.0.0-PLACEHOLDER');
    expect(Object.keys(dependencies))
        .toEqual(
            Object.keys(dependencies).sort(),
            'Expected the modified "dependencies" to be sorted alphabetically.');
    expect(runner.tasks.some(task => task.name === 'node-package')).toBe(true,
      'Expected the package manager to be scheduled in order to update lock files.');
  });

  it('should respect version range from CLI ng-add command', async () => {
    // Simulates the behavior of the CLI `ng add` command. The command inserts the
    // requested package version into the `package.json` before the actual schematic runs.
    addPackageToPackageJson(appTree, '@angular/cdk', '^9.0.0');

    const tree = await runner.runSchematicAsync('ng-add', {}, appTree).toPromise();
    const packageJson = JSON.parse(getFileContent(tree, '/package.json'));
    const dependencies = packageJson.dependencies;

    expect(dependencies['@angular/cdk']).toBe('^9.0.0');
    expect(runner.tasks.some(task => task.name === 'node-package')).toBe(false,
      'Expected the package manager to not run since the CDK version was already inserted.');
  });
});
