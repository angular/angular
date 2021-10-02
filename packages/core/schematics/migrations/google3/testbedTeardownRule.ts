/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Replacement, RuleFailure, Rules} from 'tslint';
import ts from 'typescript';
import {findInitTestEnvironmentCalls, findTestModuleMetadataNodes, InitTestEnvironmentAnalysis, migrateInitTestEnvironment, migrateTestModuleMetadataLiteral} from '../testbed-teardown/util';

/** TSLint rule that adds the `teardown` flag to `TestBed` calls. */
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

    // If we identified at least one call to `initTestEnvironment` (can be migrated or unmigrated),
    // we don't need to migrate `configureTestingModule` or `withModule` calls, because they'll take
    // the default teardown behavior from the environment. This is preferrable, because it'll result
    // in the least number of changes to users' code.
    if (initTestEnvironmentResult.totalCalls > 0) {
      // Migrate all of the unmigrated calls `initTestEnvironment` in this file. This could be zero
      // if the user has already opted into the new teardown behavior themselves.
      initTestEnvironmentResult.callsToMigrate.forEach(call => {
        // This analysis is global so we need to check that the call is within this file.
        if (call.getSourceFile() === sourceFile) {
          failures.push(this._getFailure(call, migrateInitTestEnvironment, printer));
        }
      });
    } else {
      // Otherwise migrate the metadata passed into the `configureTestingModule` and `withModule`
      // calls. This scenario is less likely, but it could happen if `initTestEnvironment` has been
      // abstracted away or is inside a .js file.
      findTestModuleMetadataNodes(typeChecker, sourceFile).forEach(literal => {
        failures.push(this._getFailure(literal, migrateTestModuleMetadataLiteral, printer));
      });
    }

    return failures;
  }

  private _getFailure<T extends ts.Node>(node: T, migrator: (node: T) => T, printer: ts.Printer) {
    const sourceFile = node.getSourceFile();
    const migrated = migrator(node);
    const replacementText = printer.printNode(ts.EmitHint.Unspecified, migrated, sourceFile);

    return new RuleFailure(
        sourceFile, node.getStart(), node.getEnd(), 'Teardown behavior has to be configured.',
        this.ruleName, new Replacement(node.getStart(), node.getWidth(), replacementText));
  }
}
