/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isArrayEqual, isReferenceEqual, SemanticReference, SemanticSymbol} from '../../../incremental/semantic_graph';
import {DirectiveSymbol} from '../../directive';

/**
 * Represents an Angular component.
 */
export class ComponentSymbol extends DirectiveSymbol {
  usedDirectives: SemanticReference[] = [];
  usedPipes: SemanticReference[] = [];
  isRemotelyScoped = false;

  override isEmitAffected(previousSymbol: SemanticSymbol, publicApiAffected: Set<SemanticSymbol>):
      boolean {
    if (!(previousSymbol instanceof ComponentSymbol)) {
      return true;
    }

    // Create an equality function that considers symbols equal if they represent the same
    // declaration, but only if the symbol in the current compilation does not have its public API
    // affected.
    const isSymbolUnaffected = (current: SemanticReference, previous: SemanticReference) =>
        isReferenceEqual(current, previous) && !publicApiAffected.has(current.symbol);

    // The emit of a component is affected if either of the following is true:
    //  1. The component used to be remotely scoped but no longer is, or vice versa.
    //  2. The list of used directives has changed or any of those directives have had their public
    //     API changed. If the used directives have been reordered but not otherwise affected then
    //     the component must still be re-emitted, as this may affect directive instantiation order.
    //  3. The list of used pipes has changed, or any of those pipes have had their public API
    //     changed.
    return this.isRemotelyScoped !== previousSymbol.isRemotelyScoped ||
        !isArrayEqual(this.usedDirectives, previousSymbol.usedDirectives, isSymbolUnaffected) ||
        !isArrayEqual(this.usedPipes, previousSymbol.usedPipes, isSymbolUnaffected);
  }

  override isTypeCheckBlockAffected(
      previousSymbol: SemanticSymbol, typeCheckApiAffected: Set<SemanticSymbol>): boolean {
    if (!(previousSymbol instanceof ComponentSymbol)) {
      return true;
    }

    // To verify that a used directive is not affected we need to verify that its full inheritance
    // chain is not present in `typeCheckApiAffected`.
    const isInheritanceChainAffected = (symbol: SemanticSymbol): boolean => {
      let currentSymbol: SemanticSymbol|null = symbol;
      while (currentSymbol instanceof DirectiveSymbol) {
        if (typeCheckApiAffected.has(currentSymbol)) {
          return true;
        }
        currentSymbol = currentSymbol.baseClass;
      }

      return false;
    };

    // Create an equality function that considers directives equal if they represent the same
    // declaration and if the symbol and all symbols it inherits from in the current compilation
    // do not have their type-check API affected.
    const isDirectiveUnaffected = (current: SemanticReference, previous: SemanticReference) =>
        isReferenceEqual(current, previous) && !isInheritanceChainAffected(current.symbol);

    // Create an equality function that considers pipes equal if they represent the same
    // declaration and if the symbol in the current compilation does not have its type-check
    // API affected.
    const isPipeUnaffected = (current: SemanticReference, previous: SemanticReference) =>
        isReferenceEqual(current, previous) && !typeCheckApiAffected.has(current.symbol);

    // The emit of a type-check block of a component is affected if either of the following is true:
    //  1. The list of used directives has changed or any of those directives have had their
    //     type-check API changed.
    //  2. The list of used pipes has changed, or any of those pipes have had their type-check API
    //     changed.
    return !isArrayEqual(
               this.usedDirectives, previousSymbol.usedDirectives, isDirectiveUnaffected) ||
        !isArrayEqual(this.usedPipes, previousSymbol.usedPipes, isPipeUnaffected);
  }
}
