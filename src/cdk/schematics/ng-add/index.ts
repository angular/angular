/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Rule, Tree} from '@angular-devkit/schematics';
import {addPackageToPackageJson} from './package-config';

/** Name of the Angular CDK version that is shipped together with the schematics. */
export const cdkVersion = loadPackageVersionGracefully('@angular/cdk');

/**
 * Schematic factory entry-point for the `ng-add` schematic. The ng-add schematic will be
 * automatically executed if developers run `ng add @angular/cdk`.
 */
export default function(): Rule {
  return (host: Tree) => {
    // By default, the CLI already installs the package that has been installed through `ng add`.
    // We just store the version in the `package.json` in case the package manager didn't.
    addPackageToPackageJson(host, '@angular/cdk', `^${cdkVersion}`);
  };
}

/** Loads the full version from the given Angular package gracefully. */
function loadPackageVersionGracefully(packageName: string): string | null {
  try {
    return require(`${packageName}/package.json`).version;
  } catch {
    return null;
  }
}
