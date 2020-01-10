import {Tree} from '@angular-devkit/schematics';
import {SchematicTestRunner} from '@angular-devkit/schematics/testing';
import {createTestApp, getFileContent} from '../testing';

describe('CDK ng-add', () => {
  let runner: SchematicTestRunner;
  let appTree: Tree;

  beforeEach(async () => {
    runner = new SchematicTestRunner('schematics', require.resolve('../collection.json'));
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
});
