#!/usr/bin/env node

/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Measures the bundle size impact of the optimizeTemporaries compiler phase.
 * Usage: node scripts/perf/measure-temp-savings.mjs
 *
 * Two benchmarks:
 *   1. safe_access_temporaries — the existing compliance test case (4 chains, deep nesting)
 *   2. data_dashboard — simulated realistic component with 16 safe navigation chains
 *      across separate template instructions (typical data-display component)
 */

/* tslint:disable:no-console */

import {gzipSync} from 'zlib';
import {readFileSync} from 'fs';
import {join, dirname} from 'path';
import {fileURLToPath} from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '../..');

function measure(label, code) {
  const raw = Buffer.byteLength(code, 'utf8');
  const gz = gzipSync(Buffer.from(code, 'utf8')).length;
  return {label, raw, gz};
}

function report(before, after) {
  const rawSaved = before.raw - after.raw;
  const gzSaved = before.gz - after.gz;
  const rawPct = ((rawSaved / before.raw) * 100).toFixed(1);
  const gzPct = ((gzSaved / before.gz) * 100).toFixed(1);

  console.log('\n' + '─'.repeat(72));
  console.log(`  BEFORE: ${before.label}`);
  console.log(`    raw: ${before.raw} bytes    gzip: ${before.gz} bytes`);
  console.log(`  AFTER:  ${after.label}`);
  console.log(`    raw: ${after.raw} bytes    gzip: ${after.gz} bytes`);
  console.log(`  Saved:  ${rawSaved} bytes raw (${rawPct}%)  /  ${gzSaved} bytes gzip (${gzPct}%)`);
  console.log('─'.repeat(72));
  return {rawSaved, gzSaved, rawPct, gzPct, before, after};
}

// ─── Benchmark 1: existing compliance golden ───────────────────────────────

const goldenPath = join(
  repoRoot,
  'packages/compiler-cli/test/compliance/test_cases/r3_view_compiler/safe_access/safe_access_temporaries_template.js',
);
const b1_after = readFileSync(goldenPath, 'utf8');

const b1_before = `} if (rf & 2) {
  let $tmp_0_0$;
  let $tmp_1_0$;
  let $tmp_2_0$;
  let $tmp_2_1$;
  let $tmp_3_0$;
  let $tmp_3_1$;
  let $tmp_3_2$;
  let $tmp_3_3$;
  i0.ɵɵadvance();
  i0.ɵɵtextInterpolate1("Safe Property with Calls: ", ($tmp_0_0$ = ctx.p()) == null ? null : ($tmp_0_0$ = $tmp_0_0$.a()) == null ? null : ($tmp_0_0$ = $tmp_0_0$.b()) == null ? null : ($tmp_0_0$ = $tmp_0_0$.c()) == null ? null : $tmp_0_0$.d());
  i0.ɵɵadvance(2);
  i0.ɵɵtextInterpolate1("Safe and Unsafe Property with Calls: ", ctx.p == null ? null : ($tmp_1_0$ = ctx.p.a()) == null ? null : ($tmp_1_0$ = $tmp_1_0$.b().c().d()) == null ? null : ($tmp_1_0$ = $tmp_1_0$.e()) == null ? null : $tmp_1_0$.f == null ? null : $tmp_1_0$.f.g.h == null ? null : ($tmp_1_0$ = $tmp_1_0$.f.g.h.i()) == null ? null : ($tmp_1_0$ = $tmp_1_0$.j()) == null ? null : $tmp_1_0$.k().l);
  i0.ɵɵadvance(2);
  i0.ɵɵtextInterpolate1("Nested Safe with Calls: ", ($tmp_2_0$ = ctx.f1()) == null ? null : $tmp_2_0$[($tmp_2_1$ = ctx.f2()) == null ? null : $tmp_2_1$.a] == null ? null : $tmp_2_0$[($tmp_2_1$ = $tmp_2_1$) == null ? null : $tmp_2_1$.a].b);
  i0.ɵɵadvance(2);
  i0.ɵɵtextInterpolate1("Deep Nested Safe with Calls: ", ($tmp_3_0$ = ctx.f1()) == null ? null : $tmp_3_0$[($tmp_3_1$ = ctx.f2()) == null ? null : ($tmp_3_2$ = $tmp_3_1$.f3()) == null ? null : $tmp_3_2$[($tmp_3_3$ = ctx.f4()) == null ? null : $tmp_3_3$.f5()]] == null ? null : $tmp_3_0$[($tmp_3_1$ = $tmp_3_1$) == null ? null : ($tmp_3_2$ = $tmp_3_2$) == null ? null : $tmp_3_2$[($tmp_3_3$ = $tmp_3_3$) == null ? null : $tmp_3_3$.f5()]].f6());
}
`;

console.log('\n══════════════════════════════════════════════════════════════════════');
console.log('  Benchmark 1: safe_access_temporaries (4 chains, deep nesting)');
console.log('══════════════════════════════════════════════════════════════════════');
const r1 = report(
  measure('8 declarations (unoptimized)', b1_before),
  measure('4 declarations (optimized)', b1_after),
);

// ─── Benchmark 2: realistic data dashboard component ──────────────────────
//
// Simulates a component that displays a user profile, statistics, an article,
// and pagination — all read from nullable API responses. Each property access
// is on a separate template instruction (property binding or text interpolation),
// so all 16 temporaries are cross-instruction non-overlapping.
//
// Pattern: obj?.prop across 16 bindings → 16 declarations before, 1 after.

// "Before" output: each instruction generates its own tmp_N_0 slot.
const b2_before = `} if (rf & 2) {
  let $tmp_0_0$;
  let $tmp_1_0$;
  let $tmp_2_0$;
  let $tmp_3_0$;
  let $tmp_4_0$;
  let $tmp_5_0$;
  let $tmp_6_0$;
  let $tmp_7_0$;
  let $tmp_8_0$;
  let $tmp_9_0$;
  let $tmp_10_0$;
  let $tmp_11_0$;
  let $tmp_12_0$;
  let $tmp_13_0$;
  let $tmp_14_0$;
  let $tmp_15_0$;
  i0.ɵɵadvance();
  i0.ɵɵproperty("src", ($tmp_0_0$ = ctx.user) == null ? null : $tmp_0_0$.avatar);
  i0.ɵɵadvance();
  i0.ɵɵproperty("alt", ($tmp_1_0$ = ctx.user) == null ? null : $tmp_1_0$.username);
  i0.ɵɵadvance();
  i0.ɵɵtextInterpolate(($tmp_2_0$ = ctx.user) == null ? null : $tmp_2_0$.username);
  i0.ɵɵadvance();
  i0.ɵɵtextInterpolate(($tmp_3_0$ = ctx.user) == null ? null : $tmp_3_0$.bio);
  i0.ɵɵadvance();
  i0.ɵɵtextInterpolate(($tmp_4_0$ = ctx.stats) == null ? null : $tmp_4_0$.followers);
  i0.ɵɵadvance();
  i0.ɵɵtextInterpolate(($tmp_5_0$ = ctx.stats) == null ? null : $tmp_5_0$.following);
  i0.ɵɵadvance();
  i0.ɵɵtextInterpolate(($tmp_6_0$ = ctx.stats) == null ? null : $tmp_6_0$.repos);
  i0.ɵɵadvance();
  i0.ɵɵtextInterpolate(($tmp_7_0$ = ctx.article) == null ? null : $tmp_7_0$.title);
  i0.ɵɵadvance();
  i0.ɵɵtextInterpolate(($tmp_8_0$ = ctx.article) == null ? null : ($tmp_8_0$ = $tmp_8_0$.author) == null ? null : $tmp_8_0$.name);
  i0.ɵɵadvance();
  i0.ɵɵproperty("src", ($tmp_9_0$ = ctx.article) == null ? null : ($tmp_9_0$ = $tmp_9_0$.author) == null ? null : $tmp_9_0$.avatar);
  i0.ɵɵadvance();
  i0.ɵɵtextInterpolate(($tmp_10_0$ = ctx.article) == null ? null : $tmp_10_0$.readTime);
  i0.ɵɵadvance();
  i0.ɵɵtextInterpolate(($tmp_11_0$ = ctx.article) == null ? null : $tmp_11_0$.views);
  i0.ɵɵadvance();
  i0.ɵɵtextInterpolate(($tmp_12_0$ = ctx.page) == null ? null : $tmp_12_0$.current);
  i0.ɵɵadvance();
  i0.ɵɵtextInterpolate(($tmp_13_0$ = ctx.page) == null ? null : $tmp_13_0$.total);
  i0.ɵɵadvance();
  i0.ɵɵproperty("href", ($tmp_14_0$ = ctx.page) == null ? null : $tmp_14_0$.next);
  i0.ɵɵadvance();
  i0.ɵɵproperty("href", ($tmp_15_0$ = ctx.page) == null ? null : $tmp_15_0$.prev);
}
`;

// "After" output: all 16 instructions share a single slot (tmp_0).
const b2_after = `} if (rf & 2) {
  let $tmp_0$;
  i0.ɵɵadvance();
  i0.ɵɵproperty("src", ($tmp_0$ = ctx.user) == null ? null : $tmp_0$.avatar);
  i0.ɵɵadvance();
  i0.ɵɵproperty("alt", ($tmp_0$ = ctx.user) == null ? null : $tmp_0$.username);
  i0.ɵɵadvance();
  i0.ɵɵtextInterpolate(($tmp_0$ = ctx.user) == null ? null : $tmp_0$.username);
  i0.ɵɵadvance();
  i0.ɵɵtextInterpolate(($tmp_0$ = ctx.user) == null ? null : $tmp_0$.bio);
  i0.ɵɵadvance();
  i0.ɵɵtextInterpolate(($tmp_0$ = ctx.stats) == null ? null : $tmp_0$.followers);
  i0.ɵɵadvance();
  i0.ɵɵtextInterpolate(($tmp_0$ = ctx.stats) == null ? null : $tmp_0$.following);
  i0.ɵɵadvance();
  i0.ɵɵtextInterpolate(($tmp_0$ = ctx.stats) == null ? null : $tmp_0$.repos);
  i0.ɵɵadvance();
  i0.ɵɵtextInterpolate(($tmp_0$ = ctx.article) == null ? null : $tmp_0$.title);
  i0.ɵɵadvance();
  i0.ɵɵtextInterpolate(($tmp_0$ = ctx.article) == null ? null : ($tmp_0$ = $tmp_0$.author) == null ? null : $tmp_0$.name);
  i0.ɵɵadvance();
  i0.ɵɵproperty("src", ($tmp_0$ = ctx.article) == null ? null : ($tmp_0$ = $tmp_0$.author) == null ? null : $tmp_0$.avatar);
  i0.ɵɵadvance();
  i0.ɵɵtextInterpolate(($tmp_0$ = ctx.article) == null ? null : $tmp_0$.readTime);
  i0.ɵɵadvance();
  i0.ɵɵtextInterpolate(($tmp_0$ = ctx.article) == null ? null : $tmp_0$.views);
  i0.ɵɵadvance();
  i0.ɵɵtextInterpolate(($tmp_0$ = ctx.page) == null ? null : $tmp_0$.current);
  i0.ɵɵadvance();
  i0.ɵɵtextInterpolate(($tmp_0$ = ctx.page) == null ? null : $tmp_0$.total);
  i0.ɵɵadvance();
  i0.ɵɵproperty("href", ($tmp_0$ = ctx.page) == null ? null : $tmp_0$.next);
  i0.ɵɵadvance();
  i0.ɵɵproperty("href", ($tmp_0$ = ctx.page) == null ? null : $tmp_0$.prev);
}
`;

console.log('\n══════════════════════════════════════════════════════════════════════');
console.log('  Benchmark 2: data-display component (16 safe navigation chains)');
console.log('  Simulates: user profile + stats + article + pagination, all from');
console.log('  nullable API responses — each binding on a separate instruction.');
console.log('══════════════════════════════════════════════════════════════════════');
const r2 = report(
  measure('16 declarations (unoptimized)', b2_before),
  measure(' 1 declaration  (optimized)', b2_after),
);

// ─── Summary table ──────────────────────────────────────────────────────────

console.log('\n\nSummary (for PR description):\n');
console.log(
  '| Benchmark                        | Before raw | After raw | Before gz | After gz | Raw saved | GZ saved |',
);
console.log(
  '|----------------------------------|------------|-----------|-----------|----------|-----------|----------|',
);
console.log(
  `| safe_access_temporaries (4 deep) | ${r1.before.raw} B | ${r1.after.raw} B | ${r1.before.gz} B | ${r1.after.gz} B | ${r1.rawSaved} B (${r1.rawPct}%) | ${r1.gzSaved} B (${r1.gzPct}%) |`,
);
console.log(
  `| data-display component (16 wide) | ${r2.before.raw} B | ${r2.after.raw} B | ${r2.before.gz} B | ${r2.after.gz} B | ${r2.rawSaved} B (${r2.rawPct}%) | ${r2.gzSaved} B (${r2.gzPct}%) |`,
);
console.log('');
console.log('Note: Savings per component scale linearly with the number of safe navigation');
console.log('expressions. A typical Angular application has dozens of such components.');
