import {SchematicTestRunner} from '@angular-devkit/schematics/testing';
import {join} from 'path';
import {Tree} from '@angular-devkit/schematics';
import {createTestApp} from '../utils/testing';
import {getFileContent} from '@schematics/angular/utility/test';

const collectionPath = join(__dirname, '../collection.json');

describe('material-table-schematic', () => {
  let runner: SchematicTestRunner;
  const options = {
    name: 'foo',
    path: 'app',
    sourceDir: 'src',
    inlineStyle: false,
    inlineTemplate: false,
    changeDetection: 'Default',
    styleext: 'css',
    spec: true,
    module: undefined,
    export: false,
    prefix: undefined,
    viewEncapsulation: undefined,
  };

  beforeEach(() => {
    runner = new SchematicTestRunner('schematics', collectionPath);
  });

  it('should create table files and add them to module', () => {
    const tree = runner.runSchematic('materialTable', { ...options }, createTestApp());
    const files = tree.files;

    expect(files).toContain('/src/app/foo/foo.component.css');
    expect(files).toContain('/src/app/foo/foo.component.html');
    expect(files).toContain('/src/app/foo/foo.component.spec.ts');
    expect(files).toContain('/src/app/foo/foo.component.ts');
    expect(files).toContain('/src/app/foo/foo-datasource.ts');

    const moduleContent = getFileContent(tree, '/src/app/app.module.ts');
    expect(moduleContent).toMatch(/import.*Foo.*from '.\/foo\/foo.component'/);
    expect(moduleContent).toMatch(/declarations:\s*\[[^\]]+?,\r?\n\s+FooComponent\r?\n/m);

    const datasourceContent = getFileContent(tree, '/src/app/foo/foo-datasource.ts');
    expect(datasourceContent).toContain('FooItem');
    expect(datasourceContent).toContain('FooDataSource');

    const componentContent = getFileContent(tree, '/src/app/foo/foo.component.ts');
    expect(componentContent).toContain('FooDataSource');
  });

  it('should add table imports to module', () => {
    const tree = runner.runSchematic('materialTable', { ...options }, createTestApp());
    const moduleContent = getFileContent(tree, '/src/app/app.module.ts');

    expect(moduleContent).toContain('MatTableModule');
    expect(moduleContent).toContain('MatPaginatorModule');
    expect(moduleContent).toContain('MatSortModule');

    expect(moduleContent).toContain(
      `import { MatTableModule, MatPaginatorModule, MatSortModule } from '@angular/material';`);
  });

});
