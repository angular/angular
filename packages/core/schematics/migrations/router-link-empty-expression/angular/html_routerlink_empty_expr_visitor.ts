/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import type {TmplAstBoundAttribute, TmplAstElement, TmplAstTemplate} from '@angular/compiler';
import {TemplateAstVisitor} from '../../../utils/template_ast_visitor';

/**
 * HTML AST visitor that traverses the Render3 HTML AST in order to find all
 * undefined routerLink asssignment ([routerLink]="").
 */
export class RouterLinkEmptyExprVisitor extends TemplateAstVisitor {
  readonly emptyRouterLinkExpressions: TmplAstBoundAttribute[] = [];

  override visitElement(element: TmplAstElement): void {
    this.visitAll(element.inputs);
    this.visitAll(element.children);
  }

  override visitTemplate(t: TmplAstTemplate): void {
    this.visitAll(t.inputs);
    this.visitAll(t.children);
  }

  override visitBoundAttribute(node: TmplAstBoundAttribute) {
    if (node.name === 'routerLink' && node.value instanceof this.compilerModule.ASTWithSource &&
        node.value.ast instanceof this.compilerModule.EmptyExpr) {
      this.emptyRouterLinkExpressions.push(node);
    }
  }
}
