/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
export function createGenerateUniqueIdentifierHelper():
    ImportManagerConfig['generateUniqueIdentifier'] {
  const generatedIdentifiers = new Set<string>();

  return (sourceFile: ts.SourceFile, symbolName: string) => {
    const sf = sourceFile as SourceFileWithIdentifiers;
    if (sf.identifiers === undefined) {
      throw new Error('Source file unexpectedly lacks map of parsed `identifiers`.');
    }

    const isUniqueIdentifier = (name: string) =>
        !sf.identifiers!.has(name) && !generatedIdentifiers.has(name);

    if (isUniqueIdentifier(symbolName)) {
      generatedIdentifiers.add(symbolName);
      return null;
    }

    let name = null;
    let counter = 1;
    do {
      name = `${symbolName}_${counter++}`;
    } while (!isUniqueIdentifier(name));

    generatedIdentifiers.add(name);
    return ts.factory.createUniqueName(name, ts.GeneratedIdentifierFlags.Optimistic);
  };
}
