/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Expression, ExternalExpr} from '@angular/compiler';
import {AbsoluteFsPath} from '../../../file_system';
import {ClassDeclaration} from '../../../reflection';
import {SemanticReference, SemanticSymbol} from './api';

export interface SemanticDependencyResult {
  /**
   * The files that need to be re-emitted.
   */
  needsEmit: Set<AbsoluteFsPath>;

  /**
   * The files for which the type-check block should be regenerated.
   */
  needsTypeCheckEmit: Set<AbsoluteFsPath>;

  /**
   * The newly built graph that represents the current compilation.
   */
  newGraph: SemanticDepGraph;
}

/**
 * Represents a declaration for which no semantic symbol has been registered. For example,
 * declarations from external dependencies have not been explicitly registered and are represented
 * by this symbol. This allows the unresolved symbol to still be compared to a symbol from a prior
 * compilation.
 */
class OpaqueSymbol extends SemanticSymbol {
  override isPublicApiAffected(): false {
    return false;
  }

  override isTypeCheckApiAffected(): false {
    return false;
  }
}

/**
 * The semantic dependency graph of a single compilation.
 */
export class SemanticDepGraph {
  readonly files = new Map<AbsoluteFsPath, Map<string, SemanticSymbol>>();
  readonly symbolByDecl = new Map<ClassDeclaration, SemanticSymbol>();

  /**
   * Registers a symbol in the graph. The symbol is given a unique identifier if possible, such that
   * its equivalent symbol can be obtained from a prior graph even if its declaration node has
   * changed across rebuilds. Symbols without an identifier are only able to find themselves in a
   * prior graph if their declaration node is identical.
   */
  registerSymbol(symbol: SemanticSymbol): void {
    this.symbolByDecl.set(symbol.decl, symbol);

    if (symbol.identifier !== null) {
      // If the symbol has a unique identifier, record it in the file that declares it. This enables
      // the symbol to be requested by its unique name.
      if (!this.files.has(symbol.path)) {
        this.files.set(symbol.path, new Map<string, SemanticSymbol>());
      }
      this.files.get(symbol.path)!.set(symbol.identifier, symbol);
    }
  }

  /**
   * Attempts to resolve a symbol in this graph that represents the given symbol from another graph.
   * If no matching symbol could be found, null is returned.
   *
   * @param symbol The symbol from another graph for which its equivalent in this graph should be
   * found.
   */
  getEquivalentSymbol(symbol: SemanticSymbol): SemanticSymbol|null {
    // First lookup the symbol by its declaration. It is typical for the declaration to not have
    // changed across rebuilds, so this is likely to find the symbol. Using the declaration also
    // allows to diff symbols for which no unique identifier could be determined.
    let previousSymbol = this.getSymbolByDecl(symbol.decl);
    if (previousSymbol === null && symbol.identifier !== null) {
      // The declaration could not be resolved to a symbol in a prior compilation, which may
      // happen because the file containing the declaration has changed. In that case we want to
      // lookup the symbol based on its unique identifier, as that allows us to still compare the
      // changed declaration to the prior compilation.
      previousSymbol = this.getSymbolByName(symbol.path, symbol.identifier);
    }

    return previousSymbol;
  }

  /**
   * Attempts to find the symbol by its identifier.
   */
  private getSymbolByName(path: AbsoluteFsPath, identifier: string): SemanticSymbol|null {
    if (!this.files.has(path)) {
      return null;
    }
    const file = this.files.get(path)!;
    if (!file.has(identifier)) {
      return null;
    }
    return file.get(identifier)!;
  }

  /**
   * Attempts to resolve the declaration to its semantic symbol.
   */
  getSymbolByDecl(decl: ClassDeclaration): SemanticSymbol|null {
    if (!this.symbolByDecl.has(decl)) {
      return null;
    }
    return this.symbolByDecl.get(decl)!;
  }
}

/**
 * Implements the logic to go from a previous dependency graph to a new one, along with information
 * on which files have been affected.
 */
export class SemanticDepGraphUpdater {
  private readonly newGraph = new SemanticDepGraph();

  /**
   * Contains opaque symbols that were created for declarations for which there was no symbol
   * registered, which happens for e.g. external declarations.
   */
  private readonly opaqueSymbols = new Map<ClassDeclaration, OpaqueSymbol>();

  constructor(
      /**
       * The semantic dependency graph of the most recently succeeded compilation, or null if this
       * is the initial build.
       */
      private priorGraph: SemanticDepGraph|null) {}

  /**
   * Registers the symbol in the new graph that is being created.
   */
  registerSymbol(symbol: SemanticSymbol): void {
    this.newGraph.registerSymbol(symbol);
  }

  /**
   * Takes all facts that have been gathered to create a new semantic dependency graph. In this
   * process, the semantic impact of the changes is determined which results in a set of files that
   * need to be emitted and/or type-checked.
   */
  finalize(): SemanticDependencyResult {
    if (this.priorGraph === null) {
      // If no prior dependency graph is available then this was the initial build, in which case
      // we don't need to determine the semantic impact as everything is already considered
      // logically changed.
      return {
        needsEmit: new Set<AbsoluteFsPath>(),
        needsTypeCheckEmit: new Set<AbsoluteFsPath>(),
        newGraph: this.newGraph,
      };
    }

    const needsEmit = this.determineInvalidatedFiles(this.priorGraph);
    const needsTypeCheckEmit = this.determineInvalidatedTypeCheckFiles(this.priorGraph);
    return {
      needsEmit,
      needsTypeCheckEmit,
      newGraph: this.newGraph,
    };
  }

  private determineInvalidatedFiles(priorGraph: SemanticDepGraph): Set<AbsoluteFsPath> {
    const isPublicApiAffected = new Set<SemanticSymbol>();

    // The first phase is to collect all symbols which have their public API affected. Any symbols
    // that cannot be matched up with a symbol from the prior graph are considered affected.
    for (const symbol of this.newGraph.symbolByDecl.values()) {
      const previousSymbol = priorGraph.getEquivalentSymbol(symbol);
      if (previousSymbol === null || symbol.isPublicApiAffected(previousSymbol)) {
        isPublicApiAffected.add(symbol);
      }
    }

    // The second phase is to find all symbols for which the emit result is affected, either because
    // their used declarations have changed or any of those used declarations has had its public API
    // affected as determined in the first phase.
    const needsEmit = new Set<AbsoluteFsPath>();
    for (const symbol of this.newGraph.symbolByDecl.values()) {
      if (symbol.isEmitAffected === undefined) {
        continue;
      }

      const previousSymbol = priorGraph.getEquivalentSymbol(symbol);
      if (previousSymbol === null || symbol.isEmitAffected(previousSymbol, isPublicApiAffected)) {
        needsEmit.add(symbol.path);
      }
    }

    return needsEmit;
  }

  private determineInvalidatedTypeCheckFiles(priorGraph: SemanticDepGraph): Set<AbsoluteFsPath> {
    const isTypeCheckApiAffected = new Set<SemanticSymbol>();

    // The first phase is to collect all symbols which have their public API affected. Any symbols
    // that cannot be matched up with a symbol from the prior graph are considered affected.
    for (const symbol of this.newGraph.symbolByDecl.values()) {
      const previousSymbol = priorGraph.getEquivalentSymbol(symbol);
      if (previousSymbol === null || symbol.isTypeCheckApiAffected(previousSymbol)) {
        isTypeCheckApiAffected.add(symbol);
      }
    }

    // The second phase is to find all symbols for which the emit result is affected, either because
    // their used declarations have changed or any of those used declarations has had its public API
    // affected as determined in the first phase.
    const needsTypeCheckEmit = new Set<AbsoluteFsPath>();
    for (const symbol of this.newGraph.symbolByDecl.values()) {
      if (symbol.isTypeCheckBlockAffected === undefined) {
        continue;
      }

      const previousSymbol = priorGraph.getEquivalentSymbol(symbol);
      if (previousSymbol === null ||
          symbol.isTypeCheckBlockAffected(previousSymbol, isTypeCheckApiAffected)) {
        needsTypeCheckEmit.add(symbol.path);
      }
    }

    return needsTypeCheckEmit;
  }

  /**
   * Creates a `SemanticReference` for the reference to `decl` using the expression `expr`. See
   * the documentation of `SemanticReference` for details.
   */
  getSemanticReference(decl: ClassDeclaration, expr: Expression): SemanticReference {
    return {
      symbol: this.getSymbol(decl),
      importPath: getImportPath(expr),
    };
  }

  /**
   * Gets the `SemanticSymbol` that was registered for `decl` during the current compilation, or
   * returns an opaque symbol that represents `decl`.
   */
  getSymbol(decl: ClassDeclaration): SemanticSymbol {
    const symbol = this.newGraph.getSymbolByDecl(decl);
    if (symbol === null) {
      // No symbol has been recorded for the provided declaration, which would be the case if the
      // declaration is external. Return an opaque symbol in that case, to allow the external
      // declaration to be compared to a prior compilation.
      return this.getOpaqueSymbol(decl);
    }
    return symbol;
  }

  /**
   * Gets or creates an `OpaqueSymbol` for the provided class declaration.
   */
  private getOpaqueSymbol(decl: ClassDeclaration): OpaqueSymbol {
    if (this.opaqueSymbols.has(decl)) {
      return this.opaqueSymbols.get(decl)!;
    }

    const symbol = new OpaqueSymbol(decl);
    this.opaqueSymbols.set(decl, symbol);
    return symbol;
  }
}

function getImportPath(expr: Expression): string|null {
  if (expr instanceof ExternalExpr) {
    return `${expr.value.moduleName}\$${expr.value.name}`;
  } else {
    return null;
  }
}
