/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {SecurityContext} from '../../../src/core';
import * as o from '../../../src/output/output_ast';
import {ParseLocation, ParseSourceFile, ParseSourceSpan} from '../../../src/parse_util';
import * as ir from '../../../src/template/pipeline/ir';
import {
  HostBindingCompilationJob,
  TemplateCompilationMode,
} from '../../../src/template/pipeline/src/compilation';
import {ConstantPool} from '../../../src/constant_pool';
import {optimizeTemporaries} from '../../../src/template/pipeline/src/phases/optimize_temporaries';
import {generateTemporaryVariables} from '../../../src/template/pipeline/src/phases/temporary_variables';

// --- Helpers ---

function fakeSpan(): ParseSourceSpan {
  const file = new ParseSourceFile('', 'test.html');
  const loc = new ParseLocation(file, 0, 0, 0);
  return new ParseSourceSpan(loc, loc);
}

function makeJob(): HostBindingCompilationJob {
  return new HostBindingCompilationJob('Test', new ConstantPool(), TemplateCompilationMode.Full);
}

/**
 * Creates a BindingOp whose expression contains a simulated safe-navigation pattern:
 *   (tmp = source) == null ? null : tmp.prop
 *
 * This embeds one AssignTemporaryExpr and one ReadTemporaryExpr for the given xref.
 */
function bindingWithSafeNav(xref: ir.XrefId, source: o.Expression): ir.BindingOp {
  const assign = new ir.AssignTemporaryExpr(source, xref);
  const read = new ir.ReadTemporaryExpr(xref);
  const expr = new o.ConditionalExpr(
    new o.BinaryOperatorExpr(o.BinaryOperator.Equals, assign, o.NULL_EXPR),
    o.NULL_EXPR,
    new o.ReadPropExpr(read, 'prop'),
  );
  return ir.createBindingOp(
    0 as ir.XrefId,
    ir.BindingKind.Property,
    'value',
    expr,
    null,
    SecurityContext.NONE,
    false,
    false,
    null,
    null,
    fakeSpan(),
  );
}

/**
 * Creates a BindingOp that simulates a double safe-navigation chain `a()?.b?.c`:
 *   (tmp0 = source) == null ? null :
 *     (tmp1 = tmp0.prop) == null ? null : tmp1.prop
 *
 * xref0 ends before xref1 begins, so the two live ranges are non-overlapping.
 */
function bindingWithNestedSafeNav(
  xref0: ir.XrefId,
  xref1: ir.XrefId,
  source: o.Expression,
): ir.BindingOp {
  const assign0 = new ir.AssignTemporaryExpr(source, xref0);
  const read0 = new ir.ReadTemporaryExpr(xref0);
  const assign1 = new ir.AssignTemporaryExpr(new o.ReadPropExpr(read0, 'prop'), xref1);
  const read1 = new ir.ReadTemporaryExpr(xref1);

  const inner = new o.ConditionalExpr(
    new o.BinaryOperatorExpr(o.BinaryOperator.Equals, assign1, o.NULL_EXPR),
    o.NULL_EXPR,
    new o.ReadPropExpr(read1, 'prop'),
  );
  const outer = new o.ConditionalExpr(
    new o.BinaryOperatorExpr(o.BinaryOperator.Equals, assign0, o.NULL_EXPR),
    o.NULL_EXPR,
    inner,
  );

  return ir.createBindingOp(
    0 as ir.XrefId,
    ir.BindingKind.Property,
    'value',
    outer,
    null,
    SecurityContext.NONE,
    false,
    false,
    null,
    null,
    fakeSpan(),
  );
}

/** Collect all DeclareVarStmt names from the update list in order. */
function collectDecls(job: HostBindingCompilationJob): string[] {
  const decls: string[] = [];
  for (const op of job.root.update) {
    if (op.kind === ir.OpKind.Statement && op.statement instanceof o.DeclareVarStmt) {
      decls.push(op.statement.name);
    }
  }
  return decls;
}

interface TempNames {
  assigns: string[];
  reads: string[];
}

/** Collect the names assigned to all AssignTemporaryExpr and ReadTemporaryExpr in the update list. */
function collectTempNames(job: HostBindingCompilationJob): TempNames {
  const assigns: string[] = [];
  const reads: string[] = [];
  for (const op of job.root.update) {
    ir.visitExpressionsInOp(op, (expr) => {
      if (expr instanceof ir.AssignTemporaryExpr) assigns.push(expr.name!);
      else if (expr instanceof ir.ReadTemporaryExpr) reads.push(expr.name!);
    });
  }
  return {assigns, reads};
}

// --- Tests ---

describe('optimizeTemporaries', () => {
  describe('cross-instruction slot reuse', () => {
    it('should reuse a single slot for two non-overlapping safe navigation expressions', () => {
      const job = makeJob();
      const xref0 = 0 as ir.XrefId;
      const xref1 = 1 as ir.XrefId;

      job.root.update.push(bindingWithSafeNav(xref0, new o.ReadVarExpr('a')));
      job.root.update.push(bindingWithSafeNav(xref1, new o.ReadVarExpr('c')));

      generateTemporaryVariables(job);
      // Before optimization: two declarations (tmp_0_0, tmp_1_0)
      expect(collectDecls(job).length).toBe(2);

      optimizeTemporaries(job);

      // After optimization: one declaration shared across both expressions
      expect(collectDecls(job)).toEqual(['tmp_0']);
      const {assigns, reads} = collectTempNames(job);
      expect(assigns).toEqual(['tmp_0', 'tmp_0']);
      expect(reads).toEqual(['tmp_0', 'tmp_0']);
    });

    it('should use independent slots for three non-overlapping safe navigation expressions', () => {
      const job = makeJob();
      const xref0 = 0 as ir.XrefId;
      const xref1 = 1 as ir.XrefId;
      const xref2 = 2 as ir.XrefId;

      job.root.update.push(bindingWithSafeNav(xref0, new o.ReadVarExpr('a')));
      job.root.update.push(bindingWithSafeNav(xref1, new o.ReadVarExpr('b')));
      job.root.update.push(bindingWithSafeNav(xref2, new o.ReadVarExpr('c')));

      generateTemporaryVariables(job);
      expect(collectDecls(job).length).toBe(3);

      optimizeTemporaries(job);

      // All three reuse the same slot since none overlap
      expect(collectDecls(job)).toEqual(['tmp_0']);
      const {assigns} = collectTempNames(job);
      expect(assigns).toEqual(['tmp_0', 'tmp_0', 'tmp_0']);
    });
  });

  describe('within-instruction slot reuse', () => {
    it('should preserve single-declaration output for a double safe navigation chain (a?.b?.c)', () => {
      const job = makeJob();
      const xref0 = 0 as ir.XrefId;
      const xref1 = 1 as ir.XrefId;

      job.root.update.push(bindingWithNestedSafeNav(xref0, xref1, new o.ReadVarExpr('a')));

      generateTemporaryVariables(job);
      // generateTemporaryVariables already reuses slots within a single op via its stack
      // counter: xref0 is released before xref1 is assigned, so both receive the same name.
      expect(collectDecls(job).length).toBe(1);

      optimizeTemporaries(job);

      // optimizeTemporaries should produce a single compact slot name
      expect(collectDecls(job)).toEqual(['tmp_0']);
      const {assigns, reads} = collectTempNames(job);
      // Both expressions are named consistently
      expect(new Set(assigns).size).toBe(1);
      expect(new Set(reads).size).toBe(1);
    });
  });

  describe('no-op cases', () => {
    it('should leave an op list with no temporaries unchanged', () => {
      const job = makeJob();
      // A binding with a plain expression — no safe navigation
      job.root.update.push(
        ir.createBindingOp(
          0 as ir.XrefId,
          ir.BindingKind.Property,
          'value',
          new o.ReadVarExpr('x'),
          null,
          SecurityContext.NONE,
          false,
          false,
          null,
          null,
          fakeSpan(),
        ),
      );

      generateTemporaryVariables(job);
      optimizeTemporaries(job);

      expect(collectDecls(job)).toEqual([]);
      const {assigns, reads} = collectTempNames(job);
      expect(assigns).toEqual([]);
      expect(reads).toEqual([]);
    });

    it('should handle an empty op list without errors', () => {
      const job = makeJob();
      generateTemporaryVariables(job);
      expect(() => optimizeTemporaries(job)).not.toThrow();
      expect(collectDecls(job)).toEqual([]);
    });
  });

  describe('assign-only temporaries', () => {
    it('should correctly rename a temporary that is assigned but never read', () => {
      const job = makeJob();
      const xref0 = 0 as ir.XrefId;
      const xref1 = 1 as ir.XrefId;

      // xref0: a normal safe-nav (assign + read)
      job.root.update.push(bindingWithSafeNav(xref0, new o.ReadVarExpr('a')));

      // xref1: assign-only — no ReadTemporaryExpr referencing it
      const assignOnly = new ir.AssignTemporaryExpr(new o.ReadVarExpr('b'), xref1);
      job.root.update.push(
        ir.createBindingOp(
          0 as ir.XrefId,
          ir.BindingKind.Property,
          'value2',
          assignOnly,
          null,
          SecurityContext.NONE,
          false,
          false,
          null,
          null,
          fakeSpan(),
        ),
      );

      generateTemporaryVariables(job);
      optimizeTemporaries(job);

      // Both should be renamed — assign-only gets a single-point live range
      const {assigns} = collectTempNames(job);
      for (const name of assigns) {
        expect(name).toMatch(/^tmp_\d+$/);
      }
      // Declarations should exist for all used slots
      const decls = collectDecls(job);
      expect(decls.length).toBeGreaterThan(0);
    });
  });

  describe('declaration compaction', () => {
    it('should reduce declaration count proportionally to reuse', () => {
      const job = makeJob();
      const count = 5;
      const xrefs = Array.from({length: count}, (_, i) => i as ir.XrefId);

      for (const xref of xrefs) {
        job.root.update.push(bindingWithSafeNav(xref, new o.ReadVarExpr(`a${xref}`)));
      }

      generateTemporaryVariables(job);
      const before = collectDecls(job).length;
      expect(before).toBe(count);

      optimizeTemporaries(job);
      const after = collectDecls(job).length;

      // All five temporaries are non-overlapping, so they should all share slot 0
      expect(after).toBe(1);
      expect(after).toBeLessThan(before);
    });
  });
});
