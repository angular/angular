/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

export function aliasTransformFactory(exportStatements: Map<string, Map<string, [string, string]>>):
    ts.TransformerFactory<ts.SourceFile> {
  return () => {
    return (file: ts.SourceFile) => {
      if (ts.isBundle(file) || !exportStatements.has(file.fileName)) {
        return file;
      }

      const statements = [...file.statements];
      exportStatements.get(file.fileName)!.forEach(([moduleName, symbolName], aliasName) => {
        const stmt = ts.factory.createExportDeclaration(
            /* modifiers */ undefined,
            /* isTypeOnly */ false,
            /* exportClause */ ts.factory.createNamedExports([ts.factory.createExportSpecifier(
                false, symbolName, aliasName)]),
            /* moduleSpecifier */ ts.factory.createStringLiteral(moduleName));
        statements.push(stmt);
      });

      return ts.factory.updateSourceFile(file, statements);
    };
  };
}
