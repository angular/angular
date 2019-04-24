import {normalize} from '@angular-devkit/core';
import {WorkspaceProject} from '@angular-devkit/core/src/workspace';
import {Tree} from '@angular-devkit/schematics';
import {SchematicTestRunner} from '@angular-devkit/schematics/testing';
import {
  addModuleImportToRootModule,
  getProjectFromWorkspace,
  getProjectStyleFile,
  getProjectTargetOptions,
} from '@angular/cdk/schematics';
import {createTestApp, getFileContent} from '@angular/cdk/schematics/testing';
import {getWorkspace} from '@schematics/angular/utility/config';
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
    expect(dependencies['@angular/forms']).toBe(angularCoreVersion,
      'Expected the @angular/forms package to have the same version as @angular/core.');
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

  describe('custom project builders', () => {

    /** Overwrites a target builder for the workspace in the given tree */
    function overwriteTargetBuilder(tree: Tree, targetName: string, newBuilder: string) {
      const workspace = getWorkspace(tree);
      const project = getProjectFromWorkspace(workspace);
      const targetConfig = project.architect && project.architect[targetName] ||
                           project.targets && project.targets[targetName];
      targetConfig['builder'] = newBuilder;
      tree.overwrite('/angular.json', JSON.stringify(workspace, null, 2));
    }

    it('should throw an error if the "build" target has been changed', () => {
      overwriteTargetBuilder(appTree, 'build', 'thirdparty-builder');

      expect(() => runner.runSchematic('ng-add-setup-project', {}, appTree))
        .toThrowError(/not using the default builders.*build/);
    });

    it('should warn if the "test" target has been changed', () => {
      overwriteTargetBuilder(appTree, 'test', 'thirdparty-test-builder');

      spyOn(console, 'warn');
      runner.runSchematic('ng-add-setup-project', {}, appTree);

      expect(console.warn).toHaveBeenCalledWith(
        jasmine.stringMatching(/not using the default builders.*cannot add the configured theme/));
    });
  });

  describe('theme files', () => {

    /** Path to the default prebuilt theme file that will be added when running ng-add. */
    const defaultPrebuiltThemePath =
      './node_modules/@angular/material/prebuilt-themes/indigo-pink.css';

    /** Writes a specific style file to the workspace in the given tree */
    function writeStyleFileToWorkspace(tree: Tree, stylePath: string) {
      const workspace = getWorkspace(tree);
      const project = getProjectFromWorkspace(workspace);
      const buildOptions = getProjectTargetOptions(project, 'build');

      if (!buildOptions.styles) {
        buildOptions.styles = [stylePath];
      } else {
        buildOptions.styles.push(stylePath);
      }

      tree.overwrite('/angular.json', JSON.stringify(workspace, null, 2));
    }

    it('should replace existing prebuilt theme files', () => {
      const existingThemePath =
          './node_modules/@angular/material/prebuilt-themes/purple-green.css';
      writeStyleFileToWorkspace(appTree, existingThemePath);

      const tree = runner.runSchematic('ng-add-setup-project', {}, appTree);
      const workspace = getWorkspace(tree);
      const project = getProjectFromWorkspace(workspace);
      const styles = getProjectTargetOptions(project, 'build').styles;

      expect(styles).not.toContain(existingThemePath,
          'Expected the existing prebuilt theme file to be removed.');
      expect(styles).toContain(defaultPrebuiltThemePath,
          'Expected the default prebuilt theme to be added.');
    });

    it('should not replace existing custom theme files', () => {
      spyOn(console, 'warn');
      writeStyleFileToWorkspace(appTree, './projects/material/custom-theme.scss');

      const tree = runner.runSchematic('ng-add-setup-project', {}, appTree);
      const workspace = getWorkspace(tree);
      const project = getProjectFromWorkspace(workspace);
      const styles = getProjectTargetOptions(project, 'build').styles;

      expect(styles).not.toContain(defaultPrebuiltThemePath,
          'Expected the default prebuilt theme to be not configured.');
      expect(console.warn).toHaveBeenCalledWith(
        jasmine.stringMatching(/Could not add the selected theme/));
    });

    it('should not add a theme file multiple times', () => {
      writeStyleFileToWorkspace(appTree, defaultPrebuiltThemePath);

      const tree = runner.runSchematic('ng-add-setup-project', {}, appTree);
      const workspace = getWorkspace(tree);
      const project = getProjectFromWorkspace(workspace);
      const styles = getProjectTargetOptions(project, 'build').styles;

      expect(styles).toEqual(['projects/material/src/styles.css', defaultPrebuiltThemePath],
          'Expected the "styles.css" file and default prebuilt theme to be the only styles');
    });

    it('should not overwrite existing custom theme files', () => {
      appTree.create('/projects/material/custom-theme.scss', 'custom-theme');
      const tree = runner.runSchematic('ng-add-setup-project', {theme: 'custom'}, appTree);

      expect(tree.readContent('/projects/material/custom-theme.scss')).toBe('custom-theme',
          'Expected the old custom theme content to be unchanged.');
    });
  });
});
