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

    const workspaceVersions = {
      'ANGULAR_VERSION': '7.1.0',
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
