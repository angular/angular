/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

/**
 * A value binding declared in the top-level (module) scope of a source file.
 *
 * - `local`: declared in the file itself (`const`, `let`, `var`, `function`, `class`, `enum`,
 *   instantiated `namespace`, or `import x = ...`).
 * - `import`: introduced by an ES import. `importedName` is the name of the export (`'default'` for
 *   default imports), or `null` for namespace imports (`import * as ns from '...'`).
 */
export type ModuleScopeSymbol =
  | {kind: 'local'; name: string; node: ts.Node}
  | {
      kind: 'import';
      name: string;
      moduleSpecifier: string;
      importedName: string | null;
      isTypeOnly: boolean;
      node: ts.Identifier;
    };

const moduleScopeCache = new WeakMap<ts.SourceFile, Map<string, ModuleScopeSymbol>>();

/**
 * Collects the value bindings declared in the top-level scope of `sf`, keyed by name.
 *
 * This is a purely syntactic analysis: it does not use the type checker, so it also works in local
 * compilation mode. Type-only declarations (interfaces, type aliases) are not included, since they
 * can't be referenced from a template expression.
 */
export function getModuleScopeSymbols(sf: ts.SourceFile): Map<string, ModuleScopeSymbol> {
  let symbols = moduleScopeCache.get(sf);
  if (symbols !== undefined) {
    return symbols;
  }

  symbols = new Map();
  const addLocal = (name: ts.Identifier | undefined, node: ts.Node) => {
    if (name !== undefined && !symbols!.has(name.text)) {
      symbols!.set(name.text, {kind: 'local', name: name.text, node});
    }
  };

  for (const stmt of sf.statements) {
    if (ts.isImportDeclaration(stmt)) {
      const clause = stmt.importClause;
      if (clause === undefined || !ts.isStringLiteral(stmt.moduleSpecifier)) {
        continue;
      }
      const moduleSpecifier = stmt.moduleSpecifier.text;
      const clauseIsTypeOnly = clause.phaseModifier === ts.SyntaxKind.TypeKeyword;
      if (clause.name !== undefined) {
        symbols.set(clause.name.text, {
          kind: 'import',
          name: clause.name.text,
          moduleSpecifier,
          importedName: 'default',
          isTypeOnly: clauseIsTypeOnly,
          node: clause.name,
        });
      }
      const bindings = clause.namedBindings;
      if (bindings === undefined) {
        continue;
      }
      if (ts.isNamespaceImport(bindings)) {
        symbols.set(bindings.name.text, {
          kind: 'import',
          name: bindings.name.text,
          moduleSpecifier,
          importedName: null,
          isTypeOnly: clauseIsTypeOnly,
          node: bindings.name,
        });
      } else {
        for (const element of bindings.elements) {
          symbols.set(element.name.text, {
            kind: 'import',
            name: element.name.text,
            moduleSpecifier,
            importedName: (element.propertyName ?? element.name).text,
            isTypeOnly: clauseIsTypeOnly || element.isTypeOnly,
            node: element.name,
          });
        }
      }
    } else if (ts.isVariableStatement(stmt)) {
      for (const decl of stmt.declarationList.declarations) {
        forEachBindingName(decl.name, (id) => addLocal(id, decl));
      }
    } else if (
      ts.isFunctionDeclaration(stmt) ||
      ts.isClassDeclaration(stmt) ||
      ts.isEnumDeclaration(stmt) ||
      ts.isImportEqualsDeclaration(stmt)
    ) {
      if (ts.isImportEqualsDeclaration(stmt) && stmt.isTypeOnly) {
        continue;
      }
      addLocal(stmt.name, stmt);
    } else if (ts.isModuleDeclaration(stmt) && ts.isIdentifier(stmt.name)) {
      // Only namespaces that produce a value at runtime can be referenced.
      if (stmt.body !== undefined && isInstantiatedModuleBody(stmt.body)) {
        addLocal(stmt.name, stmt);
      }
    }
  }

  moduleScopeCache.set(sf, symbols);
  return symbols;
}

function forEachBindingName(name: ts.BindingName, fn: (id: ts.Identifier) => void): void {
  if (ts.isIdentifier(name)) {
    fn(name);
    return;
  }
  for (const element of name.elements) {
    if (!ts.isOmittedExpression(element)) {
      forEachBindingName(element.name, fn);
    }
  }
}

function isInstantiatedModuleBody(body: ts.ModuleBody | ts.JSDocNamespaceDeclaration): boolean {
  if (ts.isModuleDeclaration(body)) {
    return body.body !== undefined && isInstantiatedModuleBody(body.body);
  }
  if (!ts.isModuleBlock(body)) {
    return false;
  }
  return body.statements.some(
    (stmt) => !ts.isInterfaceDeclaration(stmt) && !ts.isTypeAliasDeclaration(stmt),
  );
}
