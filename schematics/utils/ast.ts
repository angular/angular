import {SchematicsException} from '@angular-devkit/schematics';
import {Tree} from '@angular-devkit/schematics';
import * as ts from 'typescript';
import {addImportToModule} from './devkit-utils/ast-utils';
import {getAppModulePath} from './devkit-utils/ng-ast-utils';
import {InsertChange} from './devkit-utils/change';
import {getConfig, getAppFromConfig} from './devkit-utils/config';
import {normalize} from '@angular-devkit/core';

/**
 * Reads file given path and returns TypeScript source file.
 */
export function getSourceFile(host: Tree, path: string): ts.SourceFile {
  const buffer = host.read(path);
  if (!buffer) {
    throw new SchematicsException(`Could not find file for path: ${path}`);
  }
  const content = buffer.toString();
  const source = ts.createSourceFile(path, content, ts.ScriptTarget.Latest, true);
  return source;
}

/**
 * Import and add module to root app module.
 */
export function addModuleImportToRootModule(host: Tree, moduleName: string, src: string) {
  const config = getConfig(host);
  const app = getAppFromConfig(config, '0');
  const modulePath = getAppModulePath(host, app);
  addModuleImportToModule(host, modulePath, moduleName, src);
}

/**
 * Import and add module to specific module path.
 * @param host the tree we are updating
 * @param modulePath src location of the module to import
 * @param moduleName name of module to import
 * @param src src location to import
 */
export function addModuleImportToModule(
    host: Tree, modulePath: string, moduleName: string, src: string) {
  const moduleSource = getSourceFile(host, modulePath);
  const changes = addImportToModule(moduleSource, modulePath, moduleName, src);
  const recorder = host.beginUpdate(modulePath);

  changes.forEach((change) => {
    if (change instanceof InsertChange) {
      recorder.insertLeft(change.pos, change.toAdd);
    }
  });

  host.commitUpdate(recorder);
}

/**
 * Gets the app index.html file
 */
export function getIndexHtmlPath(host: Tree) {
  const config = getConfig(host);
  const app = getAppFromConfig(config, '0');
  return normalize(`/${app.root}/${app.index}`);
}
