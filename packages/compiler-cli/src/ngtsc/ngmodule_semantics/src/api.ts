/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath} from '../../file_system';
import {ClassDeclaration} from '../../reflection';

/**
 * Resolves the declaration to its semantic symbol. If no semantic symbol is available then an
 * `UnresolvedSymbol` that represents `decl` is returned.
 */
export type SymbolResolver = (decl: ClassDeclaration) => SemanticSymbol;

/**
 * The various ways in which a change may affect the compilation.
 */
export enum Affects {
  None = 0,

  /**
   * The change affects the scope of an NgModule, i.e. the public aspects of a declaration has
   * changed. Alternatively, the NgModule specification itself could have changed.
   *
   * In this mode, those NgModules that import from an NgModule marked with this flag are not
   * affected. That requires that `ModuleExports` is also used.
   */
  ModuleScope = 1 << 0,

  /**
   * The change affects the export scope of an NgModule.
   *
   * The scope of an NgModule marked with this flag is not itself affected, only the scope of
   * importing NgModules is affected.
   */
  ModuleExports = 1 << 1,

  /**
   * The remote scoping feature of a component was affected; it could either have been activated,
   * or deactivated.
   */
  RemoteScope = 1 << 2,

  /**
   * All aspects have changed. This is also used when symbol information from a prior compilation is
   * missing, in which case it is assumed that all aspects are affected.
   */
  All = ModuleScope | ModuleExports | RemoteScope,
}

export enum InvalidationFlags {
  Emit = 1 << 0,
  TypeCheck = 1 << 1,
}

/**
 * Represents a symbol that is recognizable across incremental rebuilds, which enables the captured
 * metadata to be compared to the prior compilation. This allows for semantic understanding of
 * the changes that have been made in a rebuild, which potentially enables more reuse of work
 * from the prior compilation.
 */
export abstract class SemanticSymbol {
  constructor(
      /**
       * The path at which this symbol is located.
       */
      public readonly path: AbsoluteFsPath,

      /**
       * The declaration for this symbol.
       */
      public readonly decl: ClassDeclaration,

      /**
       * The identifier of this symbol, or null if no identifier could be determined. It should
       * uniquely identify the symbol relative to `file`. This is typically just the name of a
       * top-level class declaration, as that uniquely identifies the class within the file.
       *
       * If the identifier is null, then this symbol cannot be recognized across rebuilds. In that
       * case, the symbol is always assumed to have semantically changed to guarantee a proper
       * rebuild.
       */
      public readonly identifier: string|null) {}

  /**
   * Allows the symbol to connect itself to other symbols. This is called for all registered
   * symbols, before the symbol is compared against its previous symbol in `diff`.
   *
   * @param resolve A function to obtain the symbol for a declaration.
   * @param remoteScoped The set of directive symbols which required remote scoping.
   */
  connect?(resolve: SymbolResolver, remoteScoped: ReadonlySet<SemanticSymbol>): void;

  /**
   * Allows the symbol to be compared to the symbol that had the same identifier in the previous
   * compilation. The return value indicates how the changes affect the current compilation.
   *
   * Note: `previousSymbol` is obtained from the most recently succeeded compilation. Symbols of
   * failed compilations are never provided.
   *
   * @param previousSymbol The symbol from a prior compilation.
   */
  abstract diff(previousSymbol: SemanticSymbol): Affects;

  /**
   * After all symbols have determined how they affect this compilation, this method is called for
   * those symbols that reported they did affect this compilation. The symbol is responsible for
   * distributing this across the symbol graph as was established during `connect`.
   *
   * @param affected The symbol that is considered to affect the rebuild according to the flags in
   * `affects`.
   * @param affects Indicates what is considered affected.
   * @param context Exposes ways to trigger distribution to other symbols, as well as registering
   * symbols as affected.
   */
  abstract distribute(affected: SemanticSymbol, affects: Affects, context: DistributionContext):
      void;
}

export interface DistributionContext {
  /**
   * Invalidates the provided symbol according to the specified invalidation flags.
   */
  invalidate(symbol: SemanticSymbol, flags: InvalidationFlags): void;

  /**
   * Continues the distribution process into another symbol. `affected` is the symbol that is
   * considered responsible for why the build is affected, whereas `target` is the symbol that
   * needs to be aware of this change to potentially mark more areas of the symbol graph as
   * affected.
   */
  distributeTo(target: SemanticSymbol, affected: SemanticSymbol, affects: Affects): void;
}
