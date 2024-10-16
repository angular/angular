/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {compileHmrUpdateCallback, R3HmrMetadata, outputAst as o} from '@angular/compiler';
import {CompileResult} from '../../transform';
import {
  ImportManager,
  presetImportManagerForceNamespaceImports,
  translateStatement,
} from '../../translator';
import ts from 'typescript';

/**
 * Gets the declaration for the function that replaces the metadata of a class during HMR.
 * @param compilationResults Code generated for the class during compilation.
 * @param meta HMR metadata about the class.
 * @param sourceFile File in which the class is defined.
 */
export function getHmrUpdateDeclaration(
  compilationResults: CompileResult[],
  constantStatements: o.Statement[],
  meta: R3HmrMetadata,
  sourceFile: ts.SourceFile,
): ts.FunctionDeclaration {
  const importRewriter = new HmrModuleImportRewriter(meta.coreName);
  const importManager = new ImportManager({
    ...presetImportManagerForceNamespaceImports,
    rewriter: importRewriter,
  });
  const callback = compileHmrUpdateCallback(compilationResults, constantStatements, meta);
  const node = translateStatement(sourceFile, callback, importManager) as ts.FunctionDeclaration;

  // The output AST doesn't support modifiers so we have to emit to
  // TS and then update the declaration to add `export default`.
  return ts.factory.updateFunctionDeclaration(
    node,
    [
      ts.factory.createToken(ts.SyntaxKind.ExportKeyword),
      ts.factory.createToken(ts.SyntaxKind.DefaultKeyword),
    ],
    node.asteriskToken,
    node.name,
    node.typeParameters,
    node.parameters,
    node.type,
    node.body,
  );
}

/** Rewriter that replaces namespace imports to `@angular/core` with a specifier identifier. */
class HmrModuleImportRewriter {
  constructor(private readonly coreName: string) {}

  rewriteNamespaceImportIdentifier(specifier: string, moduleName: string): string {
    return moduleName === '@angular/core' ? this.coreName : specifier;
  }

  rewriteSymbol(symbol: string): string {
    return symbol;
  }

  rewriteSpecifier(specifier: string): string {
    return specifier;
  }
}
