/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {isIdentifierFreeInScope, ReservedMarker} from './is_identifier_free_in_scope';

/**
 * Helper that can generate unique identifier names at a
 * given location.
 *
 * Used for generating unique names to extract input reads
 * to support narrowing.
 */
export class UniqueNamesGenerator {
  constructor(private readonly fallbackSuffixes: string[]) {}

  generate(base: string, location: ts.Node): string {
    const checkNameAndClaimIfAvailable = (name: string): boolean => {
      const freeInfo = isIdentifierFreeInScope(name, location);
      if (freeInfo === null) {
        return false;
      }

      // Claim the locals to avoid conflicts with future generations.
      freeInfo.container.locals ??= new Map();
      freeInfo.container.locals.set(name, ReservedMarker);
      return true;
    };

    // Check the base name. Ideally, we'd use this one.
    if (checkNameAndClaimIfAvailable(base)) {
      return base;
    }

    // Try any of the possible suffixes.
    for (const suffix of this.fallbackSuffixes) {
      const name = `${base}${suffix}`;
      if (checkNameAndClaimIfAvailable(name)) {
        return name;
      }
    }

    // Worst case, suffix the base name with a unique number until
    // we find an available name.
    let name = null;
    let counter = 1;
    do {
      name = `${base}_${counter++}`;
    } while (!checkNameAndClaimIfAvailable(name));

    return name;
  }
}
