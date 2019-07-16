/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ASTWithSource, AbsoluteSourceSpan, NullAstVisitor} from '@angular/compiler';
import * as t from '../../src/render3/r3_ast';
import {parseR3 as parse} from './view/util';

class ExpressionLocationHumanizer extends NullAstVisitor implements t.Visitor {
  result: any[] = [];

  visitASTWithSource(ast: ASTWithSource) { this.result.push([ast.source, ast.sourceSpan]); }

  visitTemplate(ast: t.Template) { t.visitAll(this, ast.children); }
  visitElement(ast: t.Element) {
    t.visitAll(this, ast.children);
    t.visitAll(this, ast.inputs);
    t.visitAll(this, ast.outputs);
  }
  visitReference(ast: t.Reference) {}
  visitVariable(ast: t.Variable) {}
  visitEvent(ast: t.BoundEvent) { ast.handler.visit(this); }
  visitTextAttribute(ast: t.TextAttribute) {}
  visitBoundAttribute(ast: t.BoundAttribute) { ast.value.visit(this); }
  visitBoundEvent(ast: t.BoundEvent) { ast.handler.visit(this); }
  visitBoundText(ast: t.BoundText) { ast.value.visit(this); }
  visitContent(ast: t.Content) {}
  visitText(ast: t.Text) {}
  visitIcu(ast: t.Icu) {}
}

function humanizeExpressionLocation(templateAsts: t.Node[]): any[] {
  const humanizer = new ExpressionLocationHumanizer();
  t.visitAll(humanizer, templateAsts);
  return humanizer.result;
}

describe('expression AST absolute source spans', () => {
  // TODO(ayazhafiz): duplicate this test without `preserveWhitespaces` once whitespace rewriting is
  // moved to post-R3AST generation.
  it('should provide absolute offsets with arbitrary whitespace', () => {
    expect(humanizeExpressionLocation(
               parse('<div>\n  \n{{foo}}</div>', {preserveWhitespaces: true}).nodes))
        .toContain(['\n  \n{{foo}}', new AbsoluteSourceSpan(5, 16)]);
  });

  it('should provide absolute offsets of an expression in a bound text', () => {
    expect(humanizeExpressionLocation(parse('<div>{{foo}}</div>').nodes)).toContain([
      '{{foo}}', new AbsoluteSourceSpan(5, 12)
    ]);
  });

  it('should provide absolute offsets of an expression in a bound event', () => {
    expect(humanizeExpressionLocation(parse('<div (click)="foo();bar();"></div>').nodes))
        .toContain(['foo();bar();', new AbsoluteSourceSpan(14, 26)]);

    expect(humanizeExpressionLocation(parse('<div on-click="foo();bar();"></div>').nodes))
        .toContain(['foo();bar();', new AbsoluteSourceSpan(15, 27)]);
  });

  it('should provide absolute offsets of an expression in a bound attribute', () => {
    expect(
        humanizeExpressionLocation(parse('<input [disabled]="condition ? true : false" />').nodes))
        .toContain(['condition ? true : false', new AbsoluteSourceSpan(19, 43)]);

    expect(humanizeExpressionLocation(
               parse('<input bind-disabled="condition ? true : false" />').nodes))
        .toContain(['condition ? true : false', new AbsoluteSourceSpan(22, 46)]);
  });
});
