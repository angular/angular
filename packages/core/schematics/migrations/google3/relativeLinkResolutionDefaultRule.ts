/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RuleFailure, Rules} from 'tslint';
import * as ts from 'typescript';

import {RelativeLinkResolutionCollector} from '../relative-link-resolution/collector';
import {TslintUpdateRecorder} from '../relative-link-resolution/google3/tslint_update_recorder';
import {RelativeLinkResolutionTransform} from '../relative-link-resolution/transform';

export class Rule extends Rules.TypedRule {
  override applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[] {
    const typeChecker = program.getTypeChecker();
    const ruleName = this.ruleName;
    const sourceFiles = program.getSourceFiles().filter(
        s => !s.isDeclarationFile && !program.isSourceFileFromExternalLibrary(s));
    const updateRecorders = new Map<ts.SourceFile, TslintUpdateRecorder>();
    const relativeLinkResolutionCollector = new RelativeLinkResolutionCollector(typeChecker);

    // Analyze source files by detecting all modules.
    sourceFiles.forEach(sourceFile => relativeLinkResolutionCollector.visitNode(sourceFile));

    const {forRootCalls, extraOptionsLiterals} = relativeLinkResolutionCollector;
    const transformer = new RelativeLinkResolutionTransform(getUpdateRecorder);
    transformer.migrateRouterModuleForRootCalls(forRootCalls);
    transformer.migrateObjectLiterals(extraOptionsLiterals);

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
