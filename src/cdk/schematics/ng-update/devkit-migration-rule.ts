/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Rule, SchematicContext, Tree} from '@angular-devkit/schematics';
import {NodePackageInstallTask} from '@angular-devkit/schematics/tasks';
import {ProjectDefinition} from '@angular-devkit/core/src/workspace';

import {UpdateProject} from '../update-tool';
import {WorkspacePath} from '../update-tool/file-system';
import {MigrationCtor} from '../update-tool/migration';
import {TargetVersion} from '../update-tool/target-version';
import {getTargetTsconfigPath, getWorkspaceConfigGracefully} from '../utils/project-tsconfig-paths';

import {DevkitFileSystem} from './devkit-file-system';
import {DevkitContext, DevkitMigration, DevkitMigrationCtor} from './devkit-migration';
import {findStylesheetFiles} from './find-stylesheets';
import {AttributeSelectorsMigration} from './migrations/attribute-selectors';
import {ClassInheritanceMigration} from './migrations/class-inheritance';
import {ClassNamesMigration} from './migrations/class-names';
import {ConstructorSignatureMigration} from './migrations/constructor-signature';
import {CssSelectorsMigration} from './migrations/css-selectors';
import {ElementSelectorsMigration} from './migrations/element-selectors';
import {InputNamesMigration} from './migrations/input-names';
import {MethodCallArgumentsMigration} from './migrations/method-call-arguments';
import {MiscTemplateMigration} from './migrations/misc-template';
import {OutputNamesMigration} from './migrations/output-names';
import {PropertyNamesMigration} from './migrations/property-names';
import {UpgradeData} from './upgrade-data';
import {SymbolRemovalMigration} from './migrations/symbol-removal';

/** List of migrations which run for the CDK update. */
export const cdkMigrations: MigrationCtor<UpgradeData>[] = [
  AttributeSelectorsMigration,
  ClassInheritanceMigration,
  ClassNamesMigration,
  ConstructorSignatureMigration,
  CssSelectorsMigration,
  ElementSelectorsMigration,
  InputNamesMigration,
  MethodCallArgumentsMigration,
  MiscTemplateMigration,
  OutputNamesMigration,
  PropertyNamesMigration,
  SymbolRemovalMigration,
];

export type NullableDevkitMigration = MigrationCtor<UpgradeData | null, DevkitContext>;

type PostMigrationFn = (
  context: SchematicContext,
  targetVersion: TargetVersion,
  hasFailure: boolean,
) => void;

/**
 * Creates a Angular schematic rule that runs the upgrade for the
 * specified target version.
 */
export function createMigrationSchematicRule(
  targetVersion: TargetVersion,
  extraMigrations: NullableDevkitMigration[],
  upgradeData: UpgradeData,
  onMigrationCompleteFn?: PostMigrationFn,
): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const logger = context.logger;
    const workspace = await getWorkspaceConfigGracefully(tree);

    if (workspace === null) {
      logger.error('Could not find workspace configuration file.');
      return;
    }

    // Keep track of all project source files which have been checked/migrated. This is
    // necessary because multiple TypeScript projects can contain the same source file and
    // we don't want to check these again, as this would result in duplicated failure messages.
    const analyzedFiles = new Set<WorkspacePath>();
    const fileSystem = new DevkitFileSystem(tree);
    const projectNames = workspace.projects.keys();
    const migrations = [...cdkMigrations, ...extraMigrations] as NullableDevkitMigration[];
    let hasFailures = false;

    for (const projectName of projectNames) {
      const project = workspace.projects.get(projectName)!;
      const buildTsconfigPath = getTargetTsconfigPath(project, 'build');
      const testTsconfigPath = getTargetTsconfigPath(project, 'test');

      if (!buildTsconfigPath && !testTsconfigPath) {
        logger.warn(
          `Skipping migration for project ${projectName}. Unable to determine 'tsconfig.json' file in workspace config.`,
        );
        continue;
      }

      // In some applications, developers will have global stylesheets which are not
      // specified in any Angular component. Therefore we glob up all CSS and SCSS files
      // in the project and migrate them if needed.
      // TODO: rework this to collect global stylesheets from the workspace config.
      // TODO: https://github.com/angular/components/issues/24032.
      const additionalStylesheetPaths = findStylesheetFiles(tree, project.root);

      if (buildTsconfigPath !== null) {
        runMigrations(project, projectName, buildTsconfigPath, additionalStylesheetPaths, false);
      }
      if (testTsconfigPath !== null) {
        runMigrations(project, projectName, testTsconfigPath, additionalStylesheetPaths, true);
      }
    }

    let runPackageManager = false;
    // Run the global post migration static members for all
    // registered devkit migrations.
    migrations.forEach(m => {
      const actionResult =
        isDevkitMigration(m) && m.globalPostMigration !== undefined
          ? m.globalPostMigration(tree, targetVersion, context)
          : null;
      if (actionResult) {
        runPackageManager = runPackageManager || actionResult.runPackageManager;
      }
    });

    // If a migration requested the package manager to run, we run it as an
    // asynchronous post migration task. We cannot run it synchronously,
    // as file changes from the current migration task are not applied to
    // the file system yet.
    if (runPackageManager) {
      context.addTask(new NodePackageInstallTask({quiet: false}));
    }

    if (onMigrationCompleteFn) {
      onMigrationCompleteFn(context, targetVersion, hasFailures);
    }

    /** Runs the migrations for the specified workspace project. */
    function runMigrations(
      project: ProjectDefinition,
      projectName: string,
      tsconfigPath: WorkspacePath,
      additionalStylesheetPaths: string[],
      isTestTarget: boolean,
    ) {
      const program = UpdateProject.createProgramFromTsconfig(tsconfigPath, fileSystem);
      const updateContext: DevkitContext = {
        isTestTarget,
        projectName,
        project,
        tree,
      };

      const updateProject = new UpdateProject(
        updateContext,
        program,
        fileSystem,
        analyzedFiles,
        context.logger,
      );

      const result = updateProject.migrate(
        migrations,
        targetVersion,
        upgradeData,
        additionalStylesheetPaths,
      );

      // Commit all recorded edits in the update recorder. We apply the edits after all
      // migrations ran because otherwise offsets in the TypeScript program would be
      // shifted and individual migrations could no longer update the same source file.
      fileSystem.commitEdits();

      hasFailures = hasFailures || result.hasFailures;
    }
  };
}

/** Whether the given migration type refers to a devkit migration */
export function isDevkitMigration(
  value: MigrationCtor<any, any>,
): value is DevkitMigrationCtor<any> {
  return DevkitMigration.isPrototypeOf(value);
}
