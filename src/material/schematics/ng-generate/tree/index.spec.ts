import {SchematicTestRunner} from '@angular-devkit/schematics/testing';
import {createTestApp, getFileContent} from '@angular/cdk/schematics/testing';
import {COLLECTION_PATH} from '../../index.spec';
import {Schema} from './schema';

describe('Material tree schematic', () => {
  let runner: SchematicTestRunner;

  const baseOptions: Schema = {
    name: 'foo',
    project: 'material',
  };

  beforeEach(() => {
    runner = new SchematicTestRunner('schematics', COLLECTION_PATH);
  });

  it('should create tree component files and add them to module', async () => {
    const app = await createTestApp(runner);
    const tree = await runner.runSchematicAsync('tree', baseOptions, app).toPromise();
    const files = tree.files;

    expect(files).toContain('/projects/material/src/app/foo/foo.component.css');
    expect(files).toContain('/projects/material/src/app/foo/foo.component.html');
    expect(files).toContain('/projects/material/src/app/foo/foo.component.spec.ts');
    expect(files).toContain('/projects/material/src/app/foo/foo.component.ts');

    const moduleContent = getFileContent(tree, '/projects/material/src/app/app.module.ts');
    expect(moduleContent).toMatch(/import.*Foo.*from '.\/foo\/foo.component'/);
    expect(moduleContent).toMatch(/declarations:\s*\[[^\]]+?,\r?\n\s+FooComponent\r?\n/m);
  });

  it('should add tree imports to module', async () => {
    const app = await createTestApp(runner);
    const tree = await runner.runSchematicAsync('tree', baseOptions, app).toPromise();
    const moduleContent = getFileContent(tree, '/projects/material/src/app/app.module.ts');

    expect(moduleContent).toContain('MatTreeModule');
    expect(moduleContent).toContain('MatIconModule');
    expect(moduleContent).toContain('MatButtonModule');
  });

  it('should throw if no name has been specified', async () => {
    const appTree = await createTestApp(runner);

    await expectAsync(runner.runSchematicAsync('tree', {project: 'material'}, appTree).toPromise())
      .toBeRejectedWithError(/required property 'name'/);
  });

  describe('style option', () => {
    it('should respect the option value', async () => {
      const tree = await runner
                       .runSchematicAsync(
                           'tree', {style: 'scss', ...baseOptions}, await createTestApp(runner))
                       .toPromise();

      expect(tree.files).toContain('/projects/material/src/app/foo/foo.component.scss');
    });

    it('should fall back to the @schematics/angular:component option value', async () => {
      const tree =
          await runner
              .runSchematicAsync('tree', baseOptions, await createTestApp(runner, {style: 'less'}))
              .toPromise();

      expect(tree.files).toContain('/projects/material/src/app/foo/foo.component.less');
    });
  });

  describe('inlineStyle option', () => {
    it('should respect the option value', async () => {
      const tree = await runner
                       .runSchematicAsync(
                           'tree', {inlineStyle: true, ...baseOptions}, await createTestApp(runner))
                       .toPromise();

      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.css');
    });

    it('should fall back to the @schematics/angular:component option value', async () => {
      const tree = await runner
                       .runSchematicAsync(
                           'tree', baseOptions, await createTestApp(runner, {inlineStyle: true}))
                       .toPromise();

      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.css');
    });
  });

  describe('inlineTemplate option', () => {
    it('should respect the option value', async () => {
      const tree =
          await runner
              .runSchematicAsync(
                  'tree', {inlineTemplate: true, ...baseOptions}, await createTestApp(runner))
              .toPromise();

      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.html');
    });

    it('should fall back to the @schematics/angular:component option value', async () => {
      const tree = await runner
                       .runSchematicAsync(
                           'tree', baseOptions, await createTestApp(runner, {inlineTemplate: true}))
                       .toPromise();

      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.html');
    });
  });

  describe('skipTests option', () => {
    it('should respect the option value', async () => {
      const tree = await runner
                       .runSchematicAsync(
                           'tree', {skipTests: true, ...baseOptions}, await createTestApp(runner))
                       .toPromise();

      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.spec.ts');
    });

    it('should fall back to the @schematics/angular:component option value', async () => {
      const tree = await runner
                       .runSchematicAsync(
                           'tree', baseOptions, await createTestApp(runner, {skipTests: true}))
                       .toPromise();

      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.spec.ts');
    });
  });
});
