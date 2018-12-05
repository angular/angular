/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 *
 * @fileoverview Schematics for bazel-workspace
 */

import {strings} from '@angular-devkit/core';
import {Rule, SchematicContext, SchematicsException, Tree, apply, applyTemplates, mergeWith, move, url} from '@angular-devkit/schematics';
import {getWorkspace} from '@schematics/angular/utility/config';
import {validateProjectName} from '@schematics/angular/utility/validation';

import {Schema as BazelWorkspaceOptions} from './schema';

/**
 * Look for package.json file for @angular/core in node_modules and extract its
 * version.
 */
function findAngularVersion(options: BazelWorkspaceOptions, host: Tree): string|null {
  // Need to look in multiple locations because we could be working in a subtree.
  const candidates = [
    'node_modules/@angular/core/package.json',
    `${options.name}/node_modules/@angular/core/package.json`,
  ];
  for (const candidate of candidates) {
    if (host.exists(candidate)) {
      try {
        const packageJson = JSON.parse(host.read(candidate).toString());
        if (packageJson.name === '@angular/core' && packageJson.version) {
          return packageJson.version;
        }
      } catch {
      }
    }
  }
  return null;
}


export default function(options: BazelWorkspaceOptions): Rule {
  return (host: Tree, context: SchematicContext) => {
    if (!options.name) {
      throw new SchematicsException(`Invalid options, "name" is required.`);
    }
    validateProjectName(options.name);
    let newProjectRoot = '';
    try {
      const workspace = getWorkspace(host);
      newProjectRoot = workspace.newProjectRoot || '';
    } catch {
    }
    const appDir = `${newProjectRoot}/${options.name}`;

    // If user already has angular installed, Bazel should use that version
    const existingAngularVersion = findAngularVersion(options, host);

    const workspaceVersions = {
      'ANGULAR_VERSION': existingAngularVersion || '7.1.1',
      'RULES_SASS_VERSION': '1.14.1',
      'RXJS_VERSION': '6.3.3',
    };

    return mergeWith(apply(url('./files'), [
      applyTemplates({
        utils: strings,
        ...options,
        'dot': '.', ...workspaceVersions,
      }),
      move(appDir),
    ]));
  };
}
