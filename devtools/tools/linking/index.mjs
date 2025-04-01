/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * @fileoverview
 *
 * Script that copies the npm package contents of e.g. `@angular/cdk` over into
 * a new output directory while performing Angular linking using the local
 * Angular compiler-cli version.
 *
 * This is necessary for the devtools as we don't want to rely on JIT compilation,
 * and consumed libraries like Angular CDK, or Angular Material are only shipping
 * partial compilation output to npm.
 */

import linkerBabelPlugin from '../../../packages/compiler-cli/linker/babel/index.mjs';
import {transformAsync} from '@babel/core';
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {globSync} from 'tinyglobby';
import path from 'path';

async function main() {
  const [packageDir, outDir] = process.argv.slice(2);

  // Copy without preserving readonly permissions from Bazel.
  await Promise.all(
    globSync('**/*', {cwd: packageDir}).map(async (filePath) => {
      await mkdir(path.dirname(path.join(outDir, filePath)), {recursive: true});
      await writeFile(path.join(outDir, filePath), await readFile(path.join(packageDir, filePath)));
    }),
  );

  const fesmBundles = globSync('fesm2022/**/*.mjs', {cwd: outDir});
  const tasks = [];
  const babelOptions = {
    plugins: [
      [
        linkerBabelPlugin,
        {
          // We compile with an unstamped version of the compiler, so ignore.
          unknownDeclarationVersionHandling: 'ignore',
        },
      ],
    ],
  };

  for (const bundleFile of fesmBundles) {
    tasks.push(
      (async () => {
        const filePath = path.join(outDir, bundleFile);
        const content = await readFile(filePath, 'utf8');
        const result = await transformAsync(content, {...babelOptions, filename: filePath});

        await writeFile(path.join(outDir, bundleFile), result.code);
      })(),
    );
  }

  await Promise.all(tasks);
}

main().catch((e) => {
  console.error(e, e.stack);
  process.exitCode = 1;
});
