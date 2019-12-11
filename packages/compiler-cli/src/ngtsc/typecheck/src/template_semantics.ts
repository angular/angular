/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, BoundTarget, ImplicitReceiver, ParseSourceSpan, PropertyWrite, RecursiveAstVisitor, TmplAstVariable} from '@angular/compiler';

import {toAbsoluteSpan} from './diagnostics';
import {OutOfBandDiagnosticRecorder} from './oob';

/**
 * Visits a template and records any semantic errors within its expressions.
 */
export class ExpressionSemanticVisitor extends RecursiveAstVisitor {
  constructor(
      private templateId: string, private boundTarget: BoundTarget<any>,
      private oob: OutOfBandDiagnosticRecorder, private sourceSpan: ParseSourceSpan) {
    super();
  }

  visitPropertyWrite(ast: PropertyWrite, context: any): void {
    super.visitPropertyWrite(ast, context);

    if (!(ast.receiver instanceof ImplicitReceiver)) {
      return;
    }

    const target = this.boundTarget.getExpressionTarget(ast);
    if (target instanceof TmplAstVariable) {
      // Template variables are read-only.
      const astSpan = toAbsoluteSpan(ast.span, this.sourceSpan);
      this.oob.illegalAssignmentToTemplateVar(this.templateId, ast, astSpan, target);
    }
  }

  static visit(
      ast: AST, sourceSpan: ParseSourceSpan, id: string, boundTarget: BoundTarget<any>,
      oob: OutOfBandDiagnosticRecorder): void {
    ast.visit(new ExpressionSemanticVisitor(id, boundTarget, oob, sourceSpan));
  }
}
