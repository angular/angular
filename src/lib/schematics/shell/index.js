"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
const lib_versions_1 = require("../utils/lib-versions");
const config_1 = require("../utils/devkit-utils/config");
const ast_1 = require("../utils/ast");
const html_1 = require("../utils/html");
const package_1 = require("../utils/package");
const custom_theme_1 = require("./custom-theme");
const core_1 = require("@angular-devkit/core");
const change_1 = require("../utils/devkit-utils/change");
/**
 * Scaffolds the basics of a Angular Material application, this includes:
 *  - Add Packages to package.json
 *  - Adds pre-built themes to styles.ext
 *  - Adds Browser Animation to app.momdule
 */
function default_1(options) {
    return schematics_1.chain([
        options && options.skipPackageJson ? schematics_1.noop() : addMaterialToPackageJson(options),
        addThemeToAppStyles(options),
        addAnimationRootConfig(),
        addFontsToIndex()
    ]);
}
exports.default = default_1;
/**
 * Add material, cdk, annimations to package.json
 */
function addMaterialToPackageJson(options) {
    return (host) => {
        package_1.addPackageToPackageJson(host, 'dependencies', '@angular/cdk', lib_versions_1.cdkVersion);
        package_1.addPackageToPackageJson(host, 'dependencies', '@angular/material', lib_versions_1.materialVersion);
        package_1.addPackageToPackageJson(host, 'dependencies', '@angular/animations', lib_versions_1.angularVersion);
        return host;
    };
}
/**
 * Add pre-built styles to style.ext file
 */
function addThemeToAppStyles(options) {
    return (host) => {
        const config = config_1.getConfig(host);
        const themeName = options && options.theme ? options.theme : 'indigo-pink';
        const app = config_1.getAppFromConfig(config, '0');
        if (themeName === 'custom') {
            insertCustomTheme(app, host);
        }
        else {
            insertPrebuiltTheme(app, host, themeName, config);
        }
        return host;
    };
}
/**
 * Insert a custom theme to styles.scss file.
 */
function insertCustomTheme(app, host) {
    const stylesPath = core_1.normalize(`/${app.root}/styles.scss`);
    const buffer = host.read(stylesPath);
    if (!buffer) {
        throw new schematics_1.SchematicsException(`Could not find file for path: ${stylesPath}`);
    }
    const src = buffer.toString();
    const insertion = new change_1.InsertChange(stylesPath, 0, custom_theme_1.createCustomTheme(app));
    const recorder = host.beginUpdate(stylesPath);
    recorder.insertLeft(insertion.pos, insertion.toAdd);
    host.commitUpdate(recorder);
}
/**
 * Insert a pre-built theme to .angular-cli.json file.
 */
function insertPrebuiltTheme(app, host, themeName, config) {
    const themeSrc = `../node_modules/@angular/material/prebuilt-themes/${themeName}.css`;
    const hasCurrentTheme = app.styles.find((s) => s.indexOf(themeSrc) > -1);
    const hasOtherTheme = app.styles.find((s) => s.indexOf('@angular/material/prebuilt-themes') > -1);
    if (!hasCurrentTheme && !hasOtherTheme) {
        app.styles.splice(0, 0, themeSrc);
    }
    if (hasOtherTheme) {
        throw new schematics_1.SchematicsException(`Another theme is already defined.`);
    }
    host.overwrite('.angular-cli.json', JSON.stringify(config, null, 2));
}
/**
 * Add browser animation module to app.module
 */
function addAnimationRootConfig() {
    return (host) => {
        ast_1.addModuleImportToRootModule(host, 'BrowserAnimationsModule', '@angular/platform-browser/animations');
        return host;
    };
}
/**
 * Adds fonts to the index.ext file
 */
function addFontsToIndex() {
    return (host) => {
        html_1.addHeadLink(host, `<link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500" rel="stylesheet">`);
        html_1.addHeadLink(host, `<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">`);
        return host;
    };
}
//# sourceMappingURL=index.js.map