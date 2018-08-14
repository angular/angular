import {Tree} from '@angular-devkit/schematics';
import {SchematicTestRunner} from '@angular-devkit/schematics/testing';
import {getIndexHtmlPath} from './fonts/project-index-html';
import {getProjectFromWorkspace} from '../utils/get-project';
import {getFileContent} from '@schematics/angular/utility/test';
import {collectionPath, createTestApp} from '../test-setup/test-app';
import {getWorkspace} from '@schematics/angular/utility/config';
import {normalize} from '@angular-devkit/core';

describe('material-install-schematic', () => {
  let runner: SchematicTestRunner;
  let appTree: Tree;

  beforeEach(() => {
    appTree = createTestApp();
    runner = new SchematicTestRunner('schematics', collectionPath);
  });

  it('should update package.json', () => {
    const tree = runner.runSchematic('ng-add', {}, appTree);
    const packageJson = JSON.parse(getFileContent(tree, '/package.json'));
    const angularCoreVersion = packageJson.dependencies['@angular/core'];

    expect(packageJson.dependencies['@angular/material']).toBeDefined();
    expect(packageJson.dependencies['@angular/cdk']).toBeDefined();
    expect(packageJson.dependencies['@angular/animations']).toBe(angularCoreVersion,
      'Expected the @angular/animations package to have the same version as @angular/core.');
  });

  it('should add default theme', () => {
    const tree = runner.runSchematic('ng-add', {}, appTree);

    const workspace = getWorkspace(tree);
    const project = getProjectFromWorkspace(workspace);

    console.log(tree.files);

    expect(project.architect!['build']).toBeTruthy();
    expect(project.architect!['build']['options']).toBeTruthy();
    expect(project.architect!['build']['options']['styles']).toContain(
      './node_modules/@angular/material/prebuilt-themes/indigo-pink.css');
  });

  it('should support adding a custom theme', () => {
    // TODO(devversion): currently a "custom" theme does only work for projects using SCSS.
    // TODO(devversion): Throw an error if a custom theme is being installed in a CSS project.
    appTree = createTestApp({style: 'scss'});

    const tree = runner.runSchematic('ng-add', {theme: 'custom'}, appTree);

    const workspace = getWorkspace(tree);
    const project = getProjectFromWorkspace(workspace);
    const expectedStylesPath = normalize(`/${project.root}/src/styles.scss`);

    const buffer = tree.read(expectedStylesPath);
    const src = buffer!.toString();

    expect(src.indexOf(`@import '~@angular/material/theming';`)).toBeGreaterThan(-1);
    expect(src.indexOf(`$app-primary`)).toBeGreaterThan(-1);
  });

  it('should add font links', () => {
    const tree = runner.runSchematic('ng-add', {}, appTree);
    const workspace = getWorkspace(tree);
    const project = getProjectFromWorkspace(workspace);

    const indexPath = getIndexHtmlPath(project);
    const buffer = tree.read(indexPath)!;
    const htmlContent = buffer.toString();

    // Ensure that the indentation has been determined properly. We want to make sure that
    // the created links properly align with the existing HTML. Default CLI projects use an
    // indentation of two columns.
    expect(htmlContent).toContain(
      '  <link href="https://fonts.googleapis.com/icon?family=Material+Icons"');
    expect(htmlContent).toContain(
      '  <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500"');
  });
});
