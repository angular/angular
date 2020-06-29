/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {chain, noop, Rule, SchematicContext, SchematicsException, Tree} from '@angular-devkit/schematics';
import {NodePackageInstallTask} from '@angular-devkit/schematics/tasks';
import {addPackageJsonDependency, NodeDependencyType} from '@schematics/angular/utility/dependencies';
import {getWorkspace} from '@schematics/angular/utility/workspace';

import {Schema} from './schema';

export default function(options: Schema): Rule {
  return chain([
    options && options.skipPackageJson ? noop() : addPolyfillDependency(),
    addPolyfill(options),
  ]);
}

/** Adds a package.json dependency for document-register-element */
function addPolyfillDependency(): Rule {
  return (host: Tree, context: SchematicContext) => {
    addPackageJsonDependency(host, {
      type: NodeDependencyType.Default,
      name: 'document-register-element',
      version: '^1.7.2',
    });
    context.logger.info('Added "document-register-element" as a dependency.');

    // Install the dependency
    context.addTask(new NodePackageInstallTask());
  };
}

/** Adds the document-register-element.js to the polyfills file. */
function addPolyfill(options: Schema): Rule {
  return async (host: Tree, context: SchematicContext) => {
    const projectName = options.project;

    if (!projectName) {
      throw new SchematicsException('Option "project" is required.');
    }

    const workspace = await getWorkspace(host);
    const project = workspace.projects.get(projectName);

    if (!project) {
      throw new SchematicsException(`Project ${projectName} is not defined in this workspace.`);
    }

    if (project.extensions['projectType'] !== 'application') {
      throw new SchematicsException(
          `@angular/elements requires a project type of "application" but ${projectName} isn't.`);
    }

    const buildTarget = project.targets.get('build');
    if (!buildTarget || !buildTarget.options) {
      throw new SchematicsException(`Cannot find 'options' for ${projectName} build target.`);
    }

    const {polyfills} = buildTarget.options;
    if (typeof polyfills !== 'string') {
      throw new SchematicsException(`polyfills for ${projectName} build target is not a string.`);
    }

    const content = host.read(polyfills).toString();
    if (!content.includes('document-register-element')) {
      // Add string at the end of the file.
      const recorder = host.beginUpdate(polyfills);
      recorder.insertRight(content.length, `import 'document-register-element';\n`);
      host.commitUpdate(recorder);
    }

    context.logger.info('Added "document-register-element" to polyfills.');
  };
}
