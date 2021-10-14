/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SchematicsException, Tree} from '@angular-devkit/schematics';
import {Schema as ComponentOptions} from '@schematics/angular/component/schema';
import {InsertChange} from '@schematics/angular/utility/change';
import {getWorkspace} from '@schematics/angular/utility/workspace';
import {findModuleFromOptions as internalFindModule} from '@schematics/angular/utility/find-module';
import {ProjectDefinition} from '@angular-devkit/core/src/workspace';
import * as ts from 'typescript';
import {getProjectMainFile} from './project-main-file';
import {addImportToModule, getAppModulePath} from './vendored-ast-utils';

/** Reads file given path and returns TypeScript source file. */
export function parseSourceFile(host: Tree, path: string): ts.SourceFile {
  const buffer = host.read(path);
  if (!buffer) {
    throw new SchematicsException(`Could not find file for path: ${path}`);
  }
  return ts.createSourceFile(path, buffer.toString(), ts.ScriptTarget.Latest, true);
}

/** Import and add module to root app module. */
export function addModuleImportToRootModule(
  host: Tree,
  moduleName: string,
  src: string,
  project: ProjectDefinition,
) {
  const modulePath = getAppModulePath(host, getProjectMainFile(project));
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
  host: Tree,
  modulePath: string,
  moduleName: string,
  src: string,
) {
  const moduleSource = parseSourceFile(host, modulePath);

  if (!moduleSource) {
    throw new SchematicsException(`Module not found: ${modulePath}`);
  }

  const changes = addImportToModule(moduleSource, modulePath, moduleName, src);
  const recorder = host.beginUpdate(modulePath);

  changes.forEach(change => {
    if (change instanceof InsertChange) {
      recorder.insertLeft(change.pos, change.toAdd);
    }
  });

  host.commitUpdate(recorder);
}

/** Wraps the internal find module from options with undefined path handling  */
export async function findModuleFromOptions(
  host: Tree,
  options: ComponentOptions,
): Promise<string | undefined> {
  const workspace = await getWorkspace(host);

  if (!options.project) {
    options.project = Array.from(workspace.projects.keys())[0];
  }

  const project = workspace.projects.get(options.project)!;

  if (options.path === undefined) {
    options.path = `/${project.root}/src/app`;
  }

  return internalFindModule(host, options);
}
