/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Tree} from '@angular-devkit/schematics';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';

/** Create a base project used for testing. */
export async function createTestProject(
  runner: SchematicTestRunner,
  projectType: 'application' | 'library',
  appOptions = {},
  tree?: Tree,
): Promise<UnitTestTree> {
  const workspaceTree = await runner
    .runExternalSchematicAsync(
      '@schematics/angular',
      'workspace',
      {
        name: 'workspace',
        version: '6.0.0',
        newProjectRoot: 'projects',
      },
      tree,
    )
    .toPromise();

  return runner
    .runExternalSchematicAsync(
      '@schematics/angular',
      projectType,
      {name: 'material', ...appOptions},
      workspaceTree,
    )
    .toPromise();
}
