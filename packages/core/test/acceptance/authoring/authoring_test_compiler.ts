/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TypeScriptReflectionHost} from '@angular/compiler-cli/src/ngtsc/reflection';
import {getInitializerApiJitTransform} from '@angular/compiler-cli/src/transformers/jit_transforms';
import fs from 'fs';
import ts from 'typescript';

main().catch(e => {
  console.error(e);
  process.exitCode = 1;
});

async function main() {
  const [inputTsExecPath, outputExecPath] = process.argv.slice(2);
  const program = ts.createProgram([inputTsExecPath], {
    skipLibCheck: true,
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Node10,
  });

  const host = new TypeScriptReflectionHost(program.getTypeChecker());
  const outputFile = ts.transform(
      program.getSourceFile(inputTsExecPath)!,
      [getInitializerApiJitTransform(host, /* isCore */ false)], program.getCompilerOptions());

  await fs.promises.writeFile(
      outputExecPath, ts.createPrinter().printFile(outputFile.transformed[0]));
}
