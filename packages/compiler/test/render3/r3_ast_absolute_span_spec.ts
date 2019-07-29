/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AbsoluteSourceSpan} from '@angular/compiler';
import * as e from '../../src/expression_parser/ast';
import * as t from '../../src/render3/r3_ast';
import {unparse} from '../expression_parser/utils/unparser';
import {parseR3 as parse} from './view/util';

class ExpressionLocationHumanizer extends e.RecursiveAstVisitor implements t.Visitor {
  result: Array<[string, AbsoluteSourceSpan]> = [];

  visitASTWithSource(ast: e.ASTWithSource) {
    this.result.push([unparse(ast), ast.sourceSpan]);
    this.visitAll([ast.ast], null);
  }
  visitBinary(ast: e.Binary) {
    this.result.push([unparse(ast), ast.sourceSpan]);
    super.visitBinary(ast, null);
  }
  visitConditional(ast: e.Conditional) {
    this.result.push([unparse(ast), ast.sourceSpan]);
    super.visitConditional(ast, null);
  }
  visitFunctionCall(ast: e.FunctionCall) {
    this.result.push([unparse(ast), ast.sourceSpan]);
    super.visitFunctionCall(ast, null);
  }
  visitInterpolation(ast: e.Interpolation) {
    this.result.push([unparse(ast), ast.sourceSpan]);
    super.visitInterpolation(ast, null);
  }
  visitKeyedRead(ast: e.KeyedRead) {
    this.result.push([unparse(ast), ast.sourceSpan]);
    super.visitKeyedRead(ast, null);
  }
  visitKeyedWrite(ast: e.KeyedWrite) {
    this.result.push([unparse(ast), ast.sourceSpan]);
    super.visitKeyedWrite(ast, null);
  }
  visitLiteralPrimitive(ast: e.LiteralPrimitive) {
    this.result.push([unparse(ast), ast.sourceSpan]);
    super.visitLiteralPrimitive(ast, null);
  }
  visitLiteralArray(ast: e.LiteralArray) {
    this.result.push([unparse(ast), ast.sourceSpan]);
    super.visitLiteralArray(ast, null);
  }
  visitMethodCall(ast: e.MethodCall) {
    this.result.push([unparse(ast), ast.sourceSpan]);
    super.visitMethodCall(ast, null);
  }
  visitNonNullAssert(ast: e.NonNullAssert) {
    this.result.push([unparse(ast), ast.sourceSpan]);
    super.visitNonNullAssert(ast, null);
  }
  visitPipe(ast: e.BindingPipe) {
    this.result.push([unparse(ast), ast.sourceSpan]);
    super.visitPipe(ast, null);
  }
  visitPrefixNot(ast: e.PrefixNot) {
    this.result.push([unparse(ast), ast.sourceSpan]);
    super.visitPrefixNot(ast, null);
  }
  visitPropertyRead(ast: e.PropertyRead) {
    this.result.push([unparse(ast), ast.sourceSpan]);
    super.visitPropertyRead(ast, null);
  }
  visitPropertyWrite(ast: e.PropertyWrite) {
    this.result.push([unparse(ast), ast.sourceSpan]);
    super.visitPropertyWrite(ast, null);
  }
  visitSafeMethodCall(ast: e.SafeMethodCall) {
    this.result.push([unparse(ast), ast.sourceSpan]);
    super.visitSafeMethodCall(ast, null);
  }
  visitSafePropertyRead(ast: e.SafePropertyRead) {
    this.result.push([unparse(ast), ast.sourceSpan]);
  }

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
        .toContain(['\n  \n{{ foo }}', new AbsoluteSourceSpan(5, 16)]);
  });

  it('should provide absolute offsets of an expression in a bound text', () => {
    expect(humanizeExpressionLocation(parse('<div>{{foo}}</div>').nodes)).toContain([
      '{{ foo }}', new AbsoluteSourceSpan(5, 12)
    ]);
  });

  it('should provide absolute offsets of an expression in a bound event', () => {
    expect(humanizeExpressionLocation(parse('<div (click)="foo();bar();"></div>').nodes))
        .toContain(['foo(); bar();', new AbsoluteSourceSpan(14, 26)]);

    expect(humanizeExpressionLocation(parse('<div on-click="foo();bar();"></div>').nodes))
        .toContain(['foo(); bar();', new AbsoluteSourceSpan(15, 27)]);
  });

  it('should provide absolute offsets of an expression in a bound attribute', () => {
    expect(
        humanizeExpressionLocation(parse('<input [disabled]="condition ? true : false" />').nodes))
        .toContain(['condition ? true : false', new AbsoluteSourceSpan(19, 43)]);

    expect(humanizeExpressionLocation(
               parse('<input bind-disabled="condition ? true : false" />').nodes))
        .toContain(['condition ? true : false', new AbsoluteSourceSpan(22, 46)]);
  });

  it('should provide absolute offsets of a binary expression', () => {
    expect(humanizeExpressionLocation(parse('<div>{{1 + 2}}<div>').nodes)).toContain([
      '1 + 2', new AbsoluteSourceSpan(7, 12)
    ]);
  });

  it('should provide absolute offsets of a conditional', () => {
    expect(humanizeExpressionLocation(parse('<div>{{bool ? 1 : 0}}<div>').nodes)).toContain([
      'bool ? 1 : 0', new AbsoluteSourceSpan(7, 19)
    ]);
  });

  it('should provide absolute offsets of a function call', () => {
    expect(humanizeExpressionLocation(parse('<div>{{fn()()}}<div>').nodes)).toContain([
      'fn()()', new AbsoluteSourceSpan(7, 13)
    ]);
  });

  it('should provide absolute offsets of an interpolation', () => {
    expect(humanizeExpressionLocation(parse('<div>{{1 + foo.length}}<div>').nodes)).toContain([
      '{{ 1 + foo.length }}', new AbsoluteSourceSpan(5, 23)
    ]);
  });

  it('should provide absolute offsets of a keyed read', () => {
    expect(humanizeExpressionLocation(parse('<div>{{obj[key]}}<div>').nodes)).toContain([
      'obj[key]', new AbsoluteSourceSpan(7, 15)
    ]);
  });

  it('should provide absolute offsets of a keyed write', () => {
    expect(humanizeExpressionLocation(parse('<div>{{obj[key] = 0}}<div>').nodes)).toContain([
      'obj[key] = 0', new AbsoluteSourceSpan(7, 19)
    ]);
  });

  it('should provide absolute offsets of a literal primitive', () => {
    expect(humanizeExpressionLocation(parse('<div>{{100}}<div>').nodes)).toContain([
      '100', new AbsoluteSourceSpan(7, 10)
    ]);
  });

  it('should provide absolute offsets of a literal array', () => {
    expect(humanizeExpressionLocation(parse('<div>{{[0, 1, 2]}}<div>').nodes)).toContain([
      '[0, 1, 2]', new AbsoluteSourceSpan(7, 16)
    ]);
  });

  it('should provide absolute offsets of a method call', () => {
    expect(humanizeExpressionLocation(parse('<div>{{method()}}</div>').nodes)).toContain([
      'method()', new AbsoluteSourceSpan(7, 15)
    ]);
  });

  it('should provide absolute offsets of a non-null assert', () => {
    expect(humanizeExpressionLocation(parse('<div>{{prop!}}</div>').nodes)).toContain([
      'prop!', new AbsoluteSourceSpan(7, 12)
    ]);
  });

  it('should provide absolute offsets of a pipe', () => {
    expect(humanizeExpressionLocation(parse('<div>{{prop | pipe}}<div>').nodes)).toContain([
      '(prop | pipe)', new AbsoluteSourceSpan(7, 18)
    ]);
  });

  it('should provide absolute offsets of a property read', () => {
    expect(humanizeExpressionLocation(parse('<div>{{prop}}</div>').nodes)).toContain([
      'prop', new AbsoluteSourceSpan(7, 11)
    ]);
  });

  it('should provide absolute offsets of a property write', () => {
    expect(humanizeExpressionLocation(parse('<div (click)="prop = 0"></div>').nodes)).toContain([
      'prop = 0', new AbsoluteSourceSpan(14, 22)
    ]);
  });

  it('should provide absolute offsets of a "not" prefix', () => {
    expect(humanizeExpressionLocation(parse('<div>{{!prop}}</div>').nodes)).toContain([
      '!prop', new AbsoluteSourceSpan(7, 12)
    ]);
  });

  it('should provide absolute offsets of a safe method call', () => {
    expect(humanizeExpressionLocation(parse('<div>{{prop?.safe()}}<div>').nodes)).toContain([
      'prop?.safe()', new AbsoluteSourceSpan(7, 19)
    ]);
  });

  it('should provide absolute offsets of a safe property read', () => {
    expect(humanizeExpressionLocation(parse('<div>{{prop?.safe}}<div>').nodes)).toContain([
      'prop?.safe', new AbsoluteSourceSpan(7, 17)
    ]);
  });
});
