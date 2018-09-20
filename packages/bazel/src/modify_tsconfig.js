/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @fileoverview Read a tsconfig.json file intended to produce production mode
 * JS output, modify it to produce esm5 output instead, and write the result
 * to disk.
 */
const fs = require('fs');
const path = require('path');

function main(args) {
  if (args.length < 3) {
    console.error('Usage: $0 input.tsconfig.json output.tsconfig.json newRoot binDir');
  }
  [input, output, newRoot, binDir] = args;

  const data = JSON.parse(fs.readFileSync(input, {encoding: 'utf-8'}));
  data['compilerOptions']['target'] = 'es5';
  data['bazelOptions']['es5Mode'] = true;
  data['compilerOptions']['outDir'] = path.join(data['compilerOptions']['outDir'], newRoot);
  if (data['angularCompilerOptions']) {
    // Don't enable tsickle's closure conversions
    data['angularCompilerOptions']['annotateForClosureCompiler'] = false;
    data['angularCompilerOptions']['expectedOut'] =
        data['angularCompilerOptions']['expectedOut'].map(
            f => f.replace(/\.closure\.js$/, '.js').replace(binDir, path.join(binDir, newRoot)));
  }
  fs.writeFileSync(output, JSON.stringify(data));
}

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}
