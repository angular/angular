/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {json, normalize, virtualFs, workspaces} from '@angular-devkit/core';
import {Tree} from '@angular-devkit/schematics';

/**
 * Gets all tsconfig paths from a CLI project by reading the workspace configuration
 * and looking for common tsconfig locations.
 *
 * When `angularBuildersOnly` is set, only targets that use an Angular builder are considered.
 * This avoids picking up tsconfig files of non-Angular projects in a mixed workspace (e.g. an Nx
 * monorepo), which should not be touched by Angular migrations.
 */
export async function getProjectTsConfigPaths(
  tree: Tree,
  {angularBuildersOnly = false}: {angularBuildersOnly?: boolean} = {},
): Promise<{buildPaths: string[]; testPaths: string[]}> {
  // Start with some tsconfig paths that are generally used within CLI projects. Note
  // that we are not interested in IDE-specific tsconfig files (e.g. /tsconfig.json)
  const buildPaths = new Set<string>();
  const testPaths = new Set<string>();

  const workspace = await getWorkspace(tree);
  for (const [, project] of workspace.projects) {
    for (const [name, target] of project.targets) {
      if (angularBuildersOnly && !isAngularBuilder(target.builder)) {
        continue;
      }

      for (const [, options] of allTargetOptions(target)) {
        const tsConfig = options['tsConfig'];
        // Filter out tsconfig files that don't exist in the CLI project.
        if (typeof tsConfig !== 'string' || !tree.exists(tsConfig)) {
          continue;
        }

        if (name === 'test' || name.includes('test')) {
          testPaths.add(normalize(tsConfig));
        } else {
          buildPaths.add(normalize(tsConfig));
        }
      }
    }
  }

  return {
    buildPaths: [...buildPaths],
    testPaths: [...testPaths],
  };
}

/** Prefixes of Angular builders, including common community builders (e.g. Nx). */
const angularBuilderPrefixes = [
  '@angular-devkit/build-angular:',
  '@angular/build:',
  '@nx/angular:',
  '@angular-builders/',
  'ngx-build-plus:',
];

/** Whether the given builder is a recognized Angular builder. */
function isAngularBuilder(builder: string | undefined): boolean {
  return (
    builder !== undefined && angularBuilderPrefixes.some((prefix) => builder.startsWith(prefix))
  );
}

/** Get options for all configurations for the passed builder target. */
function* allTargetOptions(
  target: workspaces.TargetDefinition,
): Iterable<[string | undefined, Record<string, json.JsonValue | undefined>]> {
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

function createHost(tree: Tree): workspaces.WorkspaceHost {
  return {
    async readFile(path: string): Promise<string> {
      const data = tree.read(path) as unknown as virtualFs.FileBuffer;
      if (!data) {
        throw new Error('File not found.');
      }

      return virtualFs.fileBufferToString(data);
    },
    async writeFile(path: string, data: string): Promise<void> {
      return tree.overwrite(path, data);
    },
    async isDirectory(path: string): Promise<boolean> {
      // Approximate a directory check.
      // We don't need to consider empty directories and hence this is a good enough approach.
      // This is also per documentation, see:
      // https://angular.dev/tools/cli/schematics-for-libraries#get-the-project-configuration
      return !tree.exists(path) && tree.getDir(path).subfiles.length > 0;
    },
    async isFile(path: string): Promise<boolean> {
      return tree.exists(path);
    },
  };
}

async function getWorkspace(tree: Tree): Promise<workspaces.WorkspaceDefinition> {
  const host = createHost(tree);
  const {workspace} = await workspaces.readWorkspace('/', host);

  return workspace;
}
