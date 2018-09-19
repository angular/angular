import {SchematicTestRunner} from '@angular-devkit/schematics/testing';
import {collectionPath, createTestApp} from '../test-setup/test-app';
import {getFileContent} from '@schematics/angular/utility/test';
import {Schema} from './schema';

describe('Material tree schematic', () => {
  let runner: SchematicTestRunner;

  const baseOptions: Schema = {
    name: 'foo',
    project: 'material',
  };

  beforeEach(() => {
    runner = new SchematicTestRunner('schematics', collectionPath);
  });

  it('should create tree component files and add them to module', () => {
    const tree = runner.runSchematic('tree', baseOptions, createTestApp());
    const files = tree.files;

    expect(files).toContain('/projects/material/src/app/foo/foo.component.css');
    expect(files).toContain('/projects/material/src/app/foo/foo.component.html');
    expect(files).toContain('/projects/material/src/app/foo/foo.component.spec.ts');
    expect(files).toContain('/projects/material/src/app/foo/foo.component.ts');

    const moduleContent = getFileContent(tree, '/projects/material/src/app/app.module.ts');
    expect(moduleContent).toMatch(/import.*Foo.*from '.\/foo\/foo.component'/);
    expect(moduleContent).toMatch(/declarations:\s*\[[^\]]+?,\r?\n\s+FooComponent\r?\n/m);
  });

  it('should add tree imports to module', () => {
    const tree = runner.runSchematic('tree', baseOptions, createTestApp());
    const moduleContent = getFileContent(tree, '/projects/material/src/app/app.module.ts');

    expect(moduleContent).toContain('MatTreeModule');
    expect(moduleContent).toContain('MatIconModule');
    expect(moduleContent).toContain('MatButtonModule');
  });

  describe('styleext option', () => {
    it('should respect the option value', () => {
      const tree = runner.runSchematic(
          'tree', {styleext: 'scss', ...baseOptions}, createTestApp());

      expect(tree.files).toContain('/projects/material/src/app/foo/foo.component.scss');
    });

    it('should fallback to the @schematics/angular:component option value', () => {
      const tree = runner.runSchematic('tree', baseOptions, createTestApp({style: 'less'}));

      expect(tree.files).toContain('/projects/material/src/app/foo/foo.component.less');
    });
  });

  describe('inlineStyle option', () => {
    it('should respect the option value', () => {
      const tree = runner.runSchematic(
          'tree', {inlineStyle: true, ...baseOptions}, createTestApp());

      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.css');
    });

    it('should fallback to the @schematics/angular:component option value', () => {
      const tree = runner.runSchematic('tree', baseOptions, createTestApp({inlineStyle: true}));
      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.css');
    });
  });

  describe('inlineTemplate option', () => {
    it('should respect the option value', () => {
      const tree = runner.runSchematic(
          'tree', {inlineTemplate: true, ...baseOptions}, createTestApp());

      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.html');
    });

    it('should fallback to the @schematics/angular:component option value', () => {
      const tree = runner.runSchematic(
          'tree', baseOptions, createTestApp({inlineTemplate: true}));

      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.html');
    });
  });

  describe('spec option', () => {
    it('should respect the option value', () => {
      const tree = runner.runSchematic('tree', {spec: false, ...baseOptions}, createTestApp());
      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.spec.ts');
    });

    it('should fallback to the @schematics/angular:component option value', () => {
      const tree = runner.runSchematic('tree', baseOptions, createTestApp({skipTests: true}));
      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.spec.ts');
    });
  });
});
