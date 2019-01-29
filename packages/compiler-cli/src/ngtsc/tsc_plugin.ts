/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PluginCompilerHost, TscPlugin} from '@bazel/typescript/tsc_wrapped/plugin_api';
import * as ts from 'typescript';

import {SyntheticFilesCompilerHost} from './synthetic_files_compiler_host';

// Copied from tsc_wrapped/plugin_api.ts to avoid a runtime dependency on that package
function createProxy<T>(delegate: T): T {
  const proxy = Object.create(null);
  for (const k of Object.keys(delegate)) {
    proxy[k] = function() { return (delegate as any)[k].apply(delegate, arguments); };
  }
  return proxy;
}

export class NgTscPlugin implements TscPlugin {
  constructor(private angularCompilerOptions: unknown) {}

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
          source: 'Angular',
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
            if (node.kind === ts.SyntaxKind.ClassDeclaration) {
              const clz = node as ts.ClassDeclaration;
              // For demo purposes, transform the class name in the .d.ts output
              return ts.updateClassDeclaration(
                  clz, clz.decorators, node.modifiers, ts.createIdentifier('NEWNAME'),
                  clz.typeParameters, clz.heritageClauses, clz.members);
            }
            return ts.visitEachChild(node, visitor, context);
          };
          return visitor(sf) as ts.SourceFile;
        }];
    return {afterDeclarations};
  }

  wrapHost(inputFiles: string[], compilerHost: ts.CompilerHost) {
    return new SyntheticFilesCompilerHost(inputFiles, compilerHost, this.generatedFiles);
  }

  generatedFiles(rootFiles: string[]) {
    return {
      'file-1.ts': (host: ts.CompilerHost) =>
                       ts.createSourceFile('file-1.ts', 'contents', ts.ScriptTarget.ES5),
    };
  }
}
