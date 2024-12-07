/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import ts from 'typescript';

import {absoluteFromSourceFile, AbsoluteFsPath} from '../../../file_system';
import {ClassDeclaration} from '../../../reflection';

/**
 * Represents a symbol that is recognizable across incremental rebuilds, which enables the captured
 * metadata to be compared to the prior compilation. This allows for semantic understanding of
 * the changes that have been made in a rebuild, which potentially enables more reuse of work
 * from the prior compilation.
 */
export abstract class SemanticSymbol {
  /**
   * The path of the file that declares this symbol.
   */
  public readonly path: AbsoluteFsPath;

  /**
   * The identifier of this symbol, or null if no identifier could be determined. It should
   * uniquely identify the symbol relative to `file`. This is typically just the name of a
   * top-level class declaration, as that uniquely identifies the class within the file.
   *
   * If the identifier is null, then this symbol cannot be recognized across rebuilds. In that
   * case, the symbol is always assumed to have semantically changed to guarantee a proper
   * rebuild.
   */
  public readonly identifier: string | null;

  constructor(
    /**
     * The declaration for this symbol.
     */
    public readonly decl: ClassDeclaration,
  ) {
    this.path = absoluteFromSourceFile(decl.getSourceFile());
    this.identifier = getSymbolIdentifier(decl);
  }

  /**
   * Allows the symbol to be compared to the equivalent symbol in the previous compilation. The
   * return value indicates whether the symbol has been changed in a way such that its public API
   * is affected.
   *
   * This method determines whether a change to _this_ symbol require the symbols that
   * use to this symbol to be re-emitted.
   *
   * Note: `previousSymbol` is obtained from the most recently succeeded compilation. Symbols of
   * failed compilations are never provided.
   *
   * @param previousSymbol The symbol from a prior compilation.
   */
  abstract isPublicApiAffected(previousSymbol: SemanticSymbol): boolean;

  /**
   * Allows the symbol to determine whether its emit is affected. The equivalent symbol from a prior
   * build is given, in addition to the set of symbols of which the public API has changed.
   *
   * This method determines whether a change to _other_ symbols, i.e. those present in
   * `publicApiAffected`, should cause _this_ symbol to be re-emitted.
   *
   * @param previousSymbol The equivalent symbol from a prior compilation. Note that it may be a
   * different type of symbol, if e.g. a Component was changed into a Directive with the same name.
   * @param publicApiAffected The set of symbols of which the public API has changed.
   */
  isEmitAffected?(previousSymbol: SemanticSymbol, publicApiAffected: Set<SemanticSymbol>): boolean;

  /**
   * Similar to `isPublicApiAffected`, but here equivalent symbol from a prior compilation needs
   * to be compared to see if the type-check block of components that use this symbol is affected.
   *
   * This method determines whether a change to _this_ symbol require the symbols that
   * use to this symbol to have their type-check block regenerated.
   *
   * Note: `previousSymbol` is obtained from the most recently succeeded compilation. Symbols of
   * failed compilations are never provided.
   *
   * @param previousSymbol The symbol from a prior compilation.
   */
  abstract isTypeCheckApiAffected(previousSymbol: SemanticSymbol): boolean;

  /**
   * Similar to `isEmitAffected`, but focused on the type-check block of this symbol. This method
   * determines whether a change to _other_ symbols, i.e. those present in `typeCheckApiAffected`,
   * should cause _this_ symbol's type-check block to be regenerated.
   *
   * @param previousSymbol The equivalent symbol from a prior compilation. Note that it may be a
   * different type of symbol, if e.g. a Component was changed into a Directive with the same name.
   * @param typeCheckApiAffected The set of symbols of which the type-check API has changed.
   */
  isTypeCheckBlockAffected?(
    previousSymbol: SemanticSymbol,
    typeCheckApiAffected: Set<SemanticSymbol>,
  ): boolean;
}

/**
 * Represents a reference to a semantic symbol that has been emitted into a source file. The
 * reference may refer to the symbol using a different name than the semantic symbol's declared
 * name, e.g. in case a re-export under a different name was chosen by a reference emitter.
 * Consequently, to know that an emitted reference is still valid not only requires that the
 * semantic symbol is still valid, but also that the path by which the symbol is imported has not
 * changed.
 */
export interface SemanticReference {
  symbol: SemanticSymbol;

  /**
   * The path by which the symbol has been referenced.
   */
  importPath: string | null;
}

function getSymbolIdentifier(decl: ClassDeclaration): string | null {
  if (!ts.isSourceFile(decl.parent)) {
    return null;
  }

  // If this is a top-level class declaration, the class name is used as unique identifier.
  // Other scenarios are currently not supported and causes the symbol not to be identified
  // across rebuilds, unless the declaration node has not changed.
  return decl.name.text;
}
