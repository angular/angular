/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RuleFailure, Rules} from 'tslint';
import * as ts from 'typescript';

import {NgDirectiveVisitor} from '../directive_visitor';
import {UndecoratedBaseClassTransform} from '../transform';

import {TslintUpdateRecorder} from './tslint_update_recorder';

let lastSourceFile: ts.SourceFile|null = null;
let prevSelectorIdx = 1;
let selectorIdx = 1;

/**
 * Google3 tslint rule for the undecorated base class schematic. Rule
 * can be used as fixer to make undecorated base classes work with Ivy.
 */
export class Rule extends Rules.TypedRule {
  applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[] {
    // In case the previous source file is equal to the current one, we need to restore
    // the previous selector index. This is necessary because TSLint runs the rule multiple
    // times for a source-file and we need to keep the selector indices similar.
    if (sourceFile === lastSourceFile) {
      selectorIdx = prevSelectorIdx;
    } else {
      lastSourceFile = sourceFile;
      prevSelectorIdx = selectorIdx;
    }

    const ruleName = this.ruleName;
    const typeChecker = program.getTypeChecker();
    const sourceFiles = program.getSourceFiles().filter(
        s => !s.isDeclarationFile && !program.isSourceFileFromExternalLibrary(s));
    const directiveVisitor = new NgDirectiveVisitor(typeChecker);
    const failures: RuleFailure[] = [];

    // Analyze source files by detecting all directive and components.
    sourceFiles.forEach(sourceFile => directiveVisitor.visitNode(sourceFile));

    const {resolvedDirectives, directiveModules} = directiveVisitor;
    const transformer = new UndecoratedBaseClassTransform(
        typeChecker, directiveModules, getUpdateRecorder, () => selectorIdx++);
    const updateRecorders = new Map<ts.SourceFile, TslintUpdateRecorder>();

    resolvedDirectives.forEach(classDecl => {
      // For the TSLint rule we only want to check directives within the
      // current source file.
      if (classDecl.getSourceFile() !== sourceFile) {
        return;
      }

      transformer.migrateDirective(classDecl).forEach(({message, node}) => {
        failures.push(new RuleFailure(node.getSourceFile(), node.getStart(), 0, message, ruleName));
      });
    });

    // Record the changes collected in the import manager and NgModule manager.
    transformer.recordChanges();

    // Walk through each update recorder and commit the update. We need to add the
    // replacements in batches per source file as there can be only one recorder
    // per source file in order to not incorrectly shift offsets.
    updateRecorders.forEach((recorder) => { failures.push(...recorder.failures); });

    return failures;

    /** Gets the update recorder for the specified source file. */
    function getUpdateRecorder(sourceFile: ts.SourceFile): TslintUpdateRecorder {
      if (updateRecorders.has(sourceFile)) {
        return updateRecorders.get(sourceFile) !;
      }
      const recorder = new TslintUpdateRecorder(ruleName, sourceFile);
      updateRecorders.set(sourceFile, recorder);
      return recorder;
    }
  }
}
