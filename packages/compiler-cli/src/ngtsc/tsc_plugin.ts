/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PluginCompilerHost, TscPlugin} from '@bazel/typescript/internal/tsc_wrapped/plugin_api';
import * as ts from 'typescript';

import {CompilerOptions} from '../transformers/api';

import {NgtscProgram} from './program';
import {SyntheticFilesCompilerHost} from './synthetic_files_compiler_host';


// Copied from tsc_wrapped/plugin_api.ts to avoid a runtime dependency on the
// @bazel/typescript package - it would be strange for non-Bazel users of
// Angular to fetch that package.
function createProxy<T>(delegate: T): T {
  const proxy = Object.create(null);
  for (const k of Object.keys(delegate)) {
    proxy[k] = function() { return (delegate as any)[k].apply(delegate, arguments); };
  }
  return proxy;
}

export class NgTscPlugin implements TscPlugin {
  constructor(private options: CompilerOptions) {}

  private program: NgtscProgram|undefined = undefined;

  wrapHost(inputFiles: string[], compilerHost: ts.CompilerHost) {
    this.program = new NgtscProgram(
        inputFiles, this.options, compilerHost, /* todo old program */
        undefined);

    return new SyntheticFilesCompilerHost(inputFiles, compilerHost, (rootFiles: string[]) => {
      // For demo purposes, assume that the first .ts rootFile is the only
      // one that needs ngfactory.js/d.ts back-compat files produced.
      const tsInputs = rootFiles.filter(f => f.endsWith('.ts') && !f.endsWith('.d.ts'));
      const factoryPath: string = tsInputs[0].replace(/\.ts/, '.ngfactory.ts');

      return {
          // factoryPath: (host: ts.CompilerHost) =>
          //  ts.createSourceFile(factoryPath, 'contents', ts.ScriptTarget.ES5),
      };
    });
  }

  wrap(tsProgram: ts.Program, config: {}, host: ts.CompilerHost) {
    if (!this.program) {
      throw new Error('internal NgTscPlugin error: called wrap() before NgtscProgram created');
    }
    const ngProgram: NgtscProgram = this.program;

    const proxy = createProxy(tsProgram);
    proxy.getOptionsDiagnostics = (cancellationToken?: ts.CancellationToken) => {
      return [
        ...tsProgram.getOptionsDiagnostics(cancellationToken),
        ...ngProgram.getNgOptionDiagnostics(cancellationToken) as ts.Diagnostic[],
      ]
    };
    proxy.getSyntacticDiagnostics =
        (sourceFile?: ts.SourceFile, cancellationToken?: ts.CancellationToken) => {
          return [
            ...tsProgram.getSyntacticDiagnostics(sourceFile, cancellationToken),
            // TODO: does angular contribute syntax errors?
          ]
        };
    proxy.getSemanticDiagnostics = (sourceFile: ts.SourceFile) => {
      return [
        ...tsProgram.getSemanticDiagnostics(sourceFile),
        ...ngProgram.getNgSemanticDiagnostics() as ts.Diagnostic[],
      ];
    };

    return proxy;
  }

  createTransformers(host: PluginCompilerHost) {
    if (!this.program) {
      throw new Error(
          'internal NgTscPlugin error: called createTransformers() before NgtscProgram created');
    }
    return this.program.customTransformers;
  }
}
