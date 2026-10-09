/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as fs from 'node:fs/promises';
import * as path from 'path';
import {pathExists} from './utils.js';

/**
 * Guards the napi-less deployment path.
 *
 * The compiler also runs where N-API is unavailable, driven by `--sidecar <path>`,
 * which talks to an out-of-process engine over stdio. That works only because engine
 * resolution is never reached by a *static* import: `main.js` pulls the loader in
 * behind a dynamic `import()` inside its non-sidecar branch, and `api.js` exposes it
 * only through `createAnalyzer()`.
 *
 * A single static `import` added to `api.ts`, `hybrid_compiler.ts` or
 * `analyzer_sidecar.ts` would drag the loader into module evaluation and break those
 * deployments at import time. This walks the emitted static import graph from each
 * entry below and fails if it can reach a forbidden module.
 */
describe('sidecar isolation', () => {
  const packageDir = path.resolve(import.meta.dirname, '..');

  /** Entry points that must stay free of engine-resolution code. */
  const ENTRIES = ['api.js', 'src/analyzer_sidecar.js', 'src/hybrid_compiler.js'];

  /** Modules that must not be statically reachable from those entries. */
  const FORBIDDEN = ['analyzer_loader', 'analyzer_napi', 'analyzer_wasm', 'wasm_host_fs'];

  /**
   * Static `import ... from '...'` / `export ... from '...'` specifiers.
   * Deliberately does not match dynamic `import(...)`, which is the permitted escape hatch.
   */
  const STATIC_IMPORT = /(?:^|\n)\s*(?:import|export)\b[^;\n]*?\sfrom\s*['"]([^'"]+)['"]/g;

  async function resolveSpecifier(fromFile: string, specifier: string): Promise<string | null> {
    if (!specifier.startsWith('.')) {
      return null; // bare specifier: an external package, not our graph
    }
    const resolved = path.resolve(path.dirname(fromFile), specifier);
    for (const candidate of [resolved, `${resolved}.js`, path.join(resolved, 'index.js')]) {
      const stat = await fs.stat(candidate).catch(() => null);
      if (stat?.isFile()) {
        return candidate;
      }
    }
    return null;
  }

  /** Walks the static import graph, returning the first offending path found. */
  async function findForbiddenPath(entry: string): Promise<string[] | null> {
    const seen = new Set<string>();
    const stack: Array<[string, string[]]> = [[entry, [path.relative(packageDir, entry)]]];

    while (stack.length > 0) {
      const [file, chain] = stack.pop()!;
      if (seen.has(file)) {
        continue;
      }
      seen.add(file);

      const source = await fs.readFile(file, 'utf-8');
      for (const match of source.matchAll(STATIC_IMPORT)) {
        const target = await resolveSpecifier(file, match[1]);
        if (target === null) {
          continue;
        }
        const nextChain = [...chain, path.relative(packageDir, target)];
        const base = path.basename(target, '.js');
        if (FORBIDDEN.includes(base)) {
          return nextChain;
        }
        stack.push([target, nextChain]);
      }
    }
    return null;
  }

  for (const entry of ENTRIES) {
    it(`does not statically reach engine-resolution modules from ${entry}`, async () => {
      const file = path.join(packageDir, entry);
      expect(await pathExists(file))
        .withContext(`Missing build output: ${entry}`)
        .toBe(true);

      const chain = await findForbiddenPath(file);
      expect(chain)
        .withContext(
          chain
            ? `Engine-resolution code is statically reachable:\n  ${chain.join('\n    -> ')}`
            : '',
        )
        .toBeNull();
    });
  }
});
