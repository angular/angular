/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SchematicContext, Tree} from '@angular-devkit/schematics';
import {WorkspaceProject} from '@schematics/angular/utility/workspace-models';
import {Constructor, Migration, PostMigrationAction} from '../update-tool/migration';

export type DevkitContext = {
  /** Devkit tree for the current migrations. Can be used to insert/remove files. */
  tree: Tree,
  /** Name of the project the migrations run against. */
  projectName: string;
  /** Workspace project the migrations run against. */
  project: WorkspaceProject,
  /** Absolute file system path to the workspace */
  workspaceFsPath: string,
  /** Whether the migrations run for a test target. */
  isTestTarget: boolean,
};

export abstract class DevkitMigration<Data> extends Migration<Data, DevkitContext> {

  /** Prints an informative message with context on the current target. */
  protected printInfo(text: string) {
    const targetName = this.context.isTestTarget ? 'test' : 'build';
    this.logger.info(`- ${this.context.projectName}@${targetName}: ${text}`);
  }

  /**
   * Optional static method that will be called once the migration of all project
   * targets has been performed. This method can be used to make changes respecting the
   * migration result of all individual targets. e.g. removing HammerJS if it
   * is not needed in any project target.
   */
  static globalPostMigration?(tree: Tree, context: SchematicContext): PostMigrationAction;
}

export type DevkitMigrationCtor<Data> = Constructor<DevkitMigration<Data>> &
    {[m in keyof typeof DevkitMigration]: (typeof DevkitMigration)[m]};
