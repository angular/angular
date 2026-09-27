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
});

export function stripSourceMapAndNewLine(source: string): string {
  if (source.endsWith('\n')) {
    source = source.substring(0, source.length - 1);
  }
  const smi = source.lastIndexOf('\n//#');
  if (smi == -1) return source;
  return source.slice(0, smi);
}
