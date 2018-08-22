import {Tree} from '@angular-devkit/schematics';
import {SchematicTestRunner} from '@angular-devkit/schematics/testing';
import {getProjectStyleFile} from '@angular/material/schematics/utils/project-style-file';
import {getIndexHtmlPath} from './fonts/project-index-html';
import {getProjectFromWorkspace} from '../utils/get-project';
import {getFileContent} from '@schematics/angular/utility/test';
import {collectionPath, createTestApp} from '../test-setup/test-app';
import {getWorkspace, WorkspaceProject} from '@schematics/angular/utility/config';
import {normalize} from '@angular-devkit/core';

describe('material-install-schematic', () => {
  let runner: SchematicTestRunner;
  let appTree: Tree;

  beforeEach(() => {
    appTree = createTestApp();
    runner = new SchematicTestRunner('schematics', collectionPath);
  });

  /** Expects the given file to be in the styles of the specified workspace project. */
  function expectProjectStyleFile(project: WorkspaceProject, filePath: string) {
    const architect = project.architect!;

    expect(architect!['build']).toBeTruthy();
    expect(architect!['build']['options']).toBeTruthy();
    expect(architect!['build']['options']['styles']).toContain(filePath,
        `Expected "${filePath}" to be added to the project styles in the workspace.`);
  }

  it('should update package.json', () => {
    const tree = runner.runSchematic('ng-add', {}, appTree);
    const packageJson = JSON.parse(getFileContent(tree, '/package.json'));
    const angularCoreVersion = packageJson.dependencies['@angular/core'];

    expect(packageJson.dependencies['@angular/material']).toBeDefined();
    expect(packageJson.dependencies['@angular/cdk']).toBeDefined();
    expect(packageJson.dependencies['hammerjs']).toBeDefined();
    expect(packageJson.dependencies['@angular/animations']).toBe(angularCoreVersion,
      'Expected the @angular/animations package to have the same version as @angular/core.');
  });

  it('should add hammerjs import to project main file', () => {
    const tree = runner.runSchematic('ng-add', {}, appTree);
    const fileContent = getFileContent(tree, '/projects/material/src/main.ts');

    expect(fileContent).toContain(`import 'hammerjs';`,
      'Expected the project main file to contain a HammerJS import.');
  });

  it('should add default theme', () => {
    const tree = runner.runSchematic('ng-add', {}, appTree);

    const workspace = getWorkspace(tree);
    const project = getProjectFromWorkspace(workspace);

    expectProjectStyleFile(project,
        './node_modules/@angular/material/prebuilt-themes/indigo-pink.css');
  });

  it('should support adding a custom theme', () => {
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

  it('should create a custom theme file if no SCSS file could be found', () => {
    appTree = createTestApp({style: 'css'});

    const tree = runner.runSchematic('ng-add', {theme: 'custom'}, appTree);
    const workspace = getWorkspace(tree);
    const project = getProjectFromWorkspace(workspace);
    const expectedStylesPath = normalize(`/${project.root}/src/custom-theme.scss`);

    expect(tree.files).toContain(expectedStylesPath, 'Expected a custom theme file to be created');
    expectProjectStyleFile(project, 'projects/material/src/custom-theme.scss');
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

  it('should add material app styles', () => {
    const tree = runner.runSchematic('ng-add', {}, appTree);
    const workspace = getWorkspace(tree);
    const project = getProjectFromWorkspace(workspace);

    const defaultStylesPath = getProjectStyleFile(project);
    const htmlContent = tree.read(defaultStylesPath)!.toString();

    expect(htmlContent).toContain('html, body { height: 100%; }');
    expect(htmlContent).toContain(
        'body { margin: 0; font-family: Roboto, "Helvetica Neue", sans-serif; }');
  });

  describe('gestures disabled', () => {

    it('should not add hammerjs to package.json', () => {
      const tree = runner.runSchematic('ng-add', {gestures: false}, appTree);
      const packageJson = JSON.parse(getFileContent(tree, '/package.json'));

      expect(packageJson.dependencies['hammerjs'])
        .toBeUndefined(`Expected 'hammerjs' to be not added to the package.json`);
    });

    it('should not add hammerjs import to project main file', () => {
      const tree = runner.runSchematic('ng-add', {gestures: false}, appTree);
      const fileContent = getFileContent(tree, '/projects/material/src/main.ts');

      expect(fileContent).not.toContain(`import 'hammerjs';`,
        'Expected the project main file to not contain a HammerJS import.');
    });
  });
});
