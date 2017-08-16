/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// TODO(chuckj): Remove the requirement for a fake 'reflect` implementation from
// the compiler
import 'reflect-metadata';

import {calcProjectFileAndBasePath, createNgCompilerOptions, formatDiagnostics, performCompilation} from '@angular/compiler-cli';
import * as fs from 'fs';
import * as path from 'path';
// Note, the tsc_wrapped module comes from rules_typescript, not from @angular/tsc-wrapped
import {parseTsconfig} from 'tsc_wrapped';
import * as ts from 'typescript';

function main(args: string[]) {
  const project = args[1];
  const [{options: tsOptions, bazelOpts, files, config}] = parseTsconfig(project);
  const {basePath} = calcProjectFileAndBasePath(project);
  const ngOptions = createNgCompilerOptions(basePath, config, tsOptions);

  const {diagnostics} = performCompilation({rootNames: files, options: ngOptions});
  if (diagnostics.length) {
    console.error(formatDiagnostics(ngOptions, diagnostics));
  }
  return diagnostics.some(d => d.category === ts.DiagnosticCategory.Error) ? 1 : 0;
}

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}
