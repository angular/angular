/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {migrateTemplate, migrateTemplateBestEffort} from './add-null-coalescing';
import {
  escapeForHostStringLiteral,
  migrateHostExpression,
} from './optional-chaining-semantics-migration';
import ts from 'typescript';

describe('migrateTemplate (AST-based)', () => {
  describe('no-op cases', () => {
    it('should return unchanged for template without ?.', () => {
      const r = migrateTemplate('<div>{{ a.b }}</div>');
      expect(r.hasSafeNavigation).toBe(false);
      expect(r.fullyMigrated).toBe(true);
    });

    it('should return unchanged for empty template', () => {
      const r = migrateTemplate('');
      expect(r.hasSafeNavigation).toBe(false);
      expect(r.fullyMigrated).toBe(true);
    });

    it('should return unchanged for template with only text', () => {
      const r = migrateTemplate('Hello world');
      expect(r.hasSafeNavigation).toBe(false);
    });
  });

  describe('null-safe contexts (left as-is)', () => {
    it('standalone interpolation: {{ a?.b }}', () => {
      const r = migrateTemplate('{{ a?.b }}');
      expect(r.fullyMigrated).toBe(true);
      expect(r.safeAsIsCount).toBe(1);
      expect(r.migratedCount).toBe(0);
      expect(r.migrated).toBe('{{ a?.b }}');
    });

    it('standalone deep chain: {{ a?.b?.c?.d }}', () => {
      const r = migrateTemplate('{{ a?.b?.c?.d }}');
      expect(r.fullyMigrated).toBe(true);
      expect(r.safeAsIsCount).toBeGreaterThan(0);
      expect(r.migrated).toBe('{{ a?.b?.c?.d }}');
    });

    it('nullish coalescing: {{ a?.b ?? "fallback" }}', () => {
      const r = migrateTemplate(`{{ a?.b ?? 'fallback' }}`);
      expect(r.fullyMigrated).toBe(true);
      expect(r.safeAsIsCount).toBeGreaterThan(0);
    });

    it('logical OR fallback: {{ a?.b || "default" }}', () => {
      const r = migrateTemplate(`{{ a?.b || 'default' }}`);
      expect(r.fullyMigrated).toBe(true);
      expect(r.safeAsIsCount).toBeGreaterThan(0);
    });

    it('logical AND: {{ a?.b && something }}', () => {
      const r = migrateTemplate('{{ a?.b && something }}');
      expect(r.fullyMigrated).toBe(true);
      expect(r.safeAsIsCount).toBeGreaterThan(0);
    });

    it('negation: {{ !a?.b }}', () => {
      const r = migrateTemplate('{{ !a?.b }}');
      expect(r.fullyMigrated).toBe(true);
      expect(r.safeAsIsCount).toBeGreaterThan(0);
    });

    it('double negation: {{ !!a?.b }}', () => {
      const r = migrateTemplate('{{ !!a?.b }}');
      expect(r.fullyMigrated).toBe(true);
      expect(r.safeAsIsCount).toBeGreaterThan(0);
    });

    it('loose equality with null: {{ a?.b == null }}', () => {
      const r = migrateTemplate('{{ a?.b == null }}');
      expect(r.fullyMigrated).toBe(true);
      expect(r.safeAsIsCount).toBeGreaterThan(0);
    });

    it('loose inequality with null: {{ a?.b != null }}', () => {
      const r = migrateTemplate('{{ a?.b != null }}');
      expect(r.fullyMigrated).toBe(true);
      expect(r.safeAsIsCount).toBeGreaterThan(0);
    });

    it('ternary with ?. in condition: {{ a?.b ? x : y }}', () => {
      const r = migrateTemplate('{{ a?.b ? x : y }}');
      expect(r.fullyMigrated).toBe(true);
      expect(r.safeAsIsCount).toBeGreaterThan(0);
    });

    it('negated ternary condition: {{ !a?.b?.c ? x : y }}', () => {
      const r = migrateTemplate('{{ !a?.b?.c ? x : y }}');
      expect(r.fullyMigrated).toBe(true);
      expect(r.safeAsIsCount).toBeGreaterThan(0);
    });
  });

  describe('unsafe contexts (must convert or skip)', () => {
    it('strict equality is NOT safe: {{ a?.b === null }}', () => {
      const r = migrateTemplate('{{ a?.b === null }}');
      // Strict equality makes null vs undefined distinguishable
      expect(r.safeAsIsCount).toBe(0);
    });

    it('addition/concat is NOT safe', () => {
      // "prefix" + null → "prefixnull", "prefix" + undefined → "prefixundefined"
      // The + operator with a string literal is sensitive
      const r = migrateTemplate(`{{ "prefix" + a?.b }}`);
      expect(r.safeAsIsCount).toBe(0);
    });
  });

  describe('mixed templates', () => {
    it('template with multiple safe interpolations is fully safe', () => {
      const r = migrateTemplate('<div>{{ a?.b }}</div><span>{{ c?.d }}</span>');
      expect(r.fullyMigrated).toBe(true);
      expect(r.safeAsIsCount).toBeGreaterThanOrEqual(2);
      expect(r.migratedCount).toBe(0);
      expect(r.skippedCount).toBe(0);
    });

    it('reports hasSafeNavigation when ?. is present', () => {
      const r = migrateTemplate('{{ a?.b }}');
      expect(r.hasSafeNavigation).toBe(true);
    });

    it('no safe navigation', () => {
      const r = migrateTemplate('<div>{{ a.b }}</div>');
      expect(r.hasSafeNavigation).toBe(false);
    });
  });

  describe('correctness rationale: why null and undefined are equivalent', () => {
    it('interpolation renders both as empty string', () => {
      // Angular's renderStringify: String(null) and String(undefined) both → ""
      const r = migrateTemplate('{{ user?.name }}');
      expect(r.safeAsIsCount).toBeGreaterThan(0);
    });

    it('?? catches both null and undefined per ECMAScript spec', () => {
      const r = migrateTemplate(`{{ user?.name ?? 'Anonymous' }}`);
      expect(r.safeAsIsCount).toBeGreaterThan(0);
    });

    it('|| treats both as falsy per ECMAScript spec', () => {
      const r = migrateTemplate(`{{ user?.name || 'fallback' }}`);
      expect(r.safeAsIsCount).toBeGreaterThan(0);
    });

    it('== null matches both per ECMAScript abstract equality', () => {
      const r = migrateTemplate('{{ a?.b == null }}');
      expect(r.safeAsIsCount).toBeGreaterThan(0);
    });

    it('!x converts both to true (both are falsy)', () => {
      const r = migrateTemplate('{{ !a?.b }}');
      expect(r.safeAsIsCount).toBeGreaterThan(0);
    });

    it('ternary condition treats both as falsy', () => {
      const r = migrateTemplate('{{ a?.b ? yes : no }}');
      expect(r.safeAsIsCount).toBeGreaterThan(0);
    });
  });
});

describe('migrateTemplateBestEffort (AST-based)', () => {
  it('should leave null-safe contexts as-is', () => {
    const r = migrateTemplateBestEffort('{{ a?.b }}');
    expect(r.safeAsIsCount).toBeGreaterThan(0);
    expect(r.migrated).toBe('{{ a?.b }}');
  });

  it('should still mark null-safe ?? as safe', () => {
    const r = migrateTemplateBestEffort(`{{ a?.b ?? 'x' }}`);
    expect(r.safeAsIsCount).toBeGreaterThan(0);
  });

  it('empty template', () => {
    const r = migrateTemplateBestEffort('');
    expect(r.hasSafeNavigation).toBe(false);
    expect(r.fullyMigrated).toBe(true);
  });
});

describe('migrateHostExpression', () => {
  it('should migrate a simple host expression with safe navigation', () => {
    const r = migrateHostExpression('user?.name', false);
    expect(r.hasSafeNavigation).toBe(true);
    expect(r.fullyMigrated).toBe(true);
    expect(r.migrated).toContain('user != null ? user.name : null');
  });

  it('should use best-effort fallback for unsupported host expressions', () => {
    const r = migrateHostExpression('user?.getName()', true);
    expect(r.hasSafeNavigation).toBe(true);
    expect(r.fullyMigrated).toBe(false);
    expect(r.skippedCount).toBeGreaterThan(0);
    expect(r.migrated).toContain('user?.getName()');
  });

  it('should preserve escaped single quotes for insertion into single-quoted TS host strings', () => {
    const original = `'prefix ' + user?.name + ' suffix'`;
    const r = migrateHostExpression(original, false);

    const initializer = {getText: () => "''"} as unknown as ts.StringLiteralLike;
    const escaped = escapeForHostStringLiteral(r.migrated, initializer);

    const tsSource = `
      import {Directive} from '@angular/core';
      @Directive({
        selector: '[x]',
        host: {
          '[attr.title]': '${escaped}'
        }
      })
      class TestDir {}
    `;
    const transpileResult = ts.transpileModule(tsSource, {
      compilerOptions: {target: ts.ScriptTarget.ES2022},
      reportDiagnostics: true,
    });
    expect((transpileResult.diagnostics ?? []).length).toBe(0);
  });
});
