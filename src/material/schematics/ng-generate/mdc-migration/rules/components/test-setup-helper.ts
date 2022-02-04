/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {runfiles} from '@bazel/runfiles';

const TS_CONFIG = '/projects/material/tsconfig.app.json';

export const THEME_FILE = '/projects/material/src/theme.scss';

export function createNewTestRunner(): SchematicTestRunner {
  return new SchematicTestRunner(
    '@angular/material',
    runfiles.resolveWorkspaceRelative('src/material/schematics/collection.json'),
  );
}

export async function migrateComponent(
  component: string,
  runner: SchematicTestRunner,
  tree: UnitTestTree,
): Promise<UnitTestTree> {
  return await runner
    .runSchematicAsync('mdcMigration', {tsconfig: TS_CONFIG, components: [component]}, tree)
    .toPromise();
}
