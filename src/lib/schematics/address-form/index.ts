import {chain, Rule, noop, Tree, SchematicContext} from '@angular-devkit/schematics';
import {Schema} from './schema';
import {addModuleImportToModule, findModuleFromOptions} from '../utils/ast';
import {buildComponent} from '../utils/devkit-utils/component';

/**
 * Scaffolds a new table component.
 * Internally it bootstraps the base component schematic
 */
export default function(options: Schema): Rule {
  return chain([
    buildComponent({...options}),
    options.skipImport ? noop() : addFormModulesToModule(options)
  ]);
}

/**
 * Adds the required modules to the relative module.
 */
function addFormModulesToModule(options: Schema) {
  return (host: Tree) => {
    const modulePath = findModuleFromOptions(host, options);
    addModuleImportToModule(host, modulePath, 'MatInputModule', '@angular/material');
    addModuleImportToModule(host, modulePath, 'MatButtonModule', '@angular/material');
    addModuleImportToModule(host, modulePath, 'MatSelectModule', '@angular/material');
    addModuleImportToModule(host, modulePath, 'MatRadioModule', '@angular/material');
    addModuleImportToModule(host, modulePath, 'MatCardModule', '@angular/material');
    addModuleImportToModule(host, modulePath, 'ReactiveFormsModule', '@angular/forms');
    return host;
  };
}
