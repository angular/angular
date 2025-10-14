/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {compileHmrUpdateCallback} from '@angular/compiler';
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
 * @param declaration Class for which the update declaration is being generated.
 */
export function getHmrUpdateDeclaration(compilationResults, constantStatements, meta, declaration) {
  const namespaceSpecifiers = meta.namespaceDependencies.reduce((result, current) => {
    result.set(current.moduleName, current.assignedName);
    return result;
  }, new Map());
  const importRewriter = new HmrModuleImportRewriter(namespaceSpecifiers);
  const importManager = new ImportManager({
    ...presetImportManagerForceNamespaceImports,
    rewriter: importRewriter,
  });
  const callback = compileHmrUpdateCallback(compilationResults, constantStatements, meta);
  const sourceFile = ts.getOriginalNode(declaration).getSourceFile();
  const node = translateStatement(sourceFile, callback, importManager);
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
  lookup;
  constructor(lookup) {
    this.lookup = lookup;
  }
  rewriteNamespaceImportIdentifier(specifier, moduleName) {
    return this.lookup.has(moduleName) ? this.lookup.get(moduleName) : specifier;
  }
  rewriteSymbol(symbol) {
    return symbol;
  }
  rewriteSpecifier(specifier) {
    return specifier;
  }
}
//# sourceMappingURL=update_declaration.js.map
