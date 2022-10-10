/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {join} from 'path';

import {runfiles} from '@bazel/runfiles';

const PROJECT_ROOT = '/projects/material';
const SRC = join(PROJECT_ROOT, 'src');

export const APP_ROOT = join(SRC, 'app');
export const TS_CONFIG = join(PROJECT_ROOT, 'tsconfig.app.json');
export const THEME_FILE = join(SRC, 'theme.scss');
export const APP_MODULE_FILE = join(APP_ROOT, 'app.module.ts');
export const TEMPLATE_FILE = join(APP_ROOT, 'app.component.html');

export function createNewTestRunner(): SchematicTestRunner {
  return new SchematicTestRunner(
    '@angular/material',
    runfiles.resolveWorkspaceRelative('src/material/schematics/collection.json'),
  );
}

export async function migrateComponents(
  components: string[],
  runner: SchematicTestRunner,
  tree: UnitTestTree,
): Promise<UnitTestTree> {
  return await runner
    .runSchematicAsync('mdcMigration', {tsconfig: TS_CONFIG, components: components}, tree)
    .toPromise();
}
