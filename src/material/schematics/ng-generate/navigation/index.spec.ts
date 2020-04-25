import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {createTestApp, getFileContent} from '@angular/cdk/schematics/testing';
import {COLLECTION_PATH} from '../../index.spec';

import {Schema} from './schema';

describe('material-navigation-schematic', () => {
  let runner: SchematicTestRunner;

  const baseOptions: Schema = {
    name: 'foo',
    project: 'material',
  };

  beforeEach(() => {
    runner = new SchematicTestRunner('schematics', COLLECTION_PATH);
  });

  function expectNavigationSchematicModuleImports(tree: UnitTestTree) {
    const moduleContent = getFileContent(tree, '/projects/material/src/app/app.module.ts');
    expect(moduleContent).toMatch(/LayoutModule,\s+/);
    expect(moduleContent).toMatch(/MatToolbarModule,\s+/);
    expect(moduleContent).toMatch(/MatButtonModule,\s+/);
    expect(moduleContent).toMatch(/MatSidenavModule,\s+/);
    expect(moduleContent).toMatch(/MatIconModule,\s+/);
    expect(moduleContent).toMatch(/MatListModule\s+],/);
    expect(moduleContent).toContain(`import { LayoutModule } from '@angular/cdk/layout';`);
    expect(moduleContent).toContain(`import { MatButtonModule } from '@angular/material/button';`);
    expect(moduleContent).toContain(`import { MatIconModule } from '@angular/material/icon';`);
    expect(moduleContent).toContain(`import { MatListModule } from '@angular/material/list';`);
    expect(moduleContent)
        .toContain(`import { MatToolbarModule } from '@angular/material/toolbar';`);
    expect(moduleContent)
        .toContain(`import { MatSidenavModule } from '@angular/material/sidenav';`);
  }

  it('should create navigation files and add them to module', async () => {
    const app = await createTestApp(runner);
    const tree = await runner.runSchematicAsync('navigation', baseOptions, app).toPromise();
    const files = tree.files;

    expect(files).toContain('/projects/material/src/app/foo/foo.component.css');
    expect(files).toContain('/projects/material/src/app/foo/foo.component.html');
    expect(files).toContain('/projects/material/src/app/foo/foo.component.spec.ts');
    expect(files).toContain('/projects/material/src/app/foo/foo.component.ts');

    const moduleContent = getFileContent(tree, '/projects/material/src/app/app.module.ts');
    expect(moduleContent).toMatch(/import.*Foo.*from '.\/foo\/foo.component'/);
    expect(moduleContent).toMatch(/declarations:\s*\[[^\]]+?,\r?\n\s+FooComponent\r?\n/m);
  });

  it('should add navigation imports to module', async () => {
    const app = await createTestApp(runner);
    const tree = await runner.runSchematicAsync('navigation', baseOptions, app).toPromise();
    expectNavigationSchematicModuleImports(tree);
  });

  it('should support `nav` as schematic alias', async () => {
    const app = await createTestApp(runner);
    const tree = await runner.runSchematicAsync('nav', baseOptions, app).toPromise();
    expectNavigationSchematicModuleImports(tree);
  });

  it('should throw if no name has been specified', async () => {
    const appTree = await createTestApp(runner);

    await expectAsync(
        runner.runSchematicAsync('navigation', {project: 'material'}, appTree).toPromise())
      .toBeRejectedWithError(/required property 'name'/);
  });

  describe('style option', () => {
    it('should respect the option value', async () => {
      const tree =
          await runner
              .runSchematicAsync(
                  'navigation', {style: 'scss', ...baseOptions}, await createTestApp(runner))
              .toPromise();

      expect(tree.files).toContain('/projects/material/src/app/foo/foo.component.scss');
    });

    it('should fall back to the @schematics/angular:component option value', async () => {
      const tree = await runner
                       .runSchematicAsync(
                           'navigation', baseOptions, await createTestApp(runner, {style: 'less'}))
                       .toPromise();

      expect(tree.files).toContain('/projects/material/src/app/foo/foo.component.less');
    });
  });

  describe('inlineStyle option', () => {
    it('should respect the option value', async () => {
      const tree =
          await runner
              .runSchematicAsync(
                  'navigation', {inlineStyle: true, ...baseOptions}, await createTestApp(runner))
              .toPromise();

      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.css');
    });

    it('should fall back to the @schematics/angular:component option value', async () => {
      const tree =
          await runner
              .runSchematicAsync(
                  'navigation', baseOptions, await createTestApp(runner, {inlineStyle: true}))
              .toPromise();

      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.css');
    });
  });

  describe('inlineTemplate option', () => {
    it('should respect the option value', async () => {
      const tree =
          await runner
              .runSchematicAsync(
                  'navigation', {inlineTemplate: true, ...baseOptions}, await createTestApp(runner))
              .toPromise();

      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.html');
    });

    it('should fall back to the @schematics/angular:component option value', async () => {
      const tree =
          await runner
              .runSchematicAsync(
                  'navigation', baseOptions, await createTestApp(runner, {inlineTemplate: true}))
              .toPromise();

      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.html');
    });
  });

  describe('skipTests option', () => {
    it('should respect the option value', async () => {
      const tree =
          await runner
              .runSchematicAsync(
                  'navigation', {skipTests: true, ...baseOptions}, await createTestApp(runner))
              .toPromise();

      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.spec.ts');
    });

    it('should fall back to the @schematics/angular:component option value', async () => {
      const tree =
          await runner
              .runSchematicAsync(
                  'navigation', baseOptions, await createTestApp(runner, {skipTests: true}))
              .toPromise();

      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.spec.ts');
    });
  });
});
