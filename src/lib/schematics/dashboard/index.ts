import {chain, Rule, noop, Tree, SchematicContext} from '@angular-devkit/schematics';
import {Schema} from './schema';
import {addModuleImportToModule, findModuleFromOptions} from '../utils/ast';
import {buildComponent} from '../utils/devkit-utils/component';

/**
 * Scaffolds a new dashboard component.
 * Internally it bootstraps the base component schematic
 */
export default function(options: Schema): Rule {
  return chain([
    buildComponent({ ...options }),
    options.skipImport ? noop() : addNavModulesToModule(options)
  ]);
}

/**
 * Adds the required modules to the relative module.
 */
function addNavModulesToModule(options: Schema) {
  return (host: Tree) => {
    const modulePath = findModuleFromOptions(host, options);
    addModuleImportToModule(host, modulePath, 'MatGridListModule', '@angular/material');
    addModuleImportToModule(host, modulePath, 'MatCardModule', '@angular/material');
    addModuleImportToModule(host, modulePath, 'MatMenuModule', '@angular/material');
    addModuleImportToModule(host, modulePath, 'MatIconModule', '@angular/material');
    addModuleImportToModule(host, modulePath, 'MatButtonModule', '@angular/material');
    addModuleImportToModule(host, modulePath, 'LayoutModule', '@angular/cdk/layout');
    return host;
  };
}
