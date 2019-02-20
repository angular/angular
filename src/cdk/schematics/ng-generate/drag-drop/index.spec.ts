import {SchematicTestRunner} from '@angular-devkit/schematics/testing';
import {createTestApp, getFileContent} from '../../testing';
import {Schema} from './schema';

describe('CDK drag-drop schematic', () => {
  let runner: SchematicTestRunner;

  const baseOptions: Schema = {
    name: 'foo',
    // TODO(devversion): rename project to something that is not tied to Material. This involves
    // updating the other tests as well because `createTestApp` is responsible for creating
    // the project.
    project: 'material',
  };

  beforeEach(() => {
    runner = new SchematicTestRunner('schematics', require.resolve('../../collection.json'));
  });

  it('should create drag-drop files and add them to module', () => {
    const tree = runner.runSchematic('drag-drop', baseOptions, createTestApp(runner));
    const moduleContent = getFileContent(tree, '/projects/material/src/app/app.module.ts');
    const files = tree.files;

    expect(files).toContain('/projects/material/src/app/foo/foo.component.css');
    expect(files).toContain('/projects/material/src/app/foo/foo.component.html');
    expect(files).toContain('/projects/material/src/app/foo/foo.component.spec.ts');
    expect(files).toContain('/projects/material/src/app/foo/foo.component.ts');

    expect(moduleContent).toMatch(/import.*Foo.*from '.\/foo\/foo.component'/);
    expect(moduleContent).toMatch(/declarations:\s*\[[^\]]+?,\r?\n\s+FooComponent\r?\n/m);
  });

  it('should add drag-drop module', () => {
    const tree = runner.runSchematic('drag-drop', baseOptions, createTestApp(runner));
    const moduleContent = getFileContent(tree, '/projects/material/src/app/app.module.ts');

    expect(moduleContent).toContain('DragDropModule');
  });

  describe('styleext option', () => {
    it('should respect the option value', () => {
      const tree = runner.runSchematic(
          'drag-drop', {styleext: 'scss', ...baseOptions}, createTestApp(runner));

      expect(tree.files).toContain('/projects/material/src/app/foo/foo.component.scss');
    });

    it('should not generate invalid stylesheets', () => {
      const tree = runner.runSchematic(
          'drag-drop', {styleext: 'styl', ...baseOptions}, createTestApp(runner));

      // In this case we expect the schematic to generate a plain "css" file because
      // the component schematics are using CSS style templates which are not compatible
      // with all CLI supported styles (e.g. Stylus or Sass)
      expect(tree.files).toContain('/projects/material/src/app/foo/foo.component.css',
          'Expected the schematic to generate a plain "css" file.');
      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.styl',
        'Expected the schematic to not generate a "stylus" file');
    });

    it('should fall back to the @schematics/angular:component option value', () => {
      const tree = runner.runSchematic(
          'drag-drop', baseOptions, createTestApp(runner, {style: 'less'}));

      expect(tree.files).toContain('/projects/material/src/app/foo/foo.component.less');
    });
  });

  describe('inlineStyle option', () => {
    it('should respect the option value', () => {
      const tree = runner.runSchematic(
          'drag-drop', {inlineStyle: true, ...baseOptions}, createTestApp(runner));

      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.css');
    });

    it('should fall back to the @schematics/angular:component option value', () => {
      const tree = runner.runSchematic(
          'drag-drop', baseOptions, createTestApp(runner, {inlineStyle: true}));

      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.css');
    });
  });

  describe('inlineTemplate option', () => {
    it('should respect the option value', () => {
      const tree = runner.runSchematic(
          'drag-drop', {inlineTemplate: true, ...baseOptions}, createTestApp(runner));

      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.html');
    });

    it('should fall back to the @schematics/angular:component option value', () => {
      const tree = runner.runSchematic(
          'drag-drop', baseOptions, createTestApp(runner, {inlineTemplate: true}));

      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.html');
    });
  });

  describe('spec option', () => {
    it('should respect the option value', () => {
      const tree = runner.runSchematic(
          'drag-drop', {spec: false, ...baseOptions}, createTestApp(runner));

      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.spec.ts');
    });

    it('should fall back to the @schematics/angular:component option value', () => {
      const tree = runner.runSchematic(
          'drag-drop', baseOptions, createTestApp(runner, {skipTests: true}));

      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.spec.ts');
    });
  });
});
