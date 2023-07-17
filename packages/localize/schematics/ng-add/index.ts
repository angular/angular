/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 *
 * @fileoverview Schematics for `ng add @angular/localize` schematic.
 */

import {chain, noop, Rule, SchematicContext, SchematicsException, Tree,} from '@angular-devkit/schematics';
import {NodePackageInstallTask} from '@angular-devkit/schematics/tasks';
import {addPackageJsonDependency, NodeDependencyType, removePackageJsonDependency,} from '@schematics/angular/utility/dependencies';
import {JSONFile, JSONPath} from '@schematics/angular/utility/json-file';
import {getWorkspace} from '@schematics/angular/utility/workspace';
import {Builders} from '@schematics/angular/utility/workspace-models';

import {Schema} from './schema';

const localizeType = `@angular/localize`;
const localizeTripleSlashType = `/// <reference types="@angular/localize" />`;

function addTypeScriptConfigTypes(projectName: string): Rule {
  return async (host: Tree) => {
    const workspace = await getWorkspace(host);
    const project = workspace.projects.get(projectName);
    if (!project) {
      throw new SchematicsException(`Invalid project name '${projectName}'.`);
    }

    // We add the root workspace tsconfig for better IDE support.
    const tsConfigFiles = new Set<string>();
    for (const target of project.targets.values()) {
      switch (target.builder) {
        case Builders.Karma:
        case Builders.Server:
        case Builders.Browser:
          const value = target.options?.['tsConfig'];
          if (typeof value === 'string') {
            tsConfigFiles.add(value);
          }

          break;
      }

      if (target.builder === Builders.Browser) {
        const value = target.options?.['main'];
        if (typeof value === 'string') {
          addTripleSlashType(host, value);
        }
      }
    }

    const typesJsonPath: JSONPath = ['compilerOptions', 'types'];
    for (const path of tsConfigFiles) {
      if (!host.exists(path)) {
        continue;
      }

      const json = new JSONFile(host, path);
      const types = json.get(typesJsonPath) ?? [];
      if (!Array.isArray(types)) {
        throw new SchematicsException(`TypeScript configuration file '${
            path}' has an invalid 'types' property. It must be an array.`);
      }

      const hasLocalizeType =
          types.some((t) => t === localizeType || t === '@angular/localize/init');
      if (hasLocalizeType) {
        // Skip has already localize type.
        continue;
      }

      json.modify(typesJsonPath, [...types, localizeType]);
    }
  };
}

function addTripleSlashType(host: Tree, path: string): void {
  const content = host.readText(path);
  if (!content.includes(localizeTripleSlashType)) {
    host.overwrite(path, localizeTripleSlashType + '\n\n' + content);
  }
}

function moveToDependencies(host: Tree, context: SchematicContext): void {
  if (!host.exists('package.json')) {
    return;
  }

  // Remove the previous dependency and add in a new one under the desired type.
  removePackageJsonDependency(host, '@angular/localize');
  addPackageJsonDependency(host, {
    name: '@angular/localize',
    type: NodeDependencyType.Default,
    version: `~0.0.0-PLACEHOLDER`,
  });

  // Add a task to run the package manager. This is necessary because we updated
  // "package.json" and we want lock files to reflect this.
  context.addTask(new NodePackageInstallTask());
}

export default function(options: Schema): Rule {
  return () => {
    // We favor the name option because the project option has a
    // smart default which can be populated even when unspecified by the user.
    const projectName = options.name ?? options.project;

    if (!projectName) {
      throw new SchematicsException('Option "project" is required.');
    }

    return chain([
      addTypeScriptConfigTypes(projectName),
      // If `$localize` will be used at runtime then must install `@angular/localize`
      // into `dependencies`, rather than the default of `devDependencies`.
      options.useAtRuntime ? moveToDependencies : noop(),
    ]);
  };
}
