/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {ProgramInfo, projectFile} from '../../utils/tsurge';
import {
  ClassFieldDescriptor,
  ClassFieldUniqueKey,
} from '../signal-migration/src/passes/reference_resolution/known_fields';

/**
 * Attempts to get a class field descriptor if the given symbol
 * points to a class field.
 */
export function getClassFieldDescriptorForSymbol(
  symbol: ts.Symbol,
  info: ProgramInfo,
): ClassFieldDescriptor | null {
  if (
    symbol?.valueDeclaration === undefined ||
    !ts.isPropertyDeclaration(symbol.valueDeclaration)
  ) {
    return null;
  }
  const key = getUniqueIDForClassProperty(symbol.valueDeclaration, info);
  if (key === null) {
    return null;
  }
  return {
    key,
    node: symbol.valueDeclaration,
  };
}

/**
 * Gets a unique ID for the given class property.
 *
 * This is useful for matching class fields across compilation units.
 * E.g. a reference may point to the field via `.d.ts`, while the other
 * may reference it via actual `.ts` sources. IDs for the same fields
 * would then match identity.
 */
export function getUniqueIDForClassProperty(
  property: ts.ClassElement,
  info: ProgramInfo,
): ClassFieldUniqueKey | null {
  if (!ts.isClassDeclaration(property.parent) || property.parent.name === undefined) {
    return null;
  }
  if (property.name === undefined) {
    return null;
  }
  const id = projectFile(property.getSourceFile(), info).id.replace(/\.d\.ts$/, '.ts');

  // Note: If a class is nested, there could be an ID clash.
  // This is highly unlikely though, and this is not a problem because
  // in such cases, there is even less chance there are any references to
  // a non-exported classes; in which case, cross-compilation unit references
  // likely can't exist anyway.

  return `${id}-${property.parent.name.text}-${property.name.getText()}` as ClassFieldUniqueKey;
}
