#!/usr/bin/env node
/**
 * Measures the bundle size impact of the optimizeTemporaries compiler phase.
 * Usage: node scripts/perf/measure-temp-savings.mjs
 */

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

  console.log('\n' + '='.repeat(72));
  console.log(`  ${before.label}`);
  console.log(`    raw: ${before.raw} bytes    gzip: ${before.gz} bytes`);
  console.log(`  ${after.label}`);
  console.log(`    raw: ${after.raw} bytes    gzip: ${after.gz} bytes`);
  console.log(`  Savings: ${rawSaved} bytes raw (${rawPct}%), ${gzSaved} bytes gzip (${gzPct}%)`);
  console.log('='.repeat(72));
}

// Read the updated (optimized) golden file.
const goldenPath = join(
  repoRoot,
  'packages/compiler-cli/test/compliance/test_cases/r3_view_compiler/safe_access/safe_access_temporaries_template.js',
);
const optimized = readFileSync(goldenPath, 'utf8');

// The original golden before this optimization (8 declarations, original names).
const originalGolden = `} if (rf & 2) {
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

report(
  measure('Before optimizeTemporaries (8 declarations)', originalGolden),
  measure('After  optimizeTemporaries (4 declarations)', optimized),
);

const b = measure('before', originalGolden);
const a = measure('after', optimized);
console.log('\nPR description table row:');
console.log(
  `| safe_access_temporaries (4 chains) | ${b.raw} | ${a.raw} | ${b.gz} | ${a.gz} | ${(((b.raw - a.raw) / b.raw) * 100).toFixed(1)}% raw / ${(((b.gz - a.gz) / b.gz) * 100).toFixed(1)}% gz |`,
);
