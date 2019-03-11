/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {TypeValueReference} from './host';

/**
 * Potentially convert a `ts.TypeNode` to a `TypeValueReference`, which indicates how to use the
 * type given in the `ts.TypeNode` in a value position.
 *
 * This can return `null` if the `typeNode` is `null`, if it does not refer to a symbol with a value
 * declaration, or if it is not possible to statically understand.
 */
export function typeToValue(
    typeNode: ts.TypeNode | null, checker: ts.TypeChecker): TypeValueReference|null {
  // It's not possible to get a value expression if the parameter doesn't even have a type.
  if (typeNode === null || !ts.isTypeReferenceNode(typeNode)) {
    return null;
  }

  const symbols = resolveTypeSymbols(typeNode, checker);
  if (symbols === null) {
    return null;
  }

  const {local, decl} = symbols;
  // It's only valid to convert a type reference to a value reference if the type actually
  // has a value declaration associated with it.
  if (decl.valueDeclaration === undefined) {
    return null;
  }

  // The type points to a valid value declaration. Rewrite the TypeReference into an
  // Expression which references the value pointed to by the TypeReference, if possible.

  // Look at the local `ts.Symbol`'s declarations and see if it comes from an import
  // statement. If so, extract the module specifier and the name of the imported type.
  const firstDecl = local.declarations && local.declarations[0];

  if (firstDecl && ts.isImportClause(firstDecl) && firstDecl.name !== undefined) {
    // This is a default import.
    return {
      local: true,
      // Copying the name here ensures the generated references will be correctly transformed along
      // with the import.
      expression: ts.updateIdentifier(firstDecl.name),
      defaultImportStatement: firstDecl.parent,
    };
  } else if (firstDecl && isImportSource(firstDecl)) {
    const origin = extractModuleAndNameFromImport(firstDecl, symbols.importName);
    return {local: false, valueDeclaration: decl.valueDeclaration, ...origin};
  } else {
    const expression = typeNodeToValueExpr(typeNode);
    if (expression !== null) {
      return {
        local: true,
        expression,
        defaultImportStatement: null,
      };
    } else {
      return null;
    }
  }
}

/**
 * Attempt to extract a `ts.Expression` that's equivalent to a `ts.TypeNode`, as the two have
 * different AST shapes but can reference the same symbols.
 *
 * This will return `null` if an equivalent expression cannot be constructed.
 */
export function typeNodeToValueExpr(node: ts.TypeNode): ts.Expression|null {
  if (ts.isTypeReferenceNode(node)) {
    return entityNameToValue(node.typeName);
  } else {
    return null;
  }
}

/**
 * Resolve a `TypeReference` node to the `ts.Symbol`s for both its declaration and its local source.
 *
 * In the event that the `TypeReference` refers to a locally declared symbol, these will be the
 * same. If the `TypeReference` refers to an imported symbol, then `decl` will be the fully resolved
 * `ts.Symbol` of the referenced symbol. `local` will be the `ts.Symbol` of the `ts.Identifer` which
 * points to the import statement by which the symbol was imported.
 *
 * In the event `typeRef` refers to a default import, an `importName` will also be returned to
 * give the identifier name within the current file by which the import is known.
 */
function resolveTypeSymbols(typeRef: ts.TypeReferenceNode, checker: ts.TypeChecker):
    {local: ts.Symbol, decl: ts.Symbol, importName: string | null}|null {
  const typeName = typeRef.typeName;
  // typeRefSymbol is the ts.Symbol of the entire type reference.
  const typeRefSymbol: ts.Symbol|undefined = checker.getSymbolAtLocation(typeName);
  if (typeRefSymbol === undefined) {
    return null;
  }

  // local is the ts.Symbol for the local ts.Identifier for the type.
  // If the type is actually locally declared or is imported by name, for example:
  //   import {Foo} from './foo';
  // then it'll be the same as top. If the type is imported via a namespace import, for example:
  //   import * as foo from './foo';
  // and then referenced as:
  //   constructor(f: foo.Foo)
  // then local will be the ts.Symbol of `foo`, whereas top will be the ts.Symbol of `foo.Foo`.
  // This allows tracking of the import behind whatever type reference exists.
  let local = typeRefSymbol;
  let importName: string|null = null;

  // TODO(alxhub): this is technically not correct. The user could have any import type with any
  // amount of qualification following the imported type:
  //
  // import * as foo from 'foo'
  // constructor(inject: foo.X.Y.Z)
  //
  // What we really want is the ability to express the arbitrary operation of `.X.Y.Z` on top of
  // whatever import we generate for 'foo'. This logic is sufficient for now, though.
  if (ts.isQualifiedName(typeName) && ts.isIdentifier(typeName.left) &&
      ts.isIdentifier(typeName.right)) {
    const localTmp = checker.getSymbolAtLocation(typeName.left);
    if (localTmp !== undefined) {
      local = localTmp;
      importName = typeName.right.text;
    }
  }

  // De-alias the top-level type reference symbol to get the symbol of the actual declaration.
  let decl = typeRefSymbol;
  if (typeRefSymbol.flags & ts.SymbolFlags.Alias) {
    decl = checker.getAliasedSymbol(typeRefSymbol);
  }
  return {local, decl, importName};
}

function entityNameToValue(node: ts.EntityName): ts.Expression|null {
  if (ts.isQualifiedName(node)) {
    const left = entityNameToValue(node.left);
    return left !== null ? ts.createPropertyAccess(left, node.right) : null;
  } else if (ts.isIdentifier(node)) {
    return ts.getMutableClone(node);
  } else {
    return null;
  }
}

function isImportSource(node: ts.Declaration): node is(ts.ImportSpecifier | ts.NamespaceImport) {
  return ts.isImportSpecifier(node) || ts.isNamespaceImport(node);
}

function extractModuleAndNameFromImport(
    node: ts.ImportSpecifier | ts.NamespaceImport | ts.ImportClause,
    localName: string | null): {name: string, moduleName: string} {
  let name: string;
  let moduleSpecifier: ts.Expression;
  switch (node.kind) {
    case ts.SyntaxKind.ImportSpecifier:
      // The symbol was imported by name, in a ts.ImportSpecifier.
      name = (node.propertyName || node.name).text;
      moduleSpecifier = node.parent.parent.parent.moduleSpecifier;
      break;
    case ts.SyntaxKind.NamespaceImport:
      // The symbol was imported via a namespace import. In this case, the name to use when
      // importing it was extracted by resolveTypeSymbols.
      if (localName === null) {
        // resolveTypeSymbols() should have extracted the correct local name for the import.
        throw new Error(`Debug failure: no local name provided for NamespaceImport`);
      }
      name = localName;
      moduleSpecifier = node.parent.parent.moduleSpecifier;
      break;
    default:
      throw new Error(`Unreachable: ${ts.SyntaxKind[(node as ts.Node).kind]}`);
  }

  if (!ts.isStringLiteral(moduleSpecifier)) {
    throw new Error('not a module specifier');
  }
  const moduleName = moduleSpecifier.text;
  return {moduleName, name};
}
