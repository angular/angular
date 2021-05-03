/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {TypeValueReference, TypeValueReferenceKind, UnavailableTypeValueReference, ValueUnavailableKind} from './host';

/**
 * Potentially convert a `ts.TypeNode` to a `TypeValueReference`, which indicates how to use the
 * type given in the `ts.TypeNode` in a value position.
 *
 * This can return `null` if the `typeNode` is `null`, if it does not refer to a symbol with a value
 * declaration, or if it is not possible to statically understand.
 */
export function typeToValue(
    typeNode: ts.TypeNode|null, checker: ts.TypeChecker): TypeValueReference {
  // It's not possible to get a value expression if the parameter doesn't even have a type.
  if (typeNode === null) {
    return missingType();
  }

  if (!ts.isTypeReferenceNode(typeNode)) {
    return unsupportedType(typeNode);
  }

  const symbols = resolveTypeSymbols(typeNode, checker);
  if (symbols === null) {
    return unknownReference(typeNode);
  }

  const {local, decl} = symbols;
  // It's only valid to convert a type reference to a value reference if the type actually
  // has a value declaration associated with it. Note that const enums are an exception,
  // because while they do have a value declaration, they don't exist at runtime.
  if (decl.valueDeclaration === undefined || decl.flags & ts.SymbolFlags.ConstEnum) {
    let typeOnlyDecl: ts.Declaration|null = null;
    if (decl.declarations !== undefined && decl.declarations.length > 0) {
      typeOnlyDecl = decl.declarations[0];
    }
    return noValueDeclaration(typeNode, typeOnlyDecl);
  }

  // The type points to a valid value declaration. Rewrite the TypeReference into an
  // Expression which references the value pointed to by the TypeReference, if possible.

  // Look at the local `ts.Symbol`'s declarations and see if it comes from an import
  // statement. If so, extract the module specifier and the name of the imported type.
  const firstDecl = local.declarations && local.declarations[0];
  if (firstDecl !== undefined) {
    if (ts.isImportClause(firstDecl) && firstDecl.name !== undefined) {
      // This is a default import.
      //   import Foo from 'foo';

      if (firstDecl.isTypeOnly) {
        // Type-only imports cannot be represented as value.
        return typeOnlyImport(typeNode, firstDecl);
      }

      return {
        kind: TypeValueReferenceKind.LOCAL,
        expression: firstDecl.name,
        defaultImportStatement: firstDecl.parent,
      };
    } else if (ts.isImportSpecifier(firstDecl)) {
      // The symbol was imported by name
      //   import {Foo} from 'foo';
      // or
      //   import {Foo as Bar} from 'foo';

      if (firstDecl.parent.parent.isTypeOnly) {
        // Type-only imports cannot be represented as value.
        return typeOnlyImport(typeNode, firstDecl.parent.parent);
      }

      // Determine the name to import (`Foo`) from the import specifier, as the symbol names of
      // the imported type could refer to a local alias (like `Bar` in the example above).
      const importedName = (firstDecl.propertyName || firstDecl.name).text;

      // The first symbol name refers to the local name, which is replaced by `importedName` above.
      // Any remaining symbol names make up the complete path to the value.
      const [_localName, ...nestedPath] = symbols.symbolNames;

      const moduleName = extractModuleName(firstDecl.parent.parent.parent);
      return {
        kind: TypeValueReferenceKind.IMPORTED,
        valueDeclaration: decl.valueDeclaration,
        moduleName,
        importedName,
        nestedPath
      };
    } else if (ts.isNamespaceImport(firstDecl)) {
      // The import is a namespace import
      //   import * as Foo from 'foo';

      if (firstDecl.parent.isTypeOnly) {
        // Type-only imports cannot be represented as value.
        return typeOnlyImport(typeNode, firstDecl.parent);
      }

      if (symbols.symbolNames.length === 1) {
        // The type refers to the namespace itself, which cannot be represented as a value.
        return namespaceImport(typeNode, firstDecl.parent);
      }

      // The first symbol name refers to the local name of the namespace, which is is discarded
      // as a new namespace import will be generated. This is followed by the symbol name that needs
      // to be imported and any remaining names that constitute the complete path to the value.
      const [_ns, importedName, ...nestedPath] = symbols.symbolNames;

      const moduleName = extractModuleName(firstDecl.parent.parent);
      return {
        kind: TypeValueReferenceKind.IMPORTED,
        valueDeclaration: decl.valueDeclaration,
        moduleName,
        importedName,
        nestedPath
      };
    }
  }

  // If the type is not imported, the type reference can be converted into an expression as is.
  const expression = typeNodeToValueExpr(typeNode);
  if (expression !== null) {
    return {
      kind: TypeValueReferenceKind.LOCAL,
      expression,
      defaultImportStatement: null,
    };
  } else {
    return unsupportedType(typeNode);
  }
}

function unsupportedType(typeNode: ts.TypeNode): UnavailableTypeValueReference {
  return {
    kind: TypeValueReferenceKind.UNAVAILABLE,
    reason: {kind: ValueUnavailableKind.UNSUPPORTED, typeNode},
  };
}

function noValueDeclaration(
    typeNode: ts.TypeNode, decl: ts.Declaration|null): UnavailableTypeValueReference {
  return {
    kind: TypeValueReferenceKind.UNAVAILABLE,
    reason: {kind: ValueUnavailableKind.NO_VALUE_DECLARATION, typeNode, decl},
  };
}

function typeOnlyImport(
    typeNode: ts.TypeNode, importClause: ts.ImportClause): UnavailableTypeValueReference {
  return {
    kind: TypeValueReferenceKind.UNAVAILABLE,
    reason: {kind: ValueUnavailableKind.TYPE_ONLY_IMPORT, typeNode, importClause},
  };
}

function unknownReference(typeNode: ts.TypeNode): UnavailableTypeValueReference {
  return {
    kind: TypeValueReferenceKind.UNAVAILABLE,
    reason: {kind: ValueUnavailableKind.UNKNOWN_REFERENCE, typeNode},
  };
}

function namespaceImport(
    typeNode: ts.TypeNode, importClause: ts.ImportClause): UnavailableTypeValueReference {
  return {
    kind: TypeValueReferenceKind.UNAVAILABLE,
    reason: {kind: ValueUnavailableKind.NAMESPACE, typeNode, importClause},
  };
}

function missingType(): UnavailableTypeValueReference {
  return {
    kind: TypeValueReferenceKind.UNAVAILABLE,
    reason: {kind: ValueUnavailableKind.MISSING_TYPE},
  };
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
 * `ts.Symbol` of the referenced symbol. `local` will be the `ts.Symbol` of the `ts.Identifier`
 * which points to the import statement by which the symbol was imported.
 *
 * All symbol names that make up the type reference are returned left-to-right into the
 * `symbolNames` array, which is guaranteed to include at least one entry.
 */
function resolveTypeSymbols(typeRef: ts.TypeReferenceNode, checker: ts.TypeChecker):
    {local: ts.Symbol, decl: ts.Symbol, symbolNames: string[]}|null {
  const typeName = typeRef.typeName;
  // typeRefSymbol is the ts.Symbol of the entire type reference.
  const typeRefSymbol: ts.Symbol|undefined = checker.getSymbolAtLocation(typeName);
  if (typeRefSymbol === undefined) {
    return null;
  }

  // `local` is the `ts.Symbol` for the local `ts.Identifier` for the type.
  // If the type is actually locally declared or is imported by name, for example:
  //   import {Foo} from './foo';
  // then it'll be the same as `typeRefSymbol`.
  //
  // If the type is imported via a namespace import, for example:
  //   import * as foo from './foo';
  // and then referenced as:
  //   constructor(f: foo.Foo)
  // then `local` will be the `ts.Symbol` of `foo`, whereas `typeRefSymbol` will be the `ts.Symbol`
  // of `foo.Foo`. This allows tracking of the import behind whatever type reference exists.
  let local = typeRefSymbol;

  // Destructure a name like `foo.X.Y.Z` as follows:
  // - in `leftMost`, the `ts.Identifier` of the left-most name (`foo`) in the qualified name.
  //   This identifier is used to resolve the `ts.Symbol` for `local`.
  // - in `symbolNames`, all names involved in the qualified path, or a single symbol name if the
  //   type is not qualified.
  let leftMost = typeName;
  const symbolNames: string[] = [];
  while (ts.isQualifiedName(leftMost)) {
    symbolNames.unshift(leftMost.right.text);
    leftMost = leftMost.left;
  }
  symbolNames.unshift(leftMost.text);

  if (leftMost !== typeName) {
    const localTmp = checker.getSymbolAtLocation(leftMost);
    if (localTmp !== undefined) {
      local = localTmp;
    }
  }

  // De-alias the top-level type reference symbol to get the symbol of the actual declaration.
  let decl = typeRefSymbol;
  if (typeRefSymbol.flags & ts.SymbolFlags.Alias) {
    decl = checker.getAliasedSymbol(typeRefSymbol);
  }
  return {local, decl, symbolNames};
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

function extractModuleName(node: ts.ImportDeclaration): string {
  if (!ts.isStringLiteral(node.moduleSpecifier)) {
    throw new Error('not a module specifier');
  }
  return node.moduleSpecifier.text;
}
