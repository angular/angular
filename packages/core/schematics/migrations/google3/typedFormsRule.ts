/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Replacement, RuleFailure, Rules} from 'tslint';
import ts from 'typescript';
import {findInitTestEnvironmentCalls, findTestModuleMetadataNodes, getInitTestEnvironmentLiteralReplacement, InitTestEnvironmentAnalysis, migrateTestModuleMetadataLiteral} from '../testbed-teardown/util';

/** TSLint rule for Typed Forms migration. */
export class Rule extends Rules.TypedRule {
  private _analysis = new Map<ts.Program, InitTestEnvironmentAnalysis>();

  override applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[] {
    const typeChecker = program.getTypeChecker();
    const printer = ts.createPrinter();
    let initTestEnvironmentResult = this._analysis.get(program);

    // The analysis for `initTestEnvironment` calls only needs to run once per program.
    if (!initTestEnvironmentResult) {
      const sourceFiles = program.getSourceFiles().filter(
          s => !s.isDeclarationFile && !program.isSourceFileFromExternalLibrary(s));
      initTestEnvironmentResult = findInitTestEnvironmentCalls(typeChecker, sourceFiles);
      this._analysis.set(program, initTestEnvironmentResult);
    }

    return this._migrateFile(typeChecker, printer, sourceFile, initTestEnvironmentResult);
  }

  private _migrateFile(
      typeChecker: ts.TypeChecker, printer: ts.Printer, sourceFile: ts.SourceFile,
      initTestEnvironmentResult: InitTestEnvironmentAnalysis): RuleFailure[] {
    const failures: RuleFailure[] = [];

    // TODO

    return failures;
  }
}
