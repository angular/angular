/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 *
 * @fileoverview Schematics for `ng add @angular/localize` schematic.
 */

import {chain, noop, Rule, SchematicsException, Tree} from '@angular-devkit/schematics';
import {
  AngularBuilder,
  addDependency,
  readWorkspace,
  updateWorkspace,
} from '@schematics/angular/utility';
import {removePackageJsonDependency} from '@schematics/angular/utility/dependencies';
import {JSONFile, JSONPath} from '@schematics/angular/utility/json-file';

import {Schema} from './schema';

const localizeType = `@angular/localize`;
const localizePolyfill = '@angular/localize/init';
const localizeTripleSlashType = `/// <reference types="@angular/localize" />`;

function addPolyfillToConfig(projectName: string): Rule {
  return updateWorkspace((workspace) => {
    const project = workspace.projects.get(projectName);
    if (!project) {
      throw new SchematicsException(`Invalid project name '${projectName}'.`);
    }

    const isLocalizePolyfill = (path: string) => path.startsWith('@angular/localize');

    for (const target of project.targets.values()) {
      switch (target.builder) {
        case AngularBuilder.Karma:
        case AngularBuilder.BuildKarma:
        case AngularBuilder.Server:
        case AngularBuilder.Browser:
        case AngularBuilder.BrowserEsbuild:
        case AngularBuilder.Application:
        case AngularBuilder.BuildApplication:
          target.options ??= {};
          const value = target.options['polyfills'];
          if (typeof value === 'string') {
            if (!isLocalizePolyfill(value)) {
              target.options['polyfills'] = [value, localizePolyfill];
            }
          } else if (Array.isArray(value)) {
            if (!(value as string[]).some(isLocalizePolyfill)) {
              value.push(localizePolyfill);
            }
          } else {
            target.options['polyfills'] = [localizePolyfill];
          }

          break;
      }
    }
  });
}

function addTypeScriptConfigTypes(projectName: string): Rule {
  return async (host: Tree) => {
    const workspace = await readWorkspace(host);
    const project = workspace.projects.get(projectName);
    if (!project) {
      throw new SchematicsException(`Invalid project name '${projectName}'.`);
    }

    // We add the root workspace tsconfig for better IDE support.
    const tsConfigFiles = new Set<string>();
    for (const target of project.targets.values()) {
      switch (target.builder) {
        case AngularBuilder.Karma:
        case AngularBuilder.Server:
        case AngularBuilder.BrowserEsbuild:
        case AngularBuilder.Browser:
        case AngularBuilder.Application:
        case AngularBuilder.BuildApplication:
          const value = target.options?.['tsConfig'];
          if (typeof value === 'string') {
            tsConfigFiles.add(value);
          }

          break;
      }

      if (
        target.builder === AngularBuilder.Browser ||
        target.builder === AngularBuilder.BrowserEsbuild
      ) {
        const value = target.options?.['main'];
        if (typeof value === 'string') {
          addTripleSlashType(host, value);
        }
      } else if (target.builder === AngularBuilder.Application) {
        const value = target.options?.['browser'];
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
        throw new SchematicsException(
          `TypeScript configuration file '${path}' has an invalid 'types' property. It must be an array.`,
        );
      }

      const hasLocalizeType = types.some(
        (t) => t === localizeType || t === '@angular/localize/init',
      );
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

function moveToDependencies(host: Tree): Rule | void {
  if (!host.exists('package.json')) {
    return;
  }

  // Remove the previous dependency and add in a new one under the desired type.
  removePackageJsonDependency(host, '@angular/localize');

  return addDependency('@angular/localize', `~0.0.0-PLACEHOLDER`);
}

export default function (options: Schema): Rule {
  const projectName = options.project;

  if (!projectName) {
    throw new SchematicsException('Option "project" is required.');
  }

  return chain([
    addTypeScriptConfigTypes(projectName),
    addPolyfillToConfig(projectName),
    // If `$localize` will be used at runtime then must install `@angular/localize`
    // into `dependencies`, rather than the default of `devDependencies`.
    options.useAtRuntime ? moveToDependencies : noop(),
  ]);
}
