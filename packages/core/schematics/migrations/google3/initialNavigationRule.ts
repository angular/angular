/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RuleFailure, Rules} from 'tslint';
import * as ts from 'typescript';

import {InitialNavigationCollector} from '../initial-navigation/collector';
import {TslintUpdateRecorder} from '../initial-navigation/google3/tslint_update_recorder';
import {InitialNavigationTransform} from '../initial-navigation/transform';



/**
 * TSLint rule that updates RouterModule `forRoot` options to be in line with v10 updates.
 */
export class Rule extends Rules.TypedRule {
  applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[] {
    const ruleName = this.ruleName;
    const typeChecker = program.getTypeChecker();
    const sourceFiles = program.getSourceFiles().filter(
        s => !s.isDeclarationFile && !program.isSourceFileFromExternalLibrary(s));
    const initialNavigationCollector = new InitialNavigationCollector(typeChecker);
    const failures: RuleFailure[] = [];

    // Analyze source files by detecting all ExtraOptions#InitialNavigation assignments
    sourceFiles.forEach(sourceFile => initialNavigationCollector.visitNode(sourceFile));

    const {assignments} = initialNavigationCollector;
    const transformer = new InitialNavigationTransform(getUpdateRecorder);
    const updateRecorders = new Map<ts.SourceFile, TslintUpdateRecorder>();

    transformer.migrateInitialNavigationAssignments(Array.from(assignments));

    if (updateRecorders.has(sourceFile)) {
      failures.push(...updateRecorders.get(sourceFile)!.failures);
    }

    return failures;

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
