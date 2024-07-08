/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Tree} from '@angular-devkit/schematics';
import {readWorkspace, TargetDefinition} from '@schematics/angular/utility';
import {normalize} from 'node:path/posix';

/**
 * Gets all tsconfig paths from a CLI project by reading the workspace configuration
 * and looking for common tsconfig locations.
 */
export async function getProjectTsConfigPaths(
  tree: Tree,
): Promise<{buildPaths: string[]; testPaths: string[]}> {
  // Start with some tsconfig paths that are generally used within CLI projects. Note
  // that we are not interested in IDE-specific tsconfig files (e.g. /tsconfig.json)
  const buildPaths = new Set<string>();
  const testPaths = new Set<string>();

  const workspace = await readWorkspace(tree, '/');
  for (const [, project] of workspace.projects) {
    for (const [name, target] of project.targets) {
      if (name !== 'build' && name !== 'test') {
        continue;
      }

      for (const [, options] of allTargetOptions(target)) {
        const tsConfig = options['tsConfig'];
        // Filter out tsconfig files that don't exist in the CLI project.
        if (typeof tsConfig !== 'string' || !tree.exists(tsConfig)) {
          continue;
        }

        if (name === 'build') {
          buildPaths.add(normalize(tsConfig));
        } else {
          testPaths.add(normalize(tsConfig));
        }
      }
    }
  }

  return {
    buildPaths: [...buildPaths],
    testPaths: [...testPaths],
  };
}

/** Get options for all configurations for the passed builder target. */
function* allTargetOptions(
  target: TargetDefinition,
): Iterable<[string | undefined, Record<string, unknown>]> {
  if (target.options) {
    yield [undefined, target.options];
  }

  if (!target.configurations) {
    return;
  }

  for (const [name, options] of Object.entries(target.configurations)) {
    if (options) {
      yield [name, options];
    }
  }
}
