"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
const ts = require("typescript");
const ast_utils_1 = require("./devkit-utils/ast-utils");
const ng_ast_utils_1 = require("./devkit-utils/ng-ast-utils");
const change_1 = require("./devkit-utils/change");
const config_1 = require("./devkit-utils/config");
const core_1 = require("@angular-devkit/core");
/**
 * Reads file given path and returns TypeScript source file.
 */
function getSourceFile(host, path) {
    const buffer = host.read(path);
    if (!buffer) {
        throw new schematics_1.SchematicsException(`Could not find file for path: ${path}`);
    }
    const content = buffer.toString();
    const source = ts.createSourceFile(path, content, ts.ScriptTarget.Latest, true);
    return source;
}
exports.getSourceFile = getSourceFile;
/**
 * Import and add module to root app module.
 */
function addModuleImportToRootModule(host, moduleName, src) {
    const config = config_1.getConfig(host);
    const app = config_1.getAppFromConfig(config, '0');
    const modulePath = ng_ast_utils_1.getAppModulePath(host, app);
    addModuleImportToModule(host, modulePath, moduleName, src);
}
exports.addModuleImportToRootModule = addModuleImportToRootModule;
/**
 * Import and add module to specific module path.
 * @param host the tree we are updating
 * @param modulePath src location of the module to import
 * @param moduleName name of module to import
 * @param src src location to import
 */
function addModuleImportToModule(host, modulePath, moduleName, src) {
    const moduleSource = getSourceFile(host, modulePath);
    const changes = ast_utils_1.addImportToModule(moduleSource, modulePath, moduleName, src);
    const recorder = host.beginUpdate(modulePath);
    changes.forEach((change) => {
        if (change instanceof change_1.InsertChange) {
            recorder.insertLeft(change.pos, change.toAdd);
        }
    });
    host.commitUpdate(recorder);
}
exports.addModuleImportToModule = addModuleImportToModule;
/**
 * Gets the app index.html file
 */
function getIndexHtmlPath(host) {
    const config = config_1.getConfig(host);
    const app = config_1.getAppFromConfig(config, '0');
    return core_1.normalize(`/${app.root}/${app.index}`);
}
exports.getIndexHtmlPath = getIndexHtmlPath;
//# sourceMappingURL=ast.js.map