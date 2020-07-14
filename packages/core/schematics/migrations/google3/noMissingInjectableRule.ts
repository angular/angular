/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RuleFailure, Rules} from 'tslint';
import * as ts from 'typescript';

import {NgDefinitionCollector} from '../missing-injectable/definition_collector';
import {TslintUpdateRecorder} from '../missing-injectable/google3/tslint_update_recorder';
import {MissingInjectableTransform} from '../missing-injectable/transform';



/**
 * TSLint rule that flags classes which are declared as providers in "NgModule",
 * "Directive" or "Component" definitions while not being decorated with any
 * Angular decorator (e.g. "@Injectable").
 */
export class Rule extends Rules.TypedRule {
  applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[] {
    const ruleName = this.ruleName;
    const typeChecker = program.getTypeChecker();
    const sourceFiles = program.getSourceFiles().filter(
        s => !s.isDeclarationFile && !program.isSourceFileFromExternalLibrary(s));
    const definitionCollector = new NgDefinitionCollector(typeChecker);
    const failures: RuleFailure[] = [];

    // Analyze source files by detecting all "NgModule", "Directive" or
    // "Component" definitions.
    sourceFiles.forEach(sourceFile => definitionCollector.visitNode(sourceFile));

    const {resolvedModules, resolvedDirectives} = definitionCollector;
    const transformer = new MissingInjectableTransform(typeChecker, getUpdateRecorder);
    const updateRecorders = new Map<ts.SourceFile, TslintUpdateRecorder>();

    [...transformer.migrateModules(resolvedModules),
     ...transformer.migrateDirectives(resolvedDirectives),
    ].forEach(({message, node}) => {
      // Only report failures for the current source file that is visited.
      if (node.getSourceFile() === sourceFile) {
        failures.push(new RuleFailure(node.getSourceFile(), node.getStart(), 0, message, ruleName));
      }
    });

    // Record the changes collected in the import manager and NgModule manager.
    transformer.recordChanges();

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
