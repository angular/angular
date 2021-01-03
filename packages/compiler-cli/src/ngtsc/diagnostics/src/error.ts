/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {ErrorCode, ngErrorCode} from './error_code';

export class FatalDiagnosticError {
  constructor(
      readonly code: ErrorCode, readonly node: ts.Node,
      readonly message: string|ts.DiagnosticMessageChain,
      readonly relatedInformation?: ts.DiagnosticRelatedInformation[]) {}

  /**
   * @internal
   */
  _isFatalDiagnosticError = true;

  toDiagnostic(): ts.DiagnosticWithLocation {
    return makeDiagnostic(this.code, this.node, this.message, this.relatedInformation);
  }
}

export function makeDiagnostic(
    code: ErrorCode, node: ts.Node, messageText: string|ts.DiagnosticMessageChain,
    relatedInformation?: ts.DiagnosticRelatedInformation[]): ts.DiagnosticWithLocation {
  node = ts.getOriginalNode(node);
  return {
    category: ts.DiagnosticCategory.Error,
    code: ngErrorCode(code),
    file: ts.getOriginalNode(node).getSourceFile(),
    start: node.getStart(undefined, false),
    length: node.getWidth(),
    messageText,
    relatedInformation,
  };
}

export function makeRelatedInformation(
    node: ts.Node, messageText: string): ts.DiagnosticRelatedInformation {
  node = ts.getOriginalNode(node);
  return {
    category: ts.DiagnosticCategory.Message,
    code: 0,
    file: node.getSourceFile(),
    start: node.getStart(),
    length: node.getWidth(),
    messageText,
  };
}

export function isFatalDiagnosticError(err: any): err is FatalDiagnosticError {
  return err._isFatalDiagnosticError === true;
}
