/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentMigrator, MIGRATORS} from './rules';
import {DevkitFileSystem, UpdateProject, findStylesheetFiles} from '@angular/cdk/schematics';
import {Rule, SchematicContext, Tree} from '@angular-devkit/schematics';

import {RuntimeCodeMigration} from './rules/ts-migration/runtime-migration';
import {Schema} from './schema';
import {TemplateMigration} from './rules/template-migration';
import {ThemingStylesMigration} from './rules/theming-styles';
import {dirname} from 'path';

/** Groups of components that must be migrated together. */
const migrationGroups = [
  ['autocomplete', 'form-field', 'input', 'select'],
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

export default function (options: Schema): Rule {
  const componentsToMigrate = getComponentsToMigrate(options.components);
  const tsconfigPath = options.tsconfig;
  const migrationDir = options.directory ?? dirname(tsconfigPath);

  console.log('Migrating:', [...componentsToMigrate]);
  console.log('Directory:', migrationDir);

  const migrators: ComponentMigrator[] = [];
  for (let i = 0; i < MIGRATORS.length; i++) {
    if (componentsToMigrate.has(MIGRATORS[i].component)) {
      migrators.push(MIGRATORS[i]);
    }
  }

  return (tree: Tree, context: SchematicContext) => {
    const fileSystem = new DevkitFileSystem(tree);
    const program = UpdateProject.createProgramFromTsconfig(
      fileSystem.resolve(tsconfigPath),
      fileSystem,
    );

    const additionalStylesheetPaths = findStylesheetFiles(tree, migrationDir);
    const project = new UpdateProject(context, program, fileSystem, new Set(), context.logger);
    const {hasFailures} = project.migrate(
      [ThemingStylesMigration, TemplateMigration, RuntimeCodeMigration],
      null,
      migrators,
      additionalStylesheetPaths,
    );

    // Commit all recorded edits in the update recorder. We apply the edits after all
    // migrations ran because otherwise offsets in the TypeScript program would be
    // shifted and individual migrations could no longer update the same source file.
    fileSystem.commitEdits();

    if (hasFailures) {
      context.logger.error('Unable to migrate project. See errors above.');
    } else {
      context.logger.info('Successfully migrated the project.');
    }

    return tree;
  };
}
