/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {UpdateRecorder} from '@angular-devkit/schematics';
import * as ts from 'typescript';
import {ResolvedResource} from './component-resource-collector';
import {TargetVersion} from './target-version';
import {LineAndCharacter} from './utils/line-mappings';

export interface MigrationFailure {
  filePath: string;
  message: string;
  position: LineAndCharacter;
}

export class MigrationRule<T> {
  /** List of migration failures that need to be reported. */
  failures: MigrationFailure[] = [];

  /** Whether the migration rule is enabled or not. */
  ruleEnabled = true;

  constructor(
      public program: ts.Program, public typeChecker: ts.TypeChecker,
      public targetVersion: TargetVersion, public upgradeData: T) {}

  /** Method can be used to perform global analysis of the program. */
  init(): void {}

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

  /** Gets the update recorder for a given source file or resolved template. */
  getUpdateRecorder(filePath: string): UpdateRecorder {
    throw new Error('MigrationRule#getUpdateRecorder is not implemented.');
  }

  /** Creates a failure with a specified message at the given node location. */
  createFailureAtNode(node: ts.Node, message: string) {
    const sourceFile = node.getSourceFile();
    this.failures.push({
      filePath: sourceFile.fileName,
      position: ts.getLineAndCharacterOfPosition(sourceFile, node.getStart()),
      message: message,
    });
  }
}
