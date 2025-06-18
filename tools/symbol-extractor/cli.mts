/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as fs from 'fs';
import * as path from 'path';
import {globSync} from 'tinyglobby';

import {SymbolExtractor} from './symbol_extractor.mjs';
import assert from 'assert';

const args = process.argv.slice(2) as [string, string];
process.exitCode = main(args) ? 0 : 1;

interface GoldenFile {
  chunks: {
    main: string[];
    lazy: string[];
  };
}

/**
 * CLI main method.
 *
 * ```
 *   cli javascriptFilePath.js goldenFilePath.json
 * ```
 */
function main(argv: [string, string, string] | [string, string]): boolean {
  const bundlesDir = path.resolve(argv[0]);
  const goldenFilePath = path.resolve(argv[1]);
  const doUpdate = argv[2] === '--accept';
  const bundles = globSync('**/*.js', {cwd: bundlesDir});
  const goldenContent = fs.readFileSync(goldenFilePath).toString();
  const golden = JSON.parse(goldenContent) as GoldenFile;

  console.info('Input bundles directory:', bundlesDir);

  const importEdges = new Map<string, string[]>();
  const bundleSymbols = new Map<string, SymbolExtractor>();

  for (const bundleFile of bundles) {
    console.info('Processing bundle file:', bundleFile);

    const javascriptContent = fs.readFileSync(path.join(bundlesDir, bundleFile)).toString();
    const symbolExtractor = new SymbolExtractor(javascriptContent);

    // Keep track of import edges, so we can determine what is loaded lazily vs eagerly.
    importEdges.set(bundleFile, symbolExtractor.eagerlyLoadedRelativeSpecifiers);

    bundleSymbols.set(bundleFile, symbolExtractor);
  }

  // Find all bundles that are eagerly loaded by the `main.js` bundle.
  const eagerlyLoadedBundles = new Set<string>();
  const queue: string[] = ['main.js'];
  while (queue.length !== 0) {
    const entry = queue.pop()!;

    if (eagerlyLoadedBundles.has(entry)) {
      continue;
    }
    eagerlyLoadedBundles.add(entry);

    for (const edge of importEdges.get(entry) ?? []) {
      queue.push(edge);
    }
  }

  const eagerlyLoadedSymbols: string[] = [];
  const lazySymbols: string[] = [];

  for (const bundleFile of bundles) {
    const extractor = bundleSymbols.get(bundleFile);
    assert(extractor, `Expected symbol extractor to exist for bundle: ${bundleFile}`);

    (eagerlyLoadedBundles.has(bundleFile) ? eagerlyLoadedSymbols : lazySymbols).push(
      ...extractor.actual,
    );
  }

  if (doUpdate) {
    const newGolden: GoldenFile = {
      chunks: {
        main: eagerlyLoadedSymbols,
        lazy: lazySymbols,
      },
    };

    const goldenOutFilePath = path.join(process.env['BUILD_WORKING_DIRECTORY']!, argv[1]);
    fs.writeFileSync(goldenOutFilePath, JSON.stringify(newGolden, undefined, 2));
    console.error('Updated golden file:', goldenOutFilePath);
    return true;
  }

  const success =
    SymbolExtractor.compareAndPrintError(goldenFilePath, golden?.chunks?.lazy ?? [], lazySymbols) &&
    SymbolExtractor.compareAndPrintError(
      goldenFilePath,
      golden?.chunks?.main ?? [],
      eagerlyLoadedSymbols,
    );

  if (!success) {
    console.error(`TEST FAILED!`);
    console.error(`  To update the golden file run: `);
    console.error(`    yarn bazel run ${process.env['TEST_TARGET']}.accept`);
  }

  return success;
}
