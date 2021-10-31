/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {ErrorCode} from './error_code';
import {ngErrorCode} from './util';

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

export function makeDiagnosticChain(
    messageText: string, next?: ts.DiagnosticMessageChain[]): ts.DiagnosticMessageChain {
  return {
    category: ts.DiagnosticCategory.Message,
    code: 0,
    messageText,
    next,
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

export function addDiagnosticChain(
    messageText: string|ts.DiagnosticMessageChain,
    add: ts.DiagnosticMessageChain[]): ts.DiagnosticMessageChain {
  if (typeof messageText === 'string') {
    return makeDiagnosticChain(messageText, add);
  }

  if (messageText.next === undefined) {
    messageText.next = add;
  } else {
    messageText.next.push(...add);
  }

  return messageText;
}

export function isFatalDiagnosticError(err: any): err is FatalDiagnosticError {
  return err._isFatalDiagnosticError === true;
}
