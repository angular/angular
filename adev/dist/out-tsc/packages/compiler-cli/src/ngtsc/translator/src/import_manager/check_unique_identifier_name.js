/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import ts from 'typescript';
/**
 * Generates a helper for `ImportManagerConfig` to generate unique identifiers
 * for a given source file.
 */
export function createGenerateUniqueIdentifierHelper() {
  const generatedIdentifiers = new Set();
  const isGeneratedIdentifier = (sf, identifierName) =>
    generatedIdentifiers.has(`${sf.fileName}@@${identifierName}`);
  const markIdentifierAsGenerated = (sf, identifierName) =>
    generatedIdentifiers.add(`${sf.fileName}@@${identifierName}`);
  return (sourceFile, symbolName) => {
    const sf = sourceFile;
    // NOTE: Typically accesses to TS fields are not renamed because the 1P externs
    // produced from TypeScript are ensuring public fields are considered "external".
    // See: https://developers.google.com/closure/compiler/docs/externs-and-exports.
    // This property is internal, so not part of the externs— so we need be cautious
    if (sf['identifiers'] === undefined) {
      throw new Error('Source file unexpectedly lacks map of parsed `identifiers`.');
    }
    const isUniqueIdentifier = (name) =>
      !sf['identifiers'].has(name) && !isGeneratedIdentifier(sf, name);
    if (isUniqueIdentifier(symbolName)) {
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
//# sourceMappingURL=check_unique_identifier_name.js.map
