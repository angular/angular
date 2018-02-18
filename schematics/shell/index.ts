import {
  Rule,
  SchematicContext,
  Tree,
  chain,
  noop,
  SchematicsException
} from '@angular-devkit/schematics';
import {Schema} from './schema';
import {materialVersion, cdkVersion, angularVersion} from '../utils/lib-versions';
import {getConfig, getAppFromConfig, AppConfig, CliConfig} from '../utils/devkit-utils/config';
import {addModuleImportToRootModule} from '../utils/ast';
import {addHeadLink} from '../utils/html';
import {addPackageToPackageJson} from '../utils/package';
import {createCustomTheme} from './custom-theme';
import {normalize} from '@angular-devkit/core';
import {InsertChange} from '../utils/devkit-utils/change';

/**
 * Scaffolds the basics of a Angular Material application, this includes:
 *  - Add Packages to package.json
 *  - Adds pre-built themes to styles.ext
 *  - Adds Browser Animation to app.momdule
 */
export default function(options: Schema): Rule {
  return chain([
    options && options.skipPackageJson ? noop() : addMaterialToPackageJson(options),
    addThemeToAppStyles(options),
    addAnimationRootConfig(),
    addFontsToIndex()
  ]);
}

/**
 * Add material, cdk, annimations to package.json
 */
function addMaterialToPackageJson(options: Schema) {
  return (host: Tree) => {
    addPackageToPackageJson(host, 'dependencies', '@angular/cdk', cdkVersion);
    addPackageToPackageJson(host, 'dependencies', '@angular/material', materialVersion);
    addPackageToPackageJson(host, 'dependencies', '@angular/animations', angularVersion);
    return host;
  };
}

/**
 * Add pre-built styles to style.ext file
 */
function addThemeToAppStyles(options: Schema) {
  return (host: Tree) => {
    const config = getConfig(host);
    const themeName = options && options.theme ? options.theme : 'indigo-pink';
    const app = getAppFromConfig(config, '0');

    if (themeName === 'custom') {
      insertCustomTheme(app, host);
    } else {
      insertPrebuiltTheme(app, host, themeName, config);
    }

    return host;
  };
}

/**
 * Insert a custom theme to styles.scss file.
 */
function insertCustomTheme(app: AppConfig, host: Tree) {
  const stylesPath = normalize(`/${app.root}/styles.scss`);

  const buffer = host.read(stylesPath);
  if (!buffer) {
    throw new SchematicsException(`Could not find file for path: ${stylesPath}`);
  }

  const src = buffer.toString();
  const insertion = new InsertChange(stylesPath, 0, createCustomTheme(app));
  const recorder = host.beginUpdate(stylesPath);
  recorder.insertLeft(insertion.pos, insertion.toAdd);
  host.commitUpdate(recorder);
}

/**
 * Insert a pre-built theme to .angular-cli.json file.
 */
function insertPrebuiltTheme(app: AppConfig, host: Tree, themeName: string, config: CliConfig) {
  const themeSrc = `../node_modules/@angular/material/prebuilt-themes/${themeName}.css`;
  const hasCurrentTheme = app.styles.find((s: string) => s.indexOf(themeSrc) > -1);
  const hasOtherTheme =
    app.styles.find((s: string) => s.indexOf('@angular/material/prebuilt-themes') > -1);

  if (!hasCurrentTheme && !hasOtherTheme) {
    app.styles.splice(0, 0, themeSrc);
  }

  if (hasOtherTheme) {
    throw new SchematicsException(`Another theme is already defined.`);
  }
  host.overwrite('.angular-cli.json', JSON.stringify(config, null, 2));
}

/**
 * Add browser animation module to app.module
 */
function addAnimationRootConfig() {
  return (host: Tree) => {
    addModuleImportToRootModule(host,
      'BrowserAnimationsModule', '@angular/platform-browser/animations');
    return host;
  };
}

/**
 * Adds fonts to the index.ext file
 */
function addFontsToIndex() {
  return (host: Tree) => {
    addHeadLink(host,
      `<link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500" rel="stylesheet">`);
    addHeadLink(host,
      `<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">`);
    return host;
  };
}
