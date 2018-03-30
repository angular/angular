"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
const ast_1 = require("../utils/ast");
const find_module_1 = require("../utils/devkit-utils/find-module");
const component_1 = require("../utils/devkit-utils/component");
/**
 * Scaffolds a new navigation component.
 * Internally it bootstraps the base component schematic
 */
function default_1(options) {
    return schematics_1.chain([
        component_1.buildComponent(Object.assign({}, options)),
        options.skipImport ? schematics_1.noop() : addNavModulesToModule(options)
    ]);
}
exports.default = default_1;
/**
 * Adds the required modules to the relative module.
 */
function addNavModulesToModule(options) {
    return (host) => {
        const modulePath = find_module_1.findModuleFromOptions(host, options);
        ast_1.addModuleImportToModule(host, modulePath, 'LayoutModule', '@angular/cdk/layout');
        ast_1.addModuleImportToModule(host, modulePath, 'MatToolbarModule', '@angular/material');
        ast_1.addModuleImportToModule(host, modulePath, 'MatButtonModule', '@angular/material');
        ast_1.addModuleImportToModule(host, modulePath, 'MatSidenavModule', '@angular/material');
        ast_1.addModuleImportToModule(host, modulePath, 'MatIconModule', '@angular/material');
        ast_1.addModuleImportToModule(host, modulePath, 'MatListModule', '@angular/material');
        return host;
    };
}
//# sourceMappingURL=index.js.map