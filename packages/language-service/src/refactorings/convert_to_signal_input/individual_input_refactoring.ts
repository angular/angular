/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CompilerOptions} from '@angular/compiler-cli';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import {
  isInputContainerNode,
  MigrationConfig,
} from '@angular/core/schematics/migrations/signal-migration/src';
import {ApplyRefactoringProgressFn, ApplyRefactoringResult} from '../../../api';
import ts from 'typescript';
import {isTypeScriptFile} from '../../utils';
import {findTightestNode, getParentClassDeclaration} from '../../utils/ts_utils';
import type {ActiveRefactoring} from '../refactoring';
import {applySignalInputRefactoring} from './apply_input_refactoring';
import {isDecoratorInputClassField} from './decorators';
import {isDirectiveOrComponent} from '../../utils/decorators';

/**
 * Base language service refactoring action that can convert a
 * single individual `@Input()` declaration to a signal inputs
 *
 * The user can click on an `@Input` property declaration in e.g. the VSCode
 * extension and ask for the input to be migrated. All references, imports and
 * the declaration are updated automatically.
 */
abstract class BaseConvertFieldToSignalInputRefactoring implements ActiveRefactoring {
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
    if (!isDirectiveOrComponent(classDecl, reflector)) {
      return false;
    }

    const parentClassElement = ts.findAncestor(node, (n) => ts.isClassElement(n) || ts.isBlock(n));
    // If we are inside a body of e.g. an accessor, this action should not show up.
    if (parentClassElement === undefined || ts.isBlock(parentClassElement)) {
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

    const containingClassElement = ts.findAncestor(node, ts.isClassElement);
    if (containingClassElement === undefined || !isInputContainerNode(containingClassElement)) {
      return {edits: [], errorMessage: 'Selected node does not belong to an input.'};
    }

    return await applySignalInputRefactoring(
      compiler,
      compilerOptions,
      this.config,
      this.project,
      reportProgress,
      (input) => input.descriptor.node === containingClassElement,
      /** allowPartialMigration */ false,
    );
  }
}

export class ConvertFieldToSignalInputRefactoring extends BaseConvertFieldToSignalInputRefactoring {
  static id = 'convert-field-to-signal-input-safe-mode';
  static description = 'Convert this @Input() to a signal input (safe)';
  override config: MigrationConfig = {};
}
export class ConvertFieldToSignalInputBestEffortRefactoring extends BaseConvertFieldToSignalInputRefactoring {
  static id = 'convert-field-to-signal-input-best-effort-mode';
  static description = 'Convert this @Input() to a signal input (forcibly, ignoring errors)';
  override config: MigrationConfig = {bestEffortMode: true};
}
