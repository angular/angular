/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {ErrorCode} from './error_code';
import {ngErrorCode} from './util';

export class FatalDiagnosticError extends Error {
  constructor(
    readonly code: ErrorCode,
    readonly node: ts.Node,
    readonly diagnosticMessage: string | ts.DiagnosticMessageChain,
    readonly relatedInformation?: ts.DiagnosticRelatedInformation[],
  ) {
    super(
      `FatalDiagnosticError: Code: ${code}, Message: ${ts.flattenDiagnosticMessageText(
        diagnosticMessage,
        '\n',
      )}`,
    );

    // Extending `Error` ends up breaking some internal tests. This appears to be a known issue
    // when extending errors in TS and the workaround is to explicitly set the prototype.
    // https://stackoverflow.com/questions/41102060/typescript-extending-error-class
    Object.setPrototypeOf(this, new.target.prototype);
  }

  // Trying to hide `.message` from `Error` to encourage users to look
  // at `diagnosticMessage` instead.
  declare message: never;

  /**
   * @internal
   */
  _isFatalDiagnosticError = true;

  toDiagnostic(): ts.DiagnosticWithLocation {
    return makeDiagnostic(this.code, this.node, this.diagnosticMessage, this.relatedInformation);
  }
}

export function makeDiagnostic(
  code: ErrorCode,
  node: ts.Node,
  messageText: string | ts.DiagnosticMessageChain,
  relatedInformation?: ts.DiagnosticRelatedInformation[],
  category: ts.DiagnosticCategory = ts.DiagnosticCategory.Error,
): ts.DiagnosticWithLocation {
  node = ts.getOriginalNode(node);
  return {
    category,
    code: ngErrorCode(code),
    file: ts.getOriginalNode(node).getSourceFile(),
    start: node.getStart(undefined, false),
    length: node.getWidth(),
    messageText,
    relatedInformation,
  };
}

export function makeDiagnosticChain(
  messageText: string,
  next?: ts.DiagnosticMessageChain[],
): ts.DiagnosticMessageChain {
  return {
    category: ts.DiagnosticCategory.Message,
    code: 0,
    messageText,
    next,
  };
}

export function makeRelatedInformation(
  node: ts.Node,
  messageText: string,
): ts.DiagnosticRelatedInformation {
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
  messageText: string | ts.DiagnosticMessageChain,
  add: ts.DiagnosticMessageChain[],
): ts.DiagnosticMessageChain {
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

/**
 * Whether the compiler diagnostics represents an error related to local compilation mode.
 *
 * This helper has application in 1P where we check whether a diagnostic is related to local
 * compilation in order to add some g3 specific info to it.
 */
export function isLocalCompilationDiagnostics(diagnostic: ts.Diagnostic): boolean {
  return (
    diagnostic.code === ngErrorCode(ErrorCode.LOCAL_COMPILATION_UNRESOLVED_CONST) ||
    diagnostic.code === ngErrorCode(ErrorCode.LOCAL_COMPILATION_UNSUPPORTED_EXPRESSION)
  );
}
