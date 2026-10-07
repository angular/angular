/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HybridCompiler} from '../../src/hybrid_compiler.js';
import {mapDiagnostics} from '../../src/diagnostics.js';
import {Diagnostic} from 'vscode-languageserver';

export async function handleDiagnostics(
  params: {
    filePath: string;
    diagnostics: Diagnostic[];
  },
  hybridCompiler: HybridCompiler,
): Promise<{[filePath: string]: Diagnostic[]} | null> {
  const {filePath, diagnostics} = params;
  if (!filePath.endsWith('.ngtypecheck.ts')) {
    return null;
  }

  if (diagnostics.length === 0) {
    return null;
  }

  // No TS semantic check should be done in local compilation mode, as it is always full of errors
  // due to cross file imports.
  if (!hybridCompiler.optimize) {
    return null;
  }

  const tsFilePath = filePath.replace(/\.ngtypecheck\.ts$/, '.ts');
  const tcbCode = hybridCompiler.getTcbForFile(tsFilePath);

  if (!tcbCode) {
    return null;
  }

  return mapDiagnostics(tcbCode, diagnostics, tsFilePath, hybridCompiler);
}
