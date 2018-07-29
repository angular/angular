import {SchematicTestRunner} from '@angular-devkit/schematics/testing';
import {Schema} from './schema';
import {getFileContent} from '@schematics/angular/utility/test';
import {collectionPath, createTestApp} from '../utils/testing';

describe('material-table-schematic', () => {
  let runner: SchematicTestRunner;

  const options: Schema = {
    name: 'foo',
    project: 'material',
    changeDetection: 'Default',
    styleext: 'css',
    spec: true,
    export: false,
  };

  beforeEach(() => {
    runner = new SchematicTestRunner('schematics', collectionPath);
  });

  // TODO(devversion): Temporarily disabled because @angular-devkit/schematics is not able to
  // find the template files for the schematic. As soon as we find a way to properly reference
  // those files, we can re-enable this test.
  xit('should create table files and add them to module', () => {
    const tree = runner.runSchematic('table', { ...options }, createTestApp());
    const files = tree.files;

    expect(files).toContain('/projects/material/src/app/foo/foo.component.css');
    expect(files).toContain('/projects/material/src/app/foo/foo.component.html');
    expect(files).toContain('/projects/material/src/app/foo/foo.component.spec.ts');
    expect(files).toContain('/projects/material/src/app/foo/foo.component.ts');
    expect(files).toContain('/projects/material/src/app/foo/foo-datasource.ts');

    const moduleContent = getFileContent(tree, '/projects/material/src/app/app.module.ts');
    expect(moduleContent).toMatch(/import.*Foo.*from '.\/foo\/foo.component'/);
    expect(moduleContent).toMatch(/declarations:\s*\[[^\]]+?,\r?\n\s+FooComponent\r?\n/m);

    const datasourceContent = getFileContent(tree,
        '/projects/material/src/app/foo/foo-datasource.ts');

    expect(datasourceContent).toContain('FooItem');
    expect(datasourceContent).toContain('FooDataSource');

    const componentContent = getFileContent(tree,
        '/projects/material/src/app/foo/foo.component.ts');

    expect(componentContent).toContain('FooDataSource');
  });

  it('should add table imports to module', () => {
    const tree = runner.runSchematic('table', { ...options }, createTestApp());
    const moduleContent = getFileContent(tree, '/projects/material/src/app/app.module.ts');

    expect(moduleContent).toContain('MatTableModule');
    expect(moduleContent).toContain('MatPaginatorModule');
    expect(moduleContent).toContain('MatSortModule');

    expect(moduleContent).toContain(
      `import { MatTableModule, MatPaginatorModule, MatSortModule } from '@angular/material';`);
  });

});
