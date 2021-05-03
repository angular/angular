/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 *
 * @fileoverview Schematics for ng-new project that builds with Bazel.
 */

import {virtualFs, workspaces} from '@angular-devkit/core';
import {chain, noop, Rule, SchematicContext, SchematicsException, Tree} from '@angular-devkit/schematics';
import {NodePackageInstallTask} from '@angular-devkit/schematics/tasks';
import {addPackageJsonDependency, NodeDependencyType, removePackageJsonDependency} from '@schematics/angular/utility/dependencies';
import {getWorkspace} from '@schematics/angular/utility/workspace';
import {Builders} from '@schematics/angular/utility/workspace-models';

import {Schema} from './schema';


export const localizePolyfill = `import '@angular/localize/init';`;

function getRelevantTargetDefinitions(
    project: workspaces.ProjectDefinition, builderName: Builders): workspaces.TargetDefinition[] {
  const definitions: workspaces.TargetDefinition[] = [];
  project.targets.forEach((target: workspaces.TargetDefinition): void => {
    if (target.builder === builderName) {
      definitions.push(target);
    }
  });
  return definitions;
}

function getOptionValuesForTargetDefinition(
    definition: workspaces.TargetDefinition, optionName: string): string[] {
  const optionValues: string[] = [];
  if (definition.options && optionName in definition.options) {
    let optionValue: unknown = definition.options[optionName];
    if (typeof optionValue === 'string') {
      optionValues.push(optionValue);
    }
  }
  if (!definition.configurations) {
    return optionValues;
  }
  Object.values(definition.configurations)
      .forEach((configuration: Record<string, unknown>|undefined): void => {
        if (configuration && optionName in configuration) {
          const optionValue: unknown = configuration[optionName];
          if (typeof optionValue === 'string') {
            optionValues.push(optionValue);
          }
        }
      });
  return optionValues;
}

function getFileListForRelevantTargetDefinitions(
    project: workspaces.ProjectDefinition, builderName: Builders, optionName: string): string[] {
  const fileList: string[] = [];
  const definitions = getRelevantTargetDefinitions(project, builderName);
  definitions.forEach((definition: workspaces.TargetDefinition): void => {
    const optionValues = getOptionValuesForTargetDefinition(definition, optionName);
    optionValues.forEach((filePath: string): void => {
      if (fileList.indexOf(filePath) === -1) {
        fileList.push(filePath);
      }
    });
  });
  return fileList;
}

function prependToTargetFiles(
    project: workspaces.ProjectDefinition, builderName: Builders, optionName: string, str: string) {
  return (host: Tree) => {
    const fileList = getFileListForRelevantTargetDefinitions(project, builderName, optionName);

    fileList.forEach((path: string): void => {
      const data = host.read(path);
      if (!data) {
        // If the file doesn't exist, just ignore it.
        return;
      }

      const content = virtualFs.fileBufferToString(data);
      if (content.includes(localizePolyfill) ||
          content.includes(localizePolyfill.replace(/'/g, '"'))) {
        // If the file already contains the polyfill (or variations), ignore it too.
        return;
      }

      // Add string at the start of the file.
      const recorder = host.beginUpdate(path);
      recorder.insertLeft(0, str);
      host.commitUpdate(recorder);
    });
  };
}

function moveToDependencies(host: Tree, context: SchematicContext) {
  if (host.exists('package.json')) {
    // Remove the previous dependency and add in a new one under the desired type.
    removePackageJsonDependency(host, '@angular/localize');
    addPackageJsonDependency(host, {
      name: '@angular/localize',
      type: NodeDependencyType.Default,
      version: `~0.0.0-PLACEHOLDER`
    });

    // Add a task to run the package manager. This is necessary because we updated
    // "package.json" and we want lock files to reflect this.
    context.addTask(new NodePackageInstallTask());
  }
}

export default function(options: Schema): Rule {
  return async (host: Tree) => {
    if (!options.name) {
      throw new SchematicsException('Option "name" is required.');
    }

    const workspace = await getWorkspace(host);
    const project: workspaces.ProjectDefinition|undefined = workspace.projects.get(options.name);
    if (!project) {
      throw new SchematicsException(`Invalid project name (${options.name})`);
    }

    const localizeStr =
        `/***************************************************************************************************
 * Load \`$localize\` onto the global scope - used if i18n tags appear in Angular templates.
 */
${localizePolyfill}
`;

    return chain([
      prependToTargetFiles(project, Builders.Browser, 'polyfills', localizeStr),
      prependToTargetFiles(project, Builders.Server, 'main', localizeStr),
      // If `$localize` will be used at runtime then must install `@angular/localize`
      // into `dependencies`, rather than the default of `devDependencies`.
      options.useAtRuntime ? moveToDependencies : noop()
    ]);
  };
}
