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
import {latestVersions} from '@schematics/angular/utility/latest-versions';
import {validateProjectName} from '@schematics/angular/utility/validation';

import {Schema as BazelWorkspaceOptions} from './schema';


/**
 * Look for package.json file for package with `packageName` in node_modules and
 * extract its version.
 */
function findVersion(packageName: string, host: Tree): string|null {
  const candidate = `node_modules/${packageName}/package.json`;
  if (host.exists(candidate)) {
    try {
      const packageJson = JSON.parse(host.read(candidate).toString());
      if (packageJson.name === packageName && packageJson.version) {
        return packageJson.version;
      }
    } catch {
    }
  }
  return null;
}

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

    // If the project already has some deps installed, Bazel should use existing
    // versions.
    const existingVersions = {
      Angular: findVersion('@angular/core', host),
      RxJs: findVersion('rxjs', host),
    };

    Object.keys(existingVersions).forEach((name: 'Angular' | 'RxJs') => {
      const version = existingVersions[name] as string;
      if (version) {
        context.logger.info(`Bazel will reuse existing version for ${name}: ${version}`);
      }
    });

    const workspaceVersions = {
      'RULES_NODEJS_VERSION': '0.16.5',
      'RULES_TYPESCRIPT_VERSION': '0.22.1',
      'ANGULAR_VERSION': existingVersions.Angular || clean(latestVersions.Angular),
      'RXJS_VERSION': existingVersions.RxJs || clean(latestVersions.RxJs),
      // TODO(kyliau): Consider moving this to latest-versions.ts
      'RULES_SASS_VERSION': '1.15.1',
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
