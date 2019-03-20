/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PluginCompilerHost, TscPlugin} from '@bazel/typescript/internal/tsc_wrapped/plugin_api';
import * as ts from 'typescript';

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
  constructor(private angularCompilerOptions: unknown) {}

  wrapHost(inputFiles: string[], compilerHost: ts.CompilerHost) {
    return new SyntheticFilesCompilerHost(inputFiles, compilerHost, (rootFiles: string[]) => {
      // For demo purposes, assume that the first .ts rootFile is the only
      // one that needs ngfactory.js/d.ts back-compat files produced.
      const tsInputs = rootFiles.filter(f => f.endsWith('.ts') && !f.endsWith('.d.ts'));
      const factoryPath: string = tsInputs[0].replace(/\.ts/, '.ngfactory.ts');

      return {
        factoryPath: (host: ts.CompilerHost) =>
                         ts.createSourceFile(factoryPath, 'contents', ts.ScriptTarget.ES5),
      };
    });
  }

  wrap(program: ts.Program, config: {}, host: ts.CompilerHost) {
    const proxy = createProxy(program);
    proxy.getSemanticDiagnostics = (sourceFile: ts.SourceFile) => {
      const result: ts.Diagnostic[] = [...program.getSemanticDiagnostics(sourceFile)];

      // For demo purposes, trigger a diagnostic when the sourcefile has a magic string
      if (sourceFile.text.indexOf('diag') >= 0) {
        const fake: ts.Diagnostic = {
          file: sourceFile,
          start: 0,
          length: 3,
          messageText: 'Example Angular Compiler Diagnostic',
          category: ts.DiagnosticCategory.Error,
          code: 12345,
          // source is the name of the plugin.
          source: 'ngtsc',
        };
        result.push(fake);
      }
      return result;
    };
    return proxy;
  }

  createTransformers(host: PluginCompilerHost) {
    const afterDeclarations: Array<ts.TransformerFactory<ts.SourceFile|ts.Bundle>> =
        [(context: ts.TransformationContext) => (sf: ts.SourceFile | ts.Bundle) => {
          const visitor = (node: ts.Node): ts.Node => {
            if (ts.isClassDeclaration(node)) {
              // For demo purposes, transform the class name in the .d.ts output
              return ts.updateClassDeclaration(
                  node, node.decorators, node.modifiers, ts.createIdentifier('NEWNAME'),
                  node.typeParameters, node.heritageClauses, node.members);
            }
            return ts.visitEachChild(node, visitor, context);
          };
          return visitor(sf) as ts.SourceFile;
        }];
    return {afterDeclarations};
  }
}
