/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {ErrorCode} from './code';

export class FatalDiagnosticError {
  constructor(readonly code: ErrorCode, readonly node: ts.Node, readonly message: string) {}

  /**
   * @internal
   */
  _isFatalDiagnosticError = true;

  toDiagnostic(): ts.DiagnosticWithLocation {
    const node = ts.getOriginalNode(this.node);
    return {
      category: ts.DiagnosticCategory.Error,
      code: Number('-99' + this.code.valueOf()),
      file: ts.getOriginalNode(this.node).getSourceFile(),
      start: node.getStart(undefined, false),
      length: node.getWidth(),
      messageText: this.message,
    };
  }
}

export function isFatalDiagnosticError(err: any): err is FatalDiagnosticError {
  return err._isFatalDiagnosticError === true;
}
