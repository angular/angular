import {SchematicTestRunner} from '@angular-devkit/schematics/testing';
import {getProjectFromWorkspace} from '@angular/cdk/schematics';
import {getWorkspace} from '@schematics/angular/utility/config';
import {COLLECTION_PATH} from '../../index.spec';
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
    runner = new SchematicTestRunner('schematics', COLLECTION_PATH);
  });

  it('should create drag-drop files and add them to module', async () => {
    const app = await createTestApp(runner);
    const tree = await runner.runSchematicAsync('drag-drop', baseOptions, app).toPromise();
    const moduleContent = getFileContent(tree, '/projects/material/src/app/app.module.ts');
    const files = tree.files;

    expect(files).toContain('/projects/material/src/app/foo/foo.component.css');
    expect(files).toContain('/projects/material/src/app/foo/foo.component.html');
    expect(files).toContain('/projects/material/src/app/foo/foo.component.spec.ts');
    expect(files).toContain('/projects/material/src/app/foo/foo.component.ts');

    expect(moduleContent).toMatch(/import.*Foo.*from '.\/foo\/foo.component'/);
    expect(moduleContent).toMatch(/declarations:\s*\[[^\]]+?,\r?\n\s+FooComponent\r?\n/m);
  });

  it('should add drag-drop module', async () => {
    const app = await createTestApp(runner);
    const tree = await runner.runSchematicAsync('drag-drop', baseOptions, app).toPromise();
    const moduleContent = getFileContent(tree, '/projects/material/src/app/app.module.ts');

    expect(moduleContent).toContain('DragDropModule');
  });

  describe('style option', () => {
    it('should respect the option value', async () => {
      const tree =
          await runner
              .runSchematicAsync(
                  'drag-drop', {style: 'scss', ...baseOptions}, await createTestApp(runner))
              .toPromise();

      expect(tree.files).toContain('/projects/material/src/app/foo/foo.component.scss');
    });

    it('should respect the deprecated "styleext" option value', async () => {
      let tree = await createTestApp(runner);
      const workspace = getWorkspace(tree);
      const project = getProjectFromWorkspace(workspace);

      // We need to specify the default component options by overwriting
      // the existing workspace configuration because passing the "styleext"
      // option is no longer supported. Though we want to verify that we
      // properly handle old CLI projects which still use the "styleext" option.
      project.schematics!['@schematics/angular:component'] = {styleext: 'scss'};

      tree.overwrite('angular.json', JSON.stringify(workspace));
      tree = await runner.runSchematicAsync('drag-drop', baseOptions, tree).toPromise();

      expect(tree.files).toContain('/projects/material/src/app/foo/foo.component.scss');
    });

    it('should not generate invalid stylesheets', async () => {
      const tree =
          await runner
              .runSchematicAsync(
                  'drag-drop', {style: 'styl', ...baseOptions}, await createTestApp(runner))
              .toPromise();

      // In this case we expect the schematic to generate a plain "css" file because
      // the component schematics are using CSS style templates which are not compatible
      // with all CLI supported styles (e.g. Stylus or Sass)
      expect(tree.files)
          .toContain(
              '/projects/material/src/app/foo/foo.component.css',
              'Expected the schematic to generate a plain "css" file.');
      expect(tree.files)
          .not.toContain(
              '/projects/material/src/app/foo/foo.component.styl',
              'Expected the schematic to not generate a "stylus" file');
    });

    it('should fall back to the @schematics/angular:component option value', async () => {
      const tree = await runner
                       .runSchematicAsync(
                           'drag-drop', baseOptions, await createTestApp(runner, {style: 'less'}))
                       .toPromise();

      expect(tree.files).toContain('/projects/material/src/app/foo/foo.component.less');
    });
  });

  describe('inlineStyle option', () => {
    it('should respect the option value', async () => {
      const app = await createTestApp(runner);
      const tree =
          await runner.runSchematicAsync('drag-drop', {inlineStyle: true, ...baseOptions}, app)
              .toPromise();

      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.css');
    });

    it('should fall back to the @schematics/angular:component option value', async () => {
      const tree =
          await runner
              .runSchematicAsync(
                  'drag-drop', baseOptions, await createTestApp(runner, {inlineStyle: true}))
              .toPromise();

      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.css');
    });
  });

  describe('inlineTemplate option', () => {
    it('should respect the option value', async () => {
      const app = await createTestApp(runner);
      const tree =
          await runner.runSchematicAsync('drag-drop', {inlineTemplate: true, ...baseOptions}, app)
              .toPromise();

      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.html');
    });

    it('should fall back to the @schematics/angular:component option value', async () => {
      const app = await createTestApp(runner, {inlineTemplate: true});
      const tree = await runner.runSchematicAsync('drag-drop', baseOptions, app).toPromise();

      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.html');
    });
  });

  describe('skipTests option', () => {
    it('should respect the option value', async () => {
      const tree =
          await runner
              .runSchematicAsync(
                  'drag-drop', {skipTests: true, ...baseOptions}, await createTestApp(runner))
              .toPromise();

      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.spec.ts');
    });

    it('should respect the deprecated global "spec" option value', async () => {
      let tree = await createTestApp(runner);
      const workspace = getWorkspace(tree);
      const project = getProjectFromWorkspace(workspace);

      // We need to specify the default component options by overwriting
      // the existing workspace configuration because passing the "spec"
      // option is no longer supported. Though we want to verify that we
      // properly handle old CLI projects which still use the "spec" option.
      project.schematics!['@schematics/angular:component'] = {spec: false};

      tree.overwrite('angular.json', JSON.stringify(workspace));
      tree = await runner.runSchematicAsync('drag-drop', baseOptions, tree).toPromise();

      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.spec.ts');
    });

    it('should fall back to the @schematics/angular:component option value', async () => {
      const tree = await runner
                       .runSchematicAsync(
                           'drag-drop', baseOptions, await createTestApp(runner, {skipTests: true}))
                       .toPromise();

      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.spec.ts');
    });
  });
});
