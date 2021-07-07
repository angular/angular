/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RuleFailure, Rules} from 'tslint';
import * as ts from 'typescript';
import {TslintUpdateRecorder} from '../undecorated-classes-with-decorated-fields/google3/tslint_update_recorder';
import {UndecoratedClassesWithDecoratedFieldsTransform} from '../undecorated-classes-with-decorated-fields/transform';

/**
 * TSLint rule that adds an Angular decorator to classes that have Angular field decorators.
 * https://hackmd.io/vuQfavzfRG6KUCtU7oK_EA
 */
export class Rule extends Rules.TypedRule {
  override applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[] {
    const typeChecker = program.getTypeChecker();
    const ruleName = this.ruleName;
    const sourceFiles = program.getSourceFiles().filter(
        s => !s.isDeclarationFile && !program.isSourceFileFromExternalLibrary(s));
    const updateRecorders = new Map<ts.SourceFile, TslintUpdateRecorder>();
    const transform =
        new UndecoratedClassesWithDecoratedFieldsTransform(typeChecker, getUpdateRecorder);

    // Migrate all source files in the project.
    transform.migrate(sourceFiles);

    // Record the changes collected in the import manager.
    transform.recordChanges();

    if (updateRecorders.has(sourceFile)) {
      return updateRecorders.get(sourceFile)!.failures;
    }
    return [];

    /** Gets the update recorder for the specified source file. */
    function getUpdateRecorder(sourceFile: ts.SourceFile): TslintUpdateRecorder {
      if (updateRecorders.has(sourceFile)) {
        return updateRecorders.get(sourceFile)!;
      }
      const recorder = new TslintUpdateRecorder(ruleName, sourceFile);
      updateRecorders.set(sourceFile, recorder);
      return recorder;
    }
  }
}
