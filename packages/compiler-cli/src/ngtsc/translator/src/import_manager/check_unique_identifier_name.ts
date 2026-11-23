/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import type {ImportManagerConfig} from './import_manager';

/** Extension of `ts.SourceFile` with metadata fields that are marked as internal. */
interface SourceFileWithIdentifiers extends ts.SourceFile {
  /** List of all identifiers encountered while parsing the source file. */
  identifiers?: Map<string, string>;
}

/**
 * Generates a helper for `ImportManagerConfig` to generate unique identifiers
 * for a given source file.
 */
export function createGenerateUniqueIdentifierHelper(): ImportManagerConfig['generateUniqueIdentifier'] {
  const generatedIdentifiers = new Set<string>();
  const isGeneratedIdentifier = (sf: ts.SourceFile, identifierName: string) =>
    generatedIdentifiers.has(`${sf.fileName}@@${identifierName}`);
  const markIdentifierAsGenerated = (sf: ts.SourceFile, identifierName: string) =>
    generatedIdentifiers.add(`${sf.fileName}@@${identifierName}`);

  return (sourceFile: ts.SourceFile, symbolName: string) => {
    const sf = sourceFile as SourceFileWithIdentifiers;

    // NOTE: Typically accesses to TS fields are not renamed because the 1P externs
    // produced from TypeScript are ensuring public fields are considered "external".
    // See: https://developers.google.com/closure/compiler/docs/externs-and-exports.
    // This property is internal, so not part of the externs— so we need be cautious
    if (sf['identifiers'] === undefined) {
      throw new Error('Source file unexpectedly lacks map of parsed `identifiers`.');
    }

    const isUniqueIdentifier = (name: string) =>
      !sf['identifiers']!.has(name) && !isGeneratedIdentifier(sf, name);

    // Generated aliases keep the strict check, as `createUniqueName` is resolved by the
    // emitter against the raw `identifiers` map.
    if (
      isUniqueIdentifier(symbolName) ||
      (!isGeneratedIdentifier(sf, symbolName) && !getBindingNames(sf).has(symbolName))
    ) {
      markIdentifierAsGenerated(sf, symbolName);
      return null;
    }

    let name = null;
    let counter = 1;
    do {
      name = `${symbolName}_${counter++}`;
    } while (!isUniqueIdentifier(name));

    markIdentifierAsGenerated(sf, name);
    return ts.factory.createUniqueName(name, ts.GeneratedIdentifierFlags.Optimistic);
  };
}

const bindingNamesCache = new WeakMap<ts.SourceFile, Set<string>>();

/**
 * Collects the names of identifiers in the source file that can bind or reference a symbol.
 * Names such as object literal keys or `a.name` accesses are skipped because they cannot
 * conflict with an import.
 */
function getBindingNames(sf: ts.SourceFile): Set<string> {
  let names = bindingNamesCache.get(sf);
  if (names === undefined) {
    names = new Set();
    const visit = (node: ts.Node, parent: ts.Node) => {
      if (ts.isIdentifier(node)) {
        if (!isNonBindingName(node, parent)) {
          names!.add(node.text);
        }
      } else if (!ts.isExportDeclaration(node) || node.moduleSpecifier === undefined) {
        ts.forEachChild(node, (child) => visit(child, node));
      }
    };
    ts.forEachChild(sf, (child) => visit(child, sf));
    bindingNamesCache.set(sf, names);
  }
  return names;
}

function isNonBindingName(node: ts.Identifier, parent: ts.Node): boolean {
  if (ts.isQualifiedName(parent)) {
    return parent.right === node;
  }
  if (ts.isBindingElement(parent) || ts.isImportSpecifier(parent)) {
    return parent.propertyName === node;
  }
  if (ts.isExportSpecifier(parent)) {
    return parent.propertyName !== undefined && parent.name === node;
  }
  if (
    ts.isLabeledStatement(parent) ||
    ts.isBreakStatement(parent) ||
    ts.isContinueStatement(parent)
  ) {
    return parent.label === node;
  }
  return (
    (ts.isPropertyAccessExpression(parent) ||
      ts.isPropertyAssignment(parent) ||
      ts.isPropertyDeclaration(parent) ||
      ts.isPropertySignature(parent) ||
      ts.isMethodDeclaration(parent) ||
      ts.isMethodSignature(parent) ||
      ts.isGetAccessorDeclaration(parent) ||
      ts.isSetAccessorDeclaration(parent) ||
      ts.isEnumMember(parent) ||
      ts.isNamedTupleMember(parent) ||
      ts.isJsxAttribute(parent)) &&
    parent.name === node
  );
}
