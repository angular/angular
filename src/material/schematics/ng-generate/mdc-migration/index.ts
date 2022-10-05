/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentMigrator, MIGRATORS} from './rules';
import {
  DevkitFileSystem,
  UpdateProject,
  findStylesheetFiles,
  WorkspacePath,
  getWorkspaceConfigGracefully,
  getTargetTsconfigPath,
} from '@angular/cdk/schematics';
import {Rule, SchematicContext, Tree} from '@angular-devkit/schematics';

import {RuntimeCodeMigration} from './rules/ts-migration/runtime-migration';
import {Schema} from './schema';
import {TemplateMigration} from './rules/template-migration';
import {ThemingStylesMigration} from './rules/theming-styles';

/** Groups of components that must be migrated together. */
const migrationGroups = [
  ['autocomplete', 'form-field', 'input', 'option', 'optgroup', 'select'],
  ['button'],
  ['card'],
  ['checkbox'],
  ['chips'],
  ['dialog'],
  ['list'],
  ['menu'],
  ['paginator'],
  ['progress-bar'],
  ['progress-spinner'],
  ['radio'],
  ['slide-toggle'],
  ['slider'],
  ['snack-bar'],
  ['table'],
  ['tabs'],
  ['tooltip'],
];

function getComponentsToMigrate(requested: string[]): Set<string> {
  const componentsToMigrate = new Set<string>(requested);
  if (componentsToMigrate.has('all')) {
    componentsToMigrate.clear();
    migrationGroups.forEach(group =>
      group.forEach(component => componentsToMigrate.add(component)),
    );
  } else {
    for (const group of migrationGroups) {
      if (group.some(component => componentsToMigrate.has(component))) {
        group.forEach(component => componentsToMigrate.add(component));
      }
    }
  }
  return componentsToMigrate;
}

function runMigrations(
  context: SchematicContext,
  fileSystem: DevkitFileSystem,
  tsconfigPath: WorkspacePath,
  migrators: ComponentMigrator[],
  analyzedFiles: Set<WorkspacePath>,
  additionalStylesheetPaths: string[],
): boolean {
  const program = UpdateProject.createProgramFromTsconfig(tsconfigPath, fileSystem);
  const project = new UpdateProject(context, program, fileSystem, analyzedFiles, context.logger);
  return !project.migrate(
    [ThemingStylesMigration, TemplateMigration, RuntimeCodeMigration],
    null,
    migrators,
    additionalStylesheetPaths,
  ).hasFailures;
}

export default function (options: Schema): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const logger = context.logger;
    const workspace = await getWorkspaceConfigGracefully(tree);
    if (workspace === null) {
      logger.error('Could not find workspace configuration file.');
      return;
    }

    const projectNames = workspace.projects.keys();
    const fileSystem = new DevkitFileSystem(tree);
    const analyzedFiles = new Set<WorkspacePath>();
    const componentsToMigrate = getComponentsToMigrate(options.components);
    const migrators = MIGRATORS.filter(m => componentsToMigrate.has(m.component));
    let additionalStylesheetPaths = options.directory
      ? findStylesheetFiles(tree, options.directory)
      : [];
    let success = true;

    logger.info(`Migrating components:\n${[...componentsToMigrate].join('\n')}`);

    for (const projectName of projectNames) {
      const project = workspace.projects.get(projectName)!;
      const tsconfigPaths = [
        getTargetTsconfigPath(project, 'build'),
        getTargetTsconfigPath(project, 'test'),
      ].filter((p): p is WorkspacePath => !!p);

      if (!tsconfigPaths.length) {
        logger.warn(
          `Skipping migration for project ${projectName}. Unable to determine 'tsconfig.json' file in workspace config.`,
        );
        continue;
      }

      if (!options.directory) {
        additionalStylesheetPaths = findStylesheetFiles(tree, project.root);
      }

      logger.info(`Migrating project: ${projectName}`);

      for (const tsconfigPath of tsconfigPaths) {
        success &&= runMigrations(
          context,
          fileSystem,
          tsconfigPath,
          migrators,
          analyzedFiles,
          additionalStylesheetPaths,
        );
      }
    }

    // Commit all recorded edits in the update recorder. We apply the edits after all
    // migrations ran because otherwise offsets in the TypeScript program would be
    // shifted and individual migrations could no longer update the same source file.
    fileSystem.commitEdits();

    if (!success) {
      logger.error('Unable to migrate project. See errors above.');
    } else {
      logger.info('Successfully migrated the project.');
    }
  };
}
