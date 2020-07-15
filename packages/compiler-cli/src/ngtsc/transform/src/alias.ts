/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

export function aliasTransformFactory(exportStatements: Map<string, Map<string, [string, string]>>):
    ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) => {
    return (file: ts.SourceFile) => {
      if (ts.isBundle(file) || !exportStatements.has(file.fileName)) {
        return file;
      }

      const statements = [...file.statements];
      exportStatements.get(file.fileName)!.forEach(([moduleName, symbolName], aliasName) => {
        const stmt = ts.createExportDeclaration(
            /* decorators */ undefined,
            /* modifiers */ undefined,
            /* exportClause */ ts.createNamedExports([ts.createExportSpecifier(
                /* propertyName */ symbolName,
                /* name */ aliasName)]),
            /* moduleSpecifier */ ts.createStringLiteral(moduleName));
        statements.push(stmt);
      });

      return ts.updateSourceFileNode(file, statements);
    };
  };
}
