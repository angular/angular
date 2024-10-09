/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {ClassFieldDescriptor, KnownFields} from '../passes/reference_resolution/known_fields';

/**
 * Recognizes `Partial<T>` instances in Catalyst tests. Those type queries
 * are likely used for typing property initialization values for the given class `T`
 * and we have a few scenarios:
 *
 *   1. The API does not unwrap signal inputs. In which case, the values are likely no
 *      longer assignable to an `InputSignal`.
 *   2. The API does unwrap signal inputs, in which case we need to unwrap the `Partial`
 *      because the values are raw initial values, like they were before.
 *
 * We can enable this heuristic when we detect Catalyst as we know it supports unwrapping.
 */
export class PartialDirectiveTypeInCatalystTests<D extends ClassFieldDescriptor> {
  constructor(
    private checker: ts.TypeChecker,
    private knownFields: KnownFields<D>,
  ) {}

  detect(
    node: ts.Node,
  ): null | {referenceNode: ts.TypeReferenceNode; targetClass: ts.ClassDeclaration} {
    // Detect `Partial<...>`
    if (
      !ts.isTypeReferenceNode(node) ||
      !ts.isIdentifier(node.typeName) ||
      node.typeName.text !== 'Partial'
    ) {
      return null;
    }

    // Ignore if the source file doesn't reference Catalyst.
    if (!node.getSourceFile().text.includes('angular2/testing/catalyst')) {
      return null;
    }

    // Extract T of `Partial<T>`.
    const cmpTypeArg = node.typeArguments?.[0];
    if (
      !cmpTypeArg ||
      !ts.isTypeReferenceNode(cmpTypeArg) ||
      !ts.isIdentifier(cmpTypeArg.typeName)
    ) {
      return null;
    }
    const cmpType = cmpTypeArg.typeName;
    const symbol = this.checker.getSymbolAtLocation(cmpType);

    // Note: Technically the class might be derived of an input-containing class,
    // but this is out of scope for now. We can expand if we see it's a common case.
    if (
      symbol?.valueDeclaration === undefined ||
      !ts.isClassDeclaration(symbol.valueDeclaration) ||
      !this.knownFields.shouldTrackClassReference(symbol.valueDeclaration)
    ) {
      return null;
    }

    return {referenceNode: node, targetClass: symbol.valueDeclaration};
  }
}
