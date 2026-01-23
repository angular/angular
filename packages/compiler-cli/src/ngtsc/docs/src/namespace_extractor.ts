/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {DocEntry, EntryType, NamespaceEntry} from './entities';
import {FunctionExtractor} from './function_extractor';
import {extractInterface} from './interface_extractor';
import {extractJsDocDescription, extractJsDocTags, extractRawJsDoc} from './jsdoc_extractor';
import {extractTypeAlias} from './type_alias_extractor';
import {extractFromVariableStatement} from './variable_extractor';

/**
 * Extracts documentation entry for a TypeScript namespace.
 * @param node The TypeScript AST node for the namespace.
 * @param typeChecker The TypeScript type checker.
 */
export function extractNamespace(
  node: ts.ModuleDeclaration,
  typeChecker: ts.TypeChecker,
): NamespaceEntry {
  const members: DocEntry[] = [];
  if (node.body && ts.isModuleBlock(node.body)) {
    for (const statement of node.body.statements) {
      let entries: DocEntry[] = [];
      if (ts.isInterfaceDeclaration(statement)) {
        entries.push(extractInterface(statement, typeChecker));
      } else if (ts.isTypeAliasDeclaration(statement)) {
        entries.push(extractTypeAlias(statement));
      } else if (ts.isFunctionDeclaration(statement)) {
        const name = statement.name?.getText();
        if (name) {
          entries.push(new FunctionExtractor(name, statement, typeChecker).extract());
        }
      } else if (ts.isVariableStatement(statement)) {
        entries.push(...extractFromVariableStatement(statement, typeChecker));
      }

      // We only include exported members in the documentation.
      let isExported = false;
      if (ts.canHaveModifiers(statement)) {
        isExported = (ts.getModifiers(statement) ?? []).some(
          (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
        );
      }

      if (isExported) {
        members.push(...entries);
      }
    }
  }

  return {
    name: node.name.getText(),
    entryType: EntryType.Namespace,
    description: extractJsDocDescription(node),
    rawComment: extractRawJsDoc(node),
    jsdocTags: extractJsDocTags(node),
    members,
  };
}
