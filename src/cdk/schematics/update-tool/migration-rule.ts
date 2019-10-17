/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {logging} from '@angular-devkit/core';
import {SchematicContext, Tree, UpdateRecorder} from '@angular-devkit/schematics';
import * as ts from 'typescript';
import {ResolvedResource} from './component-resource-collector';
import {TargetVersion} from './target-version';
import {LineAndCharacter} from './utils/line-mappings';

export interface MigrationFailure {
  filePath: string;
  message: string;
  position?: LineAndCharacter;
}

export class MigrationRule<T> {
  /** List of migration failures that need to be reported. */
  failures: MigrationFailure[] = [];

  /** Whether the migration rule is enabled or not. */
  ruleEnabled = true;

  constructor(
      /** TypeScript program for the migration. */
      public program: ts.Program,
      /** TypeChecker instance for the analysis program. */
      public typeChecker: ts.TypeChecker,
      /** Version for which the migration rule should run. */
      public targetVersion: TargetVersion,
      /** Upgrade data passed to the migration. */
      public upgradeData: T,
      /** Devkit tree for the current migration. Can be used to insert/remove files. */
      public tree: Tree,
      /** Gets the update recorder for a given source file or resolved template. */
      public getUpdateRecorder: (filePath: string) => UpdateRecorder,
      /** Base directory of the virtual file system tree. */
      public basePath: string,
      /** Logger that can be used to print messages as part of the migration. */
      public logger: logging.LoggerApi,
      /** Whether the migration runs for a test target. */
      public isTestTarget: boolean,
      /** Path to the tsconfig that is migrated. */
      public tsconfigPath: string) {}

  /** Method can be used to perform global analysis of the program. */
  init(): void {}

  /**
   * Method that will be called once all nodes, templates and stylesheets
   * have been visited.
   */
  postAnalysis(): void {}

  /**
   * Method that will be called for each node in a given source file. Unlike tslint, this
   * function will only retrieve TypeScript nodes that need to be casted manually. This
   * allows us to only walk the program source files once per program and not per
   * migration rule (significant performance boost).
   */
  visitNode(node: ts.Node): void {}

  /** Method that will be called for each Angular template in the program. */
  visitTemplate(template: ResolvedResource): void {}

  /** Method that will be called for each stylesheet in the program. */
  visitStylesheet(stylesheet: ResolvedResource): void {}

  /** Creates a failure with a specified message at the given node location. */
  createFailureAtNode(node: ts.Node, message: string) {
    const sourceFile = node.getSourceFile();
    this.failures.push({
      filePath: sourceFile.fileName,
      position: ts.getLineAndCharacterOfPosition(sourceFile, node.getStart()),
      message: message,
    });
  }

  /** Prints the specified message with "info" loglevel. */
  printInfo(text: string) {
    this.logger.info(`- ${this.tsconfigPath}: ${text}`);
  }

  /**
   * Static method that will be called once the migration of all project targets
   * has been performed. This method can be used to make changes respecting the
   * migration result of all individual targets. e.g. removing HammerJS if it
   * is not needed in any project target.
   */
  static globalPostMigration(tree: Tree, context: SchematicContext) {}
}
