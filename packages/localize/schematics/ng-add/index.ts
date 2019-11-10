/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 *
 * @fileoverview Schematics for ng-new project that builds with Bazel.
 */

import {virtualFs} from '@angular-devkit/core';
import {Rule, Tree, chain} from '@angular-devkit/schematics';
import {getWorkspace} from '@schematics/angular/utility/config';
import {getProjectTargets} from '@schematics/angular/utility/project-targets';
import {validateProjectName} from '@schematics/angular/utility/validation';
import {BrowserBuilderTarget, Builders, ServeBuilderTarget} from '@schematics/angular/utility/workspace-models';

import {Schema} from './schema';


export const localizePolyfill = `import '@angular/localize/init';`;

function getAllOptionValues<T>(
    host: Tree, projectName: string, builderName: string, optionName: string) {
  const targets = getProjectTargets(host, projectName);

  // Find all targets of a specific build in a project.
  const builderTargets: (BrowserBuilderTarget | ServeBuilderTarget)[] =
      Object.values(targets).filter(
          (target: BrowserBuilderTarget | ServeBuilderTarget) => target.builder === builderName);

  // Get all options contained in target configuration partials.
  const configurationOptions = builderTargets.filter(t => t.configurations)
                                   .map(t => Object.values(t.configurations !))
                                   .reduce((acc, cur) => acc.concat(...cur), []);

  // Now we have all option sets. We can use it to find all references to a given property.
  const allOptions = [
    ...builderTargets.map(t => t.options),
    ...configurationOptions,
  ];

  // Get all values for the option name and dedupe them.
  // Deduping will only work for primitives, but the keys we want here are strings so it's ok.
  const optionValues: T[] =
      allOptions.filter(o => o[optionName])
          .map(o => o[optionName])
          .reduce((acc, cur) => !acc.includes(cur) ? acc.concat(cur) : acc, []);

  return optionValues;
}


function prendendToTargetOptionFile(
    projectName: string, builderName: string, optionName: string, str: string) {
  return (host: Tree) => {
    // Get all known polyfills for browser builders on this project.
    const optionValues = getAllOptionValues<string>(host, projectName, builderName, optionName);

    optionValues.forEach(path => {
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

export default function(options: Schema): Rule {
  return (host: Tree) => {
    options.name = options.name || getWorkspace(host).defaultProject;
    if (!options.name) {
      throw new Error('Please specify a project using "--name project-name"');
    }
    validateProjectName(options.name);

    const localizeStr =
        `/***************************************************************************************************
 * Load \`$localize\` onto the global scope - used if i18n tags appear in Angular templates.
 */
${localizePolyfill}
`;

    return chain([
      prendendToTargetOptionFile(options.name, Builders.Browser, 'polyfills', localizeStr),
      prendendToTargetOptionFile(options.name, Builders.Server, 'main', localizeStr),
    ]);
  };
}
