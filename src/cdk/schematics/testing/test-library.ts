/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Tree} from '@angular-devkit/schematics';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';

import {createTestProject} from './test-project';

/** Create a base library used for testing. */
export async function createTestLibrary(
  runner: SchematicTestRunner,
  appOptions = {},
  tree?: Tree,
): Promise<UnitTestTree> {
  return createTestProject(runner, 'library', appOptions, tree);
}
