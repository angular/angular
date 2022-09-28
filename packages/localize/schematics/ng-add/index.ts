/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 *
 * @fileoverview Schematics for ng-new project that builds with Bazel.
 */

import {tags} from '@angular-devkit/core';
import {chain, noop, Rule, SchematicContext, SchematicsException, Tree,} from '@angular-devkit/schematics';
import {NodePackageInstallTask} from '@angular-devkit/schematics/tasks';
import {addPackageJsonDependency, NodeDependencyType, removePackageJsonDependency,} from '@schematics/angular/utility/dependencies';
import {allTargetOptions, getWorkspace, updateWorkspace,} from '@schematics/angular/utility/workspace';
import {Builders} from '@schematics/angular/utility/workspace-models';

import {Schema} from './schema';

export const localizePolyfill = `@angular/localize/init`;

function prependToMainFiles(projectName: string): Rule {
  return async (host: Tree) => {
    const workspace = await getWorkspace(host);
    const project = workspace.projects.get(projectName);
    if (!project) {
      throw new SchematicsException(`Invalid project name (${projectName})`);
    }

    const fileList = new Set<string>();
    for (const target of project.targets.values()) {
      if (target.builder !== Builders.Server) {
        continue;
      }

      for (const [, options] of allTargetOptions(target)) {
        const value = options['main'];
        if (typeof value === 'string') {
          fileList.add(value);
        }
      }
    }

    for (const path of fileList) {
      const content = host.readText(path);
      if (content.includes(localizePolyfill)) {
        // If the file already contains the polyfill (or variations), ignore it too.
        continue;
      }

      // Add string at the start of the file.
      const recorder = host.beginUpdate(path);

      const localizeStr =
          tags.stripIndents`/***************************************************************************************************
     * Load \`$localize\` onto the global scope - used if i18n tags appear in Angular templates.
     */
     import '${localizePolyfill}';
    `;
      recorder.insertLeft(0, localizeStr);
      host.commitUpdate(recorder);
    }
  };
}

function addToPolyfillsOption(projectName: string): Rule {
  return updateWorkspace((workspace) => {
    const project = workspace.projects.get(projectName);
    if (!project) {
      throw new SchematicsException(`Invalid project name (${projectName})`);
    }

    for (const target of project.targets.values()) {
      if (target.builder !== Builders.Browser && target.builder !== Builders.Karma) {
        continue;
      }

      target.options ??= {};
      target.options['polyfills'] ??= [localizePolyfill];

      for (const [, options] of allTargetOptions(target)) {
        // Convert polyfills option to array.
        const polyfillsValue = typeof options['polyfills'] === 'string' ? [options['polyfills']] :
                                                                          options['polyfills'];
        if (Array.isArray(polyfillsValue) && !polyfillsValue.includes(localizePolyfill)) {
          options['polyfills'] = [...polyfillsValue, localizePolyfill];
        }
      }
    }
  });
}

function moveToDependencies(host: Tree, context: SchematicContext): void {
  if (host.exists('package.json')) {
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
      prependToMainFiles(projectName),
      addToPolyfillsOption(projectName),
      // If `$localize` will be used at runtime then must install `@angular/localize`
      // into `dependencies`, rather than the default of `devDependencies`.
      options.useAtRuntime ? moveToDependencies : noop(),
    ]);
  };
}
