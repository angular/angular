import {SchematicsException, Tree} from '@angular-devkit/schematics';
import {getStylesPath} from '../utils/ast';
import {InsertChange} from '../utils/devkit-utils/change';
import {
  getProjectFromWorkspace,
  getWorkspace,
  Project,
  Workspace,
} from '../utils/devkit-utils/config';
import {createCustomTheme} from './custom-theme';
import {Schema} from './schema';


/** Add pre-built styles to the main project style file. */
export function addThemeToAppStyles(options: Schema): (host: Tree) => Tree {
  return function(host: Tree): Tree {
    const workspace = getWorkspace(host);
    const project = getProjectFromWorkspace(workspace, options.project);

    // Because the build setup for the Angular CLI can be changed so dramatically, we can't know
    // where to generate anything if the project is not using the default config for build and test.
    assertDefaultProjectConfig(project);

    const themeName = options.theme || 'indigo-pink';
    if (themeName === 'custom') {
      insertCustomTheme(project, host);
    } else {
      insertPrebuiltTheme(project, host, themeName, workspace);
    }

    return host;
  };
}

/** Insert a custom theme to styles.scss file. */
function insertCustomTheme(project: Project, host: Tree) {
  const stylesPath = getStylesPath(host, project);

  const buffer = host.read(stylesPath);
  if (buffer) {
    const insertion = new InsertChange(stylesPath, 0, createCustomTheme(project));
    const recorder = host.beginUpdate(stylesPath);
    recorder.insertLeft(insertion.pos, insertion.toAdd);
    host.commitUpdate(recorder);
  } else {
    console.warn(`Skipped custom theme; could not find file: ${stylesPath}`);
  }
}

/** Insert a pre-built theme into the angular.json file. */
function insertPrebuiltTheme(project: Project, host: Tree, theme: string, workspace: Workspace) {
  // TODO(jelbourn): what should this be relative to?
  const themePath = `node_modules/@angular/material/prebuilt-themes/${theme}.css`;

  if (project.architect) {
    addStyleToTarget(project.architect['build'], host, themePath, workspace);
    addStyleToTarget(project.architect['test'], host, themePath, workspace);
  } else {
    throw new SchematicsException(`${project.name} does not have an architect configuration`);
  }
}

/** Adds a style entry to the given target. */
function addStyleToTarget(target: any, host: Tree, asset: string, workspace: Workspace) {
  const styleEntry = {input: asset};

  // We can't assume that any of these properties are defined, so safely add them as we go
  // if necessary.
  if (!target.options) {
    target.options = {styles: [styleEntry]};
  } else if (!target.options.styles) {
    target.options.styles = [styleEntry];
  } else {
    const existingStyles = target.options.styles.map(s => typeof s === 'string' ? s : s.input);
    const hasGivenTheme = existingStyles.find(s => s.includes(asset));
    const hasOtherTheme = existingStyles.find(s => s.includes('material/prebuilt'));

    if (!hasGivenTheme && !hasOtherTheme) {
      target.options.styles.splice(0, 0, styleEntry);
    }
  }

  host.overwrite('angular.json', JSON.stringify(workspace, null, 2));
}

/** Throws if the project is not using the default build and test config. */
function assertDefaultProjectConfig(project: Project) {
  if (!isProjectUsingDefaultConfig(project)) {
    throw new SchematicsException('Your project is not using the default configuration for ' +
     'build and test. The Angular Material schematics can only be used with the default ' +
     'configuration');
  }
}

/** Gets whether the Angular CLI project is using the default build configuration. */
function isProjectUsingDefaultConfig(project: Project) {
  const defaultBuilder = '@angular-devkit/build-angular:browser';

  return project.architect &&
      project.architect['build'] &&
      project.architect['build']['builder'] === defaultBuilder &&
      project.architect['test'] &&
      project.architect['build']['builder'] === defaultBuilder;
}
