import {SchematicTestRunner} from '@angular-devkit/schematics/testing';
import {Schema} from './schema';
import {getFileContent} from '@schematics/angular/utility/test';
import {collectionPath, createTestApp} from '../test-setup/test-app';

describe('material-table-schematic', () => {
  let runner: SchematicTestRunner;

  const baseOptions: Schema = {
    name: 'foo',
    project: 'material',
  };

  beforeEach(() => {
    runner = new SchematicTestRunner('schematics', collectionPath);
  });

  it('should create table files and add them to module', () => {
    const tree = runner.runSchematic('table', baseOptions, createTestApp());
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

  it('should support passing the style extension option', () => {
    const tree = runner.runSchematic('table', {styleext: 'scss', ...baseOptions}, createTestApp());

    expect(tree.files).toContain('/projects/material/src/app/foo/foo.component.scss');
  });

  it('should fallback to the default angular:component style extension', () => {
    const tree = runner.runSchematic('table', baseOptions, createTestApp({style: 'less'}));

    expect(tree.files).toContain('/projects/material/src/app/foo/foo.component.less');
  });

  it('should add table imports to module', () => {
    const tree = runner.runSchematic('table', baseOptions, createTestApp());
    const moduleContent = getFileContent(tree, '/projects/material/src/app/app.module.ts');

    expect(moduleContent).toContain('MatTableModule');
    expect(moduleContent).toContain('MatPaginatorModule');
    expect(moduleContent).toContain('MatSortModule');

    expect(moduleContent).toContain(
      `import { MatTableModule, MatPaginatorModule, MatSortModule } from '@angular/material';`);
  });

});
