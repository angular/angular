/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EmitterVisitorContext} from '../../src/output/abstract_emitter';
import * as o from '../../src/output/output_ast';
import {JitEmitterVisitor, JitEvaluator} from '../../src/output/output_jit';
import {R3JitReflector} from '../../src/render3/r3_jit';

describe('Output JIT', () => {
  describe('regression', () => {
    it('should generate unique argument names', () => {
      const externalIds = new Array(10)
        .fill(null)
        .map((_, index) => new o.ExternalReference('@angular/core', `id_${index}_`));
      const externalIds1 = new Array(10)
        .fill(null)
        .map((_, index) => new o.ExternalReference('@angular/core', `id_${index}_1`));
      const ctx = EmitterVisitorContext.createRoot();
      const reflectorContext: {[key: string]: string} = {};
      for (const {name} of externalIds) {
        reflectorContext[name!] = name!;
      }
      for (const {name} of externalIds1) {
        reflectorContext[name!] = name!;
      }
      const converter = new JitEmitterVisitor(new R3JitReflector(reflectorContext));
      converter.visitAllStatements(
        [o.literalArr([...externalIds1, ...externalIds].map((id) => o.importExpr(id))).toStmt()],
        ctx,
      );
      const args = converter.getArgs();
      expect(Object.keys(args).length).toBe(20);
    });
  });

  it('should use strict mode', () => {
    const evaluator = new JitEvaluator();
    expect(() => {
      evaluator.evaluateStatements(
        'http://angular.io/something.ts',
        [
          // Set an undeclared variable
          // foo = "bar";
          o.variable('foo').equals(o.literal('bar')).toStmt(),
        ],
        new R3JitReflector({}),
        false,
      );
    }).toThrowError();
  });

  describe('visitReadPropExpr', () => {
    function emit(expr: o.Expression): string {
      const converter = new JitEmitterVisitor(new R3JitReflector({}));
      const ctx = EmitterVisitorContext.createRoot();
      converter.visitAllStatements([expr.toStmt()], ctx);
      return ctx
        .toSource()
        .replace(/^'use strict';\s*/, '')
        .trim();
    }

    it('should emit a property access for valid identifiers', () => {
      expect(emit(o.variable('ctx').prop('foo'))).toBe('ctx.foo;');
      // Reserved words and non-ASCII identifiers are valid property names.
      expect(emit(o.variable('ctx').prop('class'))).toBe('ctx.class;');
      expect(emit(o.variable('ctx').prop('\u0275cmp'))).toBe('ctx.\u0275cmp;');
    });

    it('should emit an element access for names that are not valid identifiers', () => {
      expect(emit(o.variable('ctx').prop('a-b'))).toBe(`ctx['a-b'];`);
      expect(emit(o.variable('ctx').prop(`a; evil(); b`))).toBe(`ctx['a; evil(); b'];`);
      // The name has to be escaped so that it cannot terminate the string literal either.
      expect(emit(o.variable('ctx').prop(`a'; evil(); '`))).toBe(`ctx['a\\'; evil(); \\''];`);
    });

    it('should emit an optional element access for an optional read', () => {
      const optional = new o.ReadPropExpr(
        o.variable('ctx'),
        'a; evil(); b',
        null,
        null,
        undefined,
        true,
      );
      expect(emit(optional)).toBe(`ctx?.['a; evil(); b'];`);
    });
  });

  it('should not add more than one strict mode statement if there is already one present', () => {
    const converter = new JitEmitterVisitor(new R3JitReflector({}));
    const ctx = EmitterVisitorContext.createRoot();
    converter.visitAllStatements([o.literal('use strict').toStmt()], ctx);
    const matches = ctx.toSource().match(/'use strict';/g)!;
    expect(matches.length).toBe(1);
  });
});
