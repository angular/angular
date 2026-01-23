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
import {ClassDeclaration} from '../../reflection';
import ts from 'typescript';

/**
 * Gets the declaration for the function that replaces the metadata of a class during HMR.
 * @param compilationResults Code generated for the class during compilation.
 * @param meta HMR metadata about the class.
 * @param declaration Class for which the update declaration is being generated.
 */
export function getHmrUpdateDeclaration(
  compilationResults: CompileResult[],
  constantStatements: o.Statement[],
  meta: R3HmrMetadata,
  declaration: ClassDeclaration,
): ts.FunctionDeclaration {
  const namespaceSpecifiers = meta.namespaceDependencies.reduce((result, current) => {
    result.set(current.moduleName, current.assignedName);
    return result;
  }, new Map<string, string>());
  const importRewriter = new HmrModuleImportRewriter(namespaceSpecifiers);
  const importManager = new ImportManager({
    ...presetImportManagerForceNamespaceImports,
    rewriter: importRewriter,
  });
  const callback = compileHmrUpdateCallback(compilationResults, constantStatements, meta);
  const sourceFile = ts.getOriginalNode(declaration).getSourceFile();
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

class HmrModuleImportRewriter {
  constructor(private readonly lookup: Map<string, string>) {}

  rewriteNamespaceImportIdentifier(specifier: string, moduleName: string): string {
    return this.lookup.has(moduleName) ? this.lookup.get(moduleName)! : specifier;
  }

  rewriteSymbol(symbol: string): string {
    return symbol;
  }

  rewriteSpecifier(specifier: string): string {
    return specifier;
  }
}
