/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {ErrorCode} from './error_code';

export class FatalDiagnosticError {
  constructor(readonly code: ErrorCode, readonly node: ts.Node, readonly message: string) {}

  /**
   * @internal
   */
  _isFatalDiagnosticError = true;

  toDiagnostic(): ts.DiagnosticWithLocation {
    return makeDiagnostic(this.code, this.node, this.message);
  }
}

export function makeDiagnostic(code: ErrorCode, node: ts.Node, messageText: string, relatedInfo?: {
  node: ts.Node,
  messageText: string,
}[]): ts.DiagnosticWithLocation {
  node = ts.getOriginalNode(node);
  const diag: ts.DiagnosticWithLocation = {
    category: ts.DiagnosticCategory.Error,
    code: Number('-99' + code.valueOf()),
    file: ts.getOriginalNode(node).getSourceFile(),
    start: node.getStart(undefined, false),
    length: node.getWidth(),
    messageText,
  };
  if (relatedInfo !== undefined) {
    diag.relatedInformation = relatedInfo.map(info => {
      const infoNode = ts.getOriginalNode(info.node);
      return {
        category: ts.DiagnosticCategory.Message,
        code: 0,
        file: infoNode.getSourceFile(),
        start: infoNode.getStart(),
        length: infoNode.getWidth(),
        messageText: info.messageText,
      };
    });
  }
  return diag;
}

export function isFatalDiagnosticError(err: any): err is FatalDiagnosticError {
  return err._isFatalDiagnosticError === true;
}
