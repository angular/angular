import {normalize} from '@angular-devkit/core';
import {WorkspaceProject} from '@angular-devkit/core/src/workspace';
import {Tree} from '@angular-devkit/schematics';
import {SchematicTestRunner} from '@angular-devkit/schematics/testing';
import {
  addModuleImportToRootModule,
  createTestApp,
  getProjectFromWorkspace,
  getProjectStyleFile,
  getProjectTargetOptions,
} from '@angular/cdk/schematics';
import {getWorkspace} from '@schematics/angular/utility/config';
import {getFileContent} from '@schematics/angular/utility/test';
import {getIndexHtmlPath} from './fonts/project-index-html';

describe('ng-add schematic', () => {
  let runner: SchematicTestRunner;
  let appTree: Tree;

  beforeEach(() => {
    runner = new SchematicTestRunner('schematics', require.resolve('../collection.json'));
    appTree = createTestApp(runner);
  });

  /** Expects the given file to be in the styles of the specified workspace project. */
  function expectProjectStyleFile(project: WorkspaceProject, filePath: string) {
    expect(getProjectTargetOptions(project, 'build').styles).toContain(filePath,
        `Expected "${filePath}" to be added to the project styles in the workspace.`);
  }

  /** Removes the specified dependency from the /package.json in the given tree. */
  function removePackageJsonDependency(tree: Tree, dependencyName: string) {
    const packageContent = JSON.parse(getFileContent(tree, '/package.json'));
    delete packageContent.dependencies[dependencyName];
    tree.overwrite('/package.json', JSON.stringify(packageContent, null, 2));
  }

  it('should update package.json', () => {
    // By default, the Angular workspace schematic sets up "@angular/animations". In order
    // to verify that we would set up the dependency properly if someone doesn't have the
    // animations installed already, we remove the animations dependency explicitly.
    removePackageJsonDependency(appTree, '@angular/animations');

    const tree = runner.runSchematic('ng-add', {}, appTree);
    const packageJson = JSON.parse(getFileContent(tree, '/package.json'));
    const dependencies = packageJson.dependencies;
    const angularCoreVersion = dependencies['@angular/core'];

    expect(dependencies['@angular/material']).toBeDefined();
    expect(dependencies['@angular/cdk']).toBeDefined();
    expect(dependencies['hammerjs']).toBeDefined();
    expect(dependencies['@angular/animations']).toBe(angularCoreVersion,
      'Expected the @angular/animations package to have the same version as @angular/core.');

    expect(Object.keys(dependencies)).toEqual(Object.keys(dependencies).sort(),
        'Expected the modified "dependencies" to be sorted alphabetically.');

    expect(runner.tasks.some(task => task.name === 'run-schematic')).toBe(true);
  });

  it('should add hammerjs import to project main file', () => {
    const tree = runner.runSchematic('ng-add-setup-project', {}, appTree);
    const fileContent = getFileContent(tree, '/projects/material/src/main.ts');

    expect(fileContent).toContain(`import 'hammerjs';`,
      'Expected the project main file to contain a HammerJS import.');
  });

  it('should add default theme', () => {
    const tree = runner.runSchematic('ng-add-setup-project', {}, appTree);

    const workspace = getWorkspace(tree);
    const project = getProjectFromWorkspace(workspace);

    expectProjectStyleFile(project,
        './node_modules/@angular/material/prebuilt-themes/indigo-pink.css');
  });

  it('should support adding a custom theme', () => {
    // TODO(devversion): do not re-create test app here.
    appTree = createTestApp(runner, {style: 'scss'});

    const tree = runner.runSchematic('ng-add-setup-project', {theme: 'custom'}, appTree);

    const workspace = getWorkspace(tree);
    const project = getProjectFromWorkspace(workspace);
    const expectedStylesPath = normalize(`/${project.root}/src/styles.scss`);

    const buffer = tree.read(expectedStylesPath);
    const themeContent = buffer!.toString();

    expect(themeContent).toContain(`@import '~@angular/material/theming';`);
    expect(themeContent).toContain(`$app-primary: mat-palette(`);
  });

  it('should create a custom theme file if no SCSS file could be found', () => {
    // TODO(devversion): do not re-create test app here.
    appTree = createTestApp(runner, {style: 'css'});

    const tree = runner.runSchematic('ng-add-setup-project', {theme: 'custom'}, appTree);
    const workspace = getWorkspace(tree);
    const project = getProjectFromWorkspace(workspace);
    const expectedStylesPath = normalize(`/${project.root}/src/custom-theme.scss`);

    expect(tree.files).toContain(expectedStylesPath, 'Expected a custom theme file to be created');
    expectProjectStyleFile(project, 'projects/material/src/custom-theme.scss');
  });

  it('should add font links', () => {
    const tree = runner.runSchematic('ng-add-setup-project', {}, appTree);
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
    const tree = runner.runSchematic('ng-add-setup-project', {}, appTree);
    const workspace = getWorkspace(tree);
    const project = getProjectFromWorkspace(workspace);

    const defaultStylesPath = getProjectStyleFile(project)!;
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

  describe('animations enabled', () => {
    it('should add the BrowserAnimationsModule to the project module', () => {
      const tree = runner.runSchematic('ng-add-setup-project', {}, appTree);
      const fileContent = getFileContent(tree, '/projects/material/src/app/app.module.ts');

      expect(fileContent).toContain('BrowserAnimationsModule',
        'Expected the project app module to import the "BrowserAnimationsModule".');
    });

    it('should not add BrowserAnimationsModule if NoopAnimationsModule is set up', () => {
      const workspace = getWorkspace(appTree);
      const project = getProjectFromWorkspace(workspace);

      // Simulate the case where a developer uses `ng-add` on an Angular CLI project which already
      // explicitly uses the `NoopAnimationsModule`. It would be wrong to forcibly enable browser
      // animations without knowing what other components would be affected. In this case, we
      // just print a warning message.
      addModuleImportToRootModule(appTree, 'NoopAnimationsModule',
          '@angular/platform-browser/animations', project);

      spyOn(console, 'warn');
      runner.runSchematic('ng-add-setup-project', {}, appTree);

      expect(console.warn).toHaveBeenCalledWith(
        jasmine.stringMatching(/Could not set up "BrowserAnimationsModule"/));
    });
  });

  describe('animations disabled', () => {
    it('should add the NoopAnimationsModule to the project module', () => {
      const tree = runner.runSchematic('ng-add-setup-project', {animations: false}, appTree);
      const fileContent = getFileContent(tree, '/projects/material/src/app/app.module.ts');

      expect(fileContent).toContain('NoopAnimationsModule',
        'Expected the project app module to import the "NoopAnimationsModule".');
    });

    it('should not add NoopAnimationsModule if BrowserAnimationsModule is set up', () => {
      const workspace = getWorkspace(appTree);
      const project = getProjectFromWorkspace(workspace);

      // Simulate the case where a developer uses `ng-add` on an Angular CLI project which already
      // explicitly uses the `BrowserAnimationsModule`. It would be wrong to forcibly change
      // to noop animations.
      const fileContent = addModuleImportToRootModule(appTree, 'BrowserAnimationsModule',
          '@angular/platform-browser/animations', project);

      expect(fileContent).not.toContain('NoopAnimationsModule',
          'Expected the project app module to not import the "NoopAnimationsModule".');
    });
  });
});
