/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {createExportSpecifier} from '../../util/src/typescript';

export function aliasTransformFactory(exportStatements: Map<string, Map<string, [string, string]>>):
    ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) => {
    return (file: ts.SourceFile) => {
      if (ts.isBundle(file) || !exportStatements.has(file.fileName)) {
        return file;
      }

      const statements = [...file.statements];
      exportStatements.get(file.fileName)!.forEach(([moduleName, symbolName], aliasName) => {
        const stmt = ts.factory.createExportDeclaration(
            /* decorators */ undefined,
            /* modifiers */ undefined,
            /* isTypeOnly */ false,
            /* exportClause */ ts.createNamedExports([createExportSpecifier(
                symbolName, aliasName)]),
            /* moduleSpecifier */ ts.factory.createStringLiteral(moduleName));
        statements.push(stmt);
      });

      return ts.factory.updateSourceFile(file, statements);
    };
  };
}
