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
import {Rule, SchematicContext, Tree, apply, applyTemplates, mergeWith, url} from '@angular-devkit/schematics';
import {getWorkspace} from '@schematics/angular/utility/config';
import {validateProjectName} from '@schematics/angular/utility/validation';

import {Schema as BazelWorkspaceOptions} from './schema';

/**
 * Clean the version string and return version in the form "1.2.3". Return
 * null if version string is invalid. This is similar to semver.clean() but
 * takes characters like '^' and '~' into account.
 */
export function clean(version: string): string|null {
  const matches = version.match(/(\d+\.\d+\.\d+)/);
  return matches && matches.pop() || null;
}

/**
 * Returns true if project contains routing module, false otherwise.
 */
function hasRoutingModule(host: Tree) {
  let hasRouting = false;
  host.visit((file: string) => { hasRouting = hasRouting || file.endsWith('-routing.module.ts'); });
  return hasRouting;
}

/**
 * Returns true if project uses SASS stylesheets, false otherwise.
 */
function hasSassStylesheet(host: Tree) {
  let hasSass = false;
  // The proper extension for SASS is .scss
  host.visit((file: string) => { hasSass = hasSass || file.endsWith('.scss'); });
  return hasSass;
}

export default function(options: BazelWorkspaceOptions): Rule {
  return (host: Tree, context: SchematicContext) => {
    const name = options.name || getWorkspace(host).defaultProject;
    if (!name) {
      throw new Error('Please provide a name for Bazel workspace');
    }
    validateProjectName(name);

    if (!host.exists('yarn.lock')) {
      host.create('yarn.lock', '');
    }

    const workspaceVersions = {
      'RULES_NODEJS_VERSION': '0.18.6',
      'RULES_NODEJS_SHA256': '1416d03823fed624b49a0abbd9979f7c63bbedfd37890ddecedd2fe25cccebc6',
      'RULES_SASS_VERSION': '1.17.0',
    };

    return mergeWith(apply(url('./files'), [
      applyTemplates({
        utils: strings,
        name,
        'dot': '.', ...workspaceVersions,
        routing: hasRoutingModule(host),
        sass: hasSassStylesheet(host),
      }),
    ]));
  };
}
