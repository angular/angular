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

  it('should add table imports to module', () => {
    const tree = runner.runSchematic('table', baseOptions, createTestApp());
    const moduleContent = getFileContent(tree, '/projects/material/src/app/app.module.ts');

    expect(moduleContent).toContain('MatTableModule');
    expect(moduleContent).toContain('MatPaginatorModule');
    expect(moduleContent).toContain('MatSortModule');

    expect(moduleContent).toContain(
      `import { MatTableModule, MatPaginatorModule, MatSortModule } from '@angular/material';`);
  });

  describe('styleext option', () => {
    it('should respect the option value', () => {
      const tree = runner.runSchematic(
          'table', {styleext: 'scss', ...baseOptions}, createTestApp());

      expect(tree.files).toContain('/projects/material/src/app/foo/foo.component.scss');
    });

    it('should fallback to the @schematics/angular:component option value', () => {
      const tree = runner.runSchematic('table', baseOptions, createTestApp({style: 'less'}));

      expect(tree.files).toContain('/projects/material/src/app/foo/foo.component.less');
    });
  });

  describe('inlineStyle option', () => {
    it('should respect the option value', () => {
      const tree = runner.runSchematic(
          'table', {inlineStyle: true, ...baseOptions}, createTestApp());

      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.css');
    });

    it('should fallback to the @schematics/angular:component option value', () => {
      const tree = runner.runSchematic('table', baseOptions, createTestApp({inlineStyle: true}));

      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.css');
    });
  });

  describe('inlineTemplate option', () => {
    it('should respect the option value', () => {
      const tree = runner.runSchematic(
          'table', {inlineTemplate: true, ...baseOptions}, createTestApp());

      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.html');
    });

    it('should fallback to the @schematics/angular:component option value', () => {
      const tree = runner.runSchematic(
          'table', baseOptions, createTestApp({inlineTemplate: true}));

      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.html');
    });
  });

  describe('spec option', () => {
    it('should respect the option value', () => {
      const tree = runner.runSchematic('table', {spec: false, ...baseOptions}, createTestApp());

      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.spec.ts');
    });

    it('should fallback to the @schematics/angular:component option value', () => {
      const tree = runner.runSchematic('table', baseOptions, createTestApp({skipTests: true}));

      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.spec.ts');
    });
  });
});
