/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CompilerOptions, NgCompiler} from '@angular/compiler-cli';
import {MigrationConfig} from '@angular/core/schematics/migrations/signal-migration/src';
import ts from 'typescript';
import {ApplyRefactoringProgressFn, ApplyRefactoringResult} from '../../../api';
import {isTypeScriptFile} from '../../utils';
import {findTightestNode, getParentClassDeclaration} from '../../utils/ts_utils';
import type {ActiveRefactoring} from '../refactoring';
import {applySignalQueriesRefactoring} from './apply_query_refactoring';
import {isDecoratorQueryClassField, isDirectiveOrComponentWithQueries} from './decorators';

/**
 * Base language service refactoring action that can convert decorator
 * queries of a full class to signal queries.
 *
 * The user can click on an class with decorator queries and ask for all the queries
 * to be migrated. All references, imports and the declaration are updated automatically.
 */
abstract class BaseConvertFullClassToSignalQueriesRefactoring implements ActiveRefactoring {
  abstract config: MigrationConfig;

  constructor(private project: ts.server.Project) {}

  static isApplicable(
    compiler: NgCompiler,
    fileName: string,
    positionOrRange: number | ts.TextRange,
  ): boolean {
    if (!isTypeScriptFile(fileName)) {
      return false;
    }

    const sf = compiler.getCurrentProgram().getSourceFile(fileName);
    if (sf === undefined) {
      return false;
    }

    const start = typeof positionOrRange === 'number' ? positionOrRange : positionOrRange.pos;
    const node = findTightestNode(sf, start);
    if (node === undefined) {
      return false;
    }

    const classDecl = getParentClassDeclaration(node);
    if (classDecl === undefined) {
      return false;
    }
    const {reflector} = compiler['ensureAnalyzed']();
    if (!isDirectiveOrComponentWithQueries(classDecl, reflector)) {
      return false;
    }

    const parentClassElement = ts.findAncestor(node, (n) => ts.isClassElement(n) || ts.isBlock(n));
    if (parentClassElement === undefined) {
      return true;
    }
    // If we are inside a body of e.g. an accessor, this action should not show up.
    if (ts.isBlock(parentClassElement)) {
      return false;
    }
    return isDecoratorQueryClassField(parentClassElement, reflector);
  }

  async computeEditsForFix(
    compiler: NgCompiler,
    compilerOptions: CompilerOptions,
    fileName: string,
    positionOrRange: number | ts.TextRange,
    reportProgress: ApplyRefactoringProgressFn,
  ): Promise<ApplyRefactoringResult> {
    const sf = compiler.getCurrentProgram().getSourceFile(fileName);
    if (sf === undefined) {
      return {edits: []};
    }

    const start = typeof positionOrRange === 'number' ? positionOrRange : positionOrRange.pos;
    const node = findTightestNode(sf, start);
    if (node === undefined) {
      return {edits: []};
    }

    const containingClass = getParentClassDeclaration(node);
    if (containingClass === null) {
      return {edits: [], errorMessage: 'Could not find a class for the refactoring.'};
    }

    return await applySignalQueriesRefactoring(
      compiler,
      compilerOptions,
      this.config,
      this.project,
      reportProgress,
      (queryID) => queryID.node.parent === containingClass,
      /** allowPartialMigration */ true,
    );
  }
}

export class ConvertFullClassToSignalQueriesRefactoring extends BaseConvertFullClassToSignalQueriesRefactoring {
  static id = 'convert-full-class-to-signal-queries-safe-mode';
  static description = 'Full class: Convert all decorator queries to signal queries (safe)';
  override config: MigrationConfig = {};
}
export class ConvertFullClassToSignalQueriesBestEffortRefactoring extends BaseConvertFullClassToSignalQueriesRefactoring {
  static id = 'convert-full-class-to-signal-queries-best-effort-mode';
  static description =
    'Full class: Convert all decorator queries to signal queries (forcibly, ignoring errors)';
  override config: MigrationConfig = {bestEffortMode: true};
}
