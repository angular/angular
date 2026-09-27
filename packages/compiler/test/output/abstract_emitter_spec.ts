/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EmitterVisitorContext, escapeIdentifier} from '../../src/output/abstract_emitter';
import {AbstractJsEmitterVisitor} from '../../src/output/abstract_js_emitter';
import * as o from '../../src/output/output_ast';

class TestJsEmitter extends AbstractJsEmitterVisitor {
  constructor(override readonly printComments: boolean) {
    super();
  }

  override visitExternalExpr(ast: o.ExternalExpr, ctx: EmitterVisitorContext): void {
    ctx.print(ast, ast.value.name!);
  }
}

function emitExpr(expr: o.Expression, printComments = true): string {
  const ctx = EmitterVisitorContext.createRoot();
  expr.visitExpression(new TestJsEmitter(printComments), ctx);
  return ctx.toSource();
}

describe('AbstractEmitter', () => {
  describe('escapeIdentifier', () => {
    it('should escape single quotes', () => {
      expect(escapeIdentifier(`'`)).toEqual(`'\\''`);
    });

    it('should escape backslash', () => {
      expect(escapeIdentifier('\\')).toEqual(`'\\\\'`);
    });

    it('should escape newlines', () => {
      expect(escapeIdentifier('\n')).toEqual(`'\\n'`);
    });

    it('should escape carriage returns', () => {
      expect(escapeIdentifier('\r')).toEqual(`'\\r'`);
    });

    it('should add quotes for non-identifiers', () => {
      expect(escapeIdentifier('==', false)).toEqual(`'=='`);
    });
    it('does not escape class (but it probably should)', () => {
      expect(escapeIdentifier('class', false)).toEqual('class');
    });
  });

  describe('visitLiteralMapExpr', () => {
    it('should emit leading comments on the first property assignment on its own line', () => {
      const expr = new o.LiteralMapExpr([
        new o.LiteralMapPropertyAssignment('a', o.literal(1), false, [o.leadingComment('comment')]),
        new o.LiteralMapPropertyAssignment('b', o.literal(2), false),
      ]);

      expect(emitExpr(expr)).toBe('{\n// comment\na: 1, b: 2}');
    });

    it('should emit leading comments on subsequent property assignments after the comma', () => {
      const expr = new o.LiteralMapExpr([
        new o.LiteralMapPropertyAssignment('a', o.literal(1), false),
        new o.LiteralMapPropertyAssignment('b', o.literal(2), false, [o.leadingComment('comment')]),
      ]);

      expect(emitExpr(expr)).toBe('{a: 1,\n// comment\nb: 2}');
    });

    it('should omit leading comments on property assignments when printComments is false', () => {
      const expr = new o.LiteralMapExpr([
        new o.LiteralMapPropertyAssignment('a', o.literal(1), false, [o.leadingComment('comment')]),
        new o.LiteralMapPropertyAssignment('b', o.literal(2), false),
      ]);

      expect(emitExpr(expr, false)).toBe('{a: 1, b: 2}');
    });

    it('should handle spread assignments alongside commented property assignments', () => {
      const expr = new o.LiteralMapExpr([
        new o.LiteralMapSpreadAssignment(o.variable('rest')),
        new o.LiteralMapPropertyAssignment('a', o.literal(1), false, [o.leadingComment('comment')]),
      ]);

      expect(emitExpr(expr)).toBe('{...rest,\n// comment\na: 1}');
    });
  });

  describe('visitParenthesizedExpr', () => {
    const a = o.variable('a');
    const b = o.variable('b');
    const f = o.variable('f');
    const x = o.variable('x');

    it('should parenthesize a double negation before a method call', () => {
      const expr = new o.ParenthesizedExpr(o.not(o.not(a.prop('b')))).prop('toString').callFn([]);
      expect(emitExpr(expr)).toBe('(!!a.b).toString()');
    });

    it('should parenthesize a negation before a property read', () => {
      expect(emitExpr(new o.ParenthesizedExpr(o.not(a)).prop('b'))).toBe('(!a).b');
    });

    it('should parenthesize a negation before a keyed read', () => {
      expect(emitExpr(new o.ParenthesizedExpr(o.not(a)).key(o.variable('k')))).toBe('(!a)[k]');
    });

    it('should parenthesize a negation before a call', () => {
      expect(emitExpr(new o.ParenthesizedExpr(o.not(f)).callFn([]))).toBe('(!f)()');
    });

    it('should parenthesize a typeof expression before a property read', () => {
      expect(emitExpr(new o.ParenthesizedExpr(o.typeofExpr(a)).prop('length'))).toBe(
        '(typeof a).length',
      );
    });

    it('should parenthesize a void expression before a property read', () => {
      expect(emitExpr(new o.ParenthesizedExpr(new o.VoidExpr(a)).prop('b'))).toBe('(void a).b');
    });

    it('should parenthesize a negation on the left side of an exponentiation', () => {
      expect(emitExpr(new o.ParenthesizedExpr(o.not(a)).power(o.literal(2)))).toBe('((!a) ** 2)');
    });

    it('should parenthesize a typeof expression on the left side of an exponentiation', () => {
      expect(emitExpr(new o.ParenthesizedExpr(o.typeofExpr(a)).power(o.literal(2)))).toBe(
        '((typeof a) ** 2)',
      );
    });

    it('should parenthesize a number literal before a method call', () => {
      expect(emitExpr(new o.ParenthesizedExpr(o.literal(1)).prop('toString').callFn([]))).toBe(
        '(1).toString()',
      );
    });

    it('should parenthesize an arrow function before a property read', () => {
      expect(emitExpr(new o.ParenthesizedExpr(o.arrowFn([], x)).prop('name'))).toBe(
        '(() => x).name',
      );
    });

    it('should parenthesize an arrow function in a binary expression', () => {
      expect(emitExpr(new o.ParenthesizedExpr(o.arrowFn([], x)).or(b))).toBe('((() => x) || b)');
    });

    it('should parenthesize a call used as the class of an instantiation', () => {
      expect(emitExpr(new o.InstantiateExpr(new o.ParenthesizedExpr(f.callFn([])), []))).toBe(
        'new (f())()',
      );
    });

    it('should not double-parenthesize expressions that parenthesize themselves', () => {
      expect(emitExpr(new o.ParenthesizedExpr(a.or(b)).prop('c'))).toBe('(a || b).c');
      expect(emitExpr(new o.ParenthesizedExpr(new o.ConditionalExpr(a, b, x)).prop('c'))).toBe(
        '(a ? b : x).c',
      );
      expect(emitExpr(new o.ParenthesizedExpr(new o.ParenthesizedExpr(o.not(a))).prop('b'))).toBe(
        '(!a).b',
      );
    });

    it('should not add redundant parentheses around an if statement condition', () => {
      const ctx = EmitterVisitorContext.createRoot();
      new o.IfStmt(new o.ParenthesizedExpr(a.or(b)), [new o.ExpressionStatement(x)]).visitStatement(
        new TestJsEmitter(false),
        ctx,
      );
      expect(ctx.toSource()).toBe('if (a || b) { x; }');
    });
  });
});

export function stripSourceMapAndNewLine(source: string): string {
  if (source.endsWith('\n')) {
    source = source.substring(0, source.length - 1);
  }
  const smi = source.lastIndexOf('\n//#');
  if (smi == -1) return source;
  return source.slice(0, smi);
}
