/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CompilerOptions} from '@angular/compiler-cli';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import {MigrationConfig} from '@angular/core/schematics/migrations/signal-migration/src';
import {ApplyRefactoringProgressFn, ApplyRefactoringResult} from '../../../api';
import ts from 'typescript';
import {isTypeScriptFile} from '../../utils';
import {findTightestNode, getParentClassDeclaration} from '../../utils/ts_utils';
import type {ActiveRefactoring} from '../refactoring';
import {applySignalInputRefactoring} from './apply_input_refactoring';
import {isDecoratorInputClassField, isDirectiveOrComponentWithInputs} from './decorators';

/**
 * Base language service refactoring action that can convert `@Input()`
 * declarations of a full class to signal inputs.
 *
 * The user can click on an class with `@Input`s and ask for all the input to be migrated.
 * All references, imports and the declaration are updated automatically.
 */
abstract class BaseConvertFullClassToSignalInputsRefactoring implements ActiveRefactoring {
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
    if (!isDirectiveOrComponentWithInputs(classDecl, reflector)) {
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
    return isDecoratorInputClassField(parentClassElement, reflector);
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

    return await applySignalInputRefactoring(
      compiler,
      compilerOptions,
      this.config,
      this.project,
      reportProgress,
      (input) => input.descriptor.node.parent === containingClass,
      /** allowPartialMigration */ true,
    );
  }
}

export class ConvertFullClassToSignalInputsRefactoring extends BaseConvertFullClassToSignalInputsRefactoring {
  static id = 'convert-full-class-to-signal-inputs-safe-mode';
  static description = "Full class: Convert all @Input's to signal inputs (safe)";
  override config: MigrationConfig = {};
}
export class ConvertFullClassToSignalInputsBestEffortRefactoring extends BaseConvertFullClassToSignalInputsRefactoring {
  static id = 'convert-full-class-to-signal-inputs-best-effort-mode';
  static description =
    "Full class: Convert all @Input's to signal inputs (forcibly, ignoring errors)";
  override config: MigrationConfig = {bestEffortMode: true};
}
