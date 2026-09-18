/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AbstractEmitterVisitor,
  EmitterVisitorContext,
  escapeIdentifier,
} from '../../src/output/abstract_emitter';
import * as o from '../../src/output/output_ast';

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

  describe('binary operator @ts-ignore', () => {
    it('should add @ts-ignore when a numeric operator has a NotExpr operand', () => {
      const expr = o.not(o.variable('a')).bigger(o.literal(1));
      expect(emitStmt(expr)).toEqual('// @ts-ignore\n(!a > 1);');
    });

    it('should not add @ts-ignore for plain numeric comparisons', () => {
      const expr = o.variable('a').bigger(o.literal(1));
      expect(emitStmt(expr)).toEqual('(a > 1);');
    });

    it('should add @ts-ignore when nullish coalescing has a non-nullish left-hand-side', () => {
      const concat = o.literal('prefix-').plus(o.variable('a'));
      const expr = new o.ParenthesizedExpr(concat).nullishCoalesce(o.literal(''));
      expect(emitStmt(expr)).toEqual(`// @ts-ignore\n(('prefix-' + a) ?? '');`);
    });

    it('should not add @ts-ignore when nullish coalescing has a nullable left-hand-side', () => {
      expect(emitStmt(o.variable('a').nullishCoalesce(o.literal('')))).toEqual(`(a ?? '');`);
      expect(emitStmt(o.variable('a').and(o.variable('b')).nullishCoalesce(o.literal('')))).toEqual(
        `((a && b) ?? '');`,
      );
    });

    it('should add @ts-ignore when comparing a NotExpr with a non-boolean literal', () => {
      const expr = o.not(o.variable('a')).identical(o.literal('oh no'));
      expect(emitStmt(expr)).toEqual(`// @ts-ignore\n(!a === 'oh no');`);
    });

    it('should not add @ts-ignore when comparing a NotExpr with a boolean literal', () => {
      const expr = o.not(o.variable('a')).identical(o.literal(false));
      expect(emitStmt(expr)).toEqual('(!a === false);');
    });

    it('should not add @ts-ignore when printTypes is false', () => {
      const expr = o.not(o.variable('a')).bigger(o.literal(1));
      expect(emitStmt(expr, /* printTypes */ false)).toEqual('(!a > 1);');
    });

    it('should add at most one @ts-ignore per line when nested expressions match', () => {
      const lhs = o.not(o.variable('a')).bigger(o.literal(1));
      const rhs = o.not(o.variable('b')).bigger(o.literal(2));
      expect(emitStmt(lhs.plus(rhs))).toEqual('// @ts-ignore\n((!a > 1) + (!b > 2));');
    });
  });
});

class TestEmitterVisitor extends AbstractEmitterVisitor {
  constructor(printTypes = true) {
    super(false, printTypes);
  }
  override visitExternalExpr(): void {}
  override visitWrappedNodeExpr(): void {}
}

function emitStmt(expr: o.Expression, printTypes = true): string {
  const ctx = EmitterVisitorContext.createRoot();
  expr.toStmt().visitStatement(new TestEmitterVisitor(printTypes), ctx);
  return ctx.toSource().trim();
}

function stripSourceMapAndNewLine(source: string): string {
  if (source.endsWith('\n')) {
    source = source.substring(0, source.length - 1);
  }
  const smi = source.lastIndexOf('\n//#');
  if (smi == -1) return source;
  return source.slice(0, smi);
}
