/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Rule, SchematicsException, Tree} from '@angular-devkit/schematics';
import {existsSync, statSync} from 'fs';
import {join, relative} from 'path';

import {normalizePath} from '../../utils/change_tracker';
import {getProjectTsConfigPaths} from '../../utils/project_tsconfig_paths';
import {canMigrateFile, createMigrationProgram} from '../../utils/typescript/compiler_host';

import {RouteMigrationData, migrateFileToLazyRoutes} from './to-lazy-routes';

interface Options {
  path: string;
}

export function migrate(options: Options): Rule {
  return async (tree, context) => {
    const {buildPaths} = await getProjectTsConfigPaths(tree);
    const basePath = process.cwd();
    // TS and Schematic use paths in POSIX format even on Windows. This is needed as otherwise
    // string matching such as `sourceFile.fileName.startsWith(pathToMigrate)` might not work.
    const pathToMigrate = normalizePath(join(basePath, options.path));

    if (!buildPaths.length) {
      throw new SchematicsException(
        'Could not find any tsconfig file. Cannot run the route lazy loading migration.',
      );
    }

    let migratedRoutes: RouteMigrationData[] = [];
    let skippedRoutes: RouteMigrationData[] = [];

    for (const tsconfigPath of buildPaths) {
      const {migratedRoutes: migrated, skippedRoutes: skipped} = standaloneRoutesMigration(
        tree,
        tsconfigPath,
        basePath,
        pathToMigrate,
        options,
      );

      migratedRoutes.push(...migrated);
      skippedRoutes.push(...skipped);
    }

    if (migratedRoutes.length === 0 && skippedRoutes.length === 0) {
      throw new SchematicsException(
        `Could not find any files to migrate under the path ${pathToMigrate}.`,
      );
    }

    context.logger.info('🎉 Automated migration step has finished! 🎉');

    context.logger.info(`Number of updated routes: ${migratedRoutes.length}`);
    context.logger.info(`Number of skipped routes: ${skippedRoutes.length}`);

    if (skippedRoutes.length > 0) {
      context.logger.info(
        `Note: this migration was unable to optimize the following routes, since they use components declared in NgModules:`,
      );

      for (const route of skippedRoutes) {
        context.logger.info(`- \`${route.path}\` path at \`${route.file}\``);
      }

      context.logger.info(
        `Consider making those components standalone and run this migration again. More information about standalone migration can be found at https://angular.dev/reference/migrations/standalone`,
      );
    }

    context.logger.info(
      'IMPORTANT! Please verify manually that your application builds and behaves as expected.',
    );
    context.logger.info(
      `See https://angular.dev/reference/migrations/route-lazy-loading for more information.`,
    );
  };
}

function standaloneRoutesMigration(
  tree: Tree,
  tsconfigPath: string,
  basePath: string,
  pathToMigrate: string,
  schematicOptions: Options,
): {migratedRoutes: RouteMigrationData[]; skippedRoutes: RouteMigrationData[]} {
  if (schematicOptions.path.startsWith('..')) {
    throw new SchematicsException(
      'Cannot run route lazy loading migration outside of the current project.',
    );
  }

  if (existsSync(pathToMigrate) && !statSync(pathToMigrate).isDirectory()) {
    throw new SchematicsException(
      `Migration path ${pathToMigrate} has to be a directory. Cannot run the route lazy loading migration.`,
    );
  }

  const program = createMigrationProgram(tree, tsconfigPath, basePath);
  const sourceFiles = program
    .getSourceFiles()
    .filter(
      (sourceFile) =>
        sourceFile.fileName.startsWith(pathToMigrate) &&
        canMigrateFile(basePath, sourceFile, program),
    );

  const migratedRoutes: RouteMigrationData[] = [];
  const skippedRoutes: RouteMigrationData[] = [];

  if (sourceFiles.length === 0) {
    return {migratedRoutes, skippedRoutes};
  }

  for (const sourceFile of sourceFiles) {
    const {
      pendingChanges,
      skippedRoutes: skipped,
      migratedRoutes: migrated,
    } = migrateFileToLazyRoutes(sourceFile, program);

    skippedRoutes.push(...skipped);
    migratedRoutes.push(...migrated);

    const update = tree.beginUpdate(relative(basePath, sourceFile.fileName));

    pendingChanges.forEach((change) => {
      if (change.removeLength != null) {
        update.remove(change.start, change.removeLength);
      }
      update.insertRight(change.start, change.text);
    });

    tree.commitUpdate(update);
  }

  return {migratedRoutes, skippedRoutes};
}
