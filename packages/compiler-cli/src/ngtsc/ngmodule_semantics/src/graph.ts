/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {absoluteFromSourceFile, AbsoluteFsPath} from '../../file_system';
import {DirectiveMeta, NgModuleMeta, PipeMeta} from '../../metadata';
import {ClassDeclaration} from '../../reflection';
import {getSourceFile} from '../../util/src/typescript';

import {Affects, DistributionContext, InvalidationFlags, SemanticSymbol, SymbolResolver} from './api';
import {DirectiveSymbol, NgModuleSymbol, PipeSymbol} from './symbols';

export interface InvalidatedFile {
  /**
   * The path of the file that should be invalidated.
   */
  path: AbsoluteFsPath;

  /**
   * The way in which the file should be invalidated.
   */
  flags: InvalidationFlags;
}

export interface SemanticDependencyResult {
  /**
   * The files that need to be re-emitted.
   */
  needsEmit: AbsoluteFsPath[];

  /**
   * The files for which type-check code should be regenerated.
   */
  needsTypeCheck: AbsoluteFsPath[];

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
class UnresolvedSymbol extends SemanticSymbol {
  diff(): never {
    throw new Error('Invalid state: unresolved symbols should not be diffed');
  }

  distribute(): void {}
}

/**
 * The semantic dependency graph of a single compilation.
 */
export class SemanticDepGraph {
  readonly files = new Map<AbsoluteFsPath, Map<string, SemanticSymbol>>();
  readonly symbolByDecl = new Map<ClassDeclaration, SemanticSymbol>();

  registerSymbol(
      decl: ClassDeclaration,
      factory: (path: AbsoluteFsPath, decl: ClassDeclaration, identifier: string|null) =>
          SemanticSymbol): void {
    const path = absoluteFromSourceFile(getSourceFile(decl));
    const identifier = getSymbolIdentifier(decl);

    const symbol = factory(path, decl, identifier);
    this.symbolByDecl.set(decl, symbol);

    if (symbol.identifier !== null) {
      // If the symbol has a unique identifier, record it in the file that declares it.
      if (!this.files.has(path)) {
        this.files.set(path, new Map<string, SemanticSymbol>());
      }
      this.files.get(path)!.set(symbol.identifier, symbol);
    }
  }

  /**
   * Attempts to find the symbol by its identifier.
   */
  getSymbolByName(path: AbsoluteFsPath, identifier: string): SemanticSymbol|null {
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

function getSymbolIdentifier(decl: ClassDeclaration): string|null {
  if (!ts.isSourceFile(decl.parent)) {
    return null;
  }

  // If this is a top-level class declaration, the class name is used as unique identifier.
  // Other scenarios are currently not supported and causes the symbol not to be identified
  // across rebuilds, unless the declaration node has not changed.
  return decl.name.text;
}

/**
 * Implements the logic to go from a previous dependency graph to a new one, along with information
 * on which files have been affected.
 */
export class SemanticDepGraphUpdater {
  private readonly newGraph = new SemanticDepGraph();
  private readonly unresolvedSymbols = new Map<ClassDeclaration, UnresolvedSymbol>();

  constructor(
      /**
       * The semantic dependency graph of the most recently succeeded compilation, or null if this
       * is the initial build.
       */
      private priorGraph: SemanticDepGraph|null) {}

  addNgModule(metadata: NgModuleMeta): void {
    this.newGraph.registerSymbol(metadata.ref.node, (path, decl, identifier) => {
      return new NgModuleSymbol(
          path, decl, identifier, metadata.declarations.map(ref => ref.node),
          metadata.imports.map(ref => ref.node), metadata.exports.map(ref => ref.node));
    });
  }

  addDirective(metadata: DirectiveMeta): void {
    this.newGraph.registerSymbol(metadata.ref.node, (path, decl, identifier) => {
      return new DirectiveSymbol(
          path, decl, identifier, metadata.isComponent, metadata.selector,
          metadata.inputs.propertyNames, metadata.outputs.propertyNames, metadata.exportAs);
    });
  }

  addPipe(metadata: PipeMeta): void {
    this.newGraph.registerSymbol(metadata.ref.node, (path, decl, identifier) => {
      return new PipeSymbol(path, decl, identifier, metadata.name);
    });
  }

  /**
   * Takes all facts that have been gathered to create a new semantic dependency graph. In this
   * process, the semantic impact of the changes is determined which results in a set of files that
   * need to be emitted and/or type-checked.
   *
   * @param remoteScopes The component declarations for which remote scoping was active.
   */
  finalize(remoteScopes: ReadonlySet<ClassDeclaration>): SemanticDependencyResult {
    this.connect(remoteScopes);

    if (this.priorGraph === null) {
      // If no prior dependency graph is available then this was the initial build, in which case
      // we don't need to determine the semantic impact as everything is already considered
      // logically changed.
      return {
        needsEmit: [], needsTypeCheck: [], newGraph: this.newGraph,
      }
    }

    const invalidatedFiles = this.determineInvalidatedFiles(this.priorGraph);

    const needsEmit: AbsoluteFsPath[] = [];
    const needsTypeCheck: AbsoluteFsPath[] = [];

    for (const [path, flags] of invalidatedFiles) {
      if (flags & InvalidationFlags.Emit) {
        needsEmit.push(path);
      }
      if (flags & InvalidationFlags.TypeCheck) {
        needsTypeCheck.push(path);
      }
    }

    return {
      needsEmit,
      needsTypeCheck,
      newGraph: this.newGraph,
    };
  }

  /**
   * Implements the first phase of the semantic invalidation algorithm by connecting all symbols
   * together.
   */
  private connect(remoteScopes: ReadonlySet<ClassDeclaration>): void {
    // Translate the remotely scoped class declarations into their semantic symbol.
    const remoteScoped = new Set<DirectiveSymbol>();
    for (const classDecl of remoteScopes) {
      const directive = this.newGraph.getSymbolByDecl(classDecl);
      if (directive instanceof DirectiveSymbol) {
        remoteScoped.add(directive);
      }
    }

    const symbolResolver: SymbolResolver = decl => {
      const symbol = this.newGraph.getSymbolByDecl(decl);
      if (symbol === null) {
        // If a symbol could not be resolved, fallback on an unresolved symbol. This enables proper
        // comparison of such symbols across rebuilds.
        return this.getUnresolvedSymbol(decl);
      }
      return symbol;
    };

    for (const symbol of this.newGraph.symbolByDecl.values()) {
      if (symbol.connect === undefined) {
        continue;
      }

      symbol.connect(symbolResolver, remoteScoped);
    }
  }

  private determineInvalidatedFiles(priorGraph: SemanticDepGraph):
      Map<AbsoluteFsPath, InvalidationFlags> {
    const affectedSymbols: {symbol: SemanticSymbol; affects: Affects}[] = [];

    // In the second phase we diff each symbol against the symbol from a prior compilation.
    for (const symbol of this.newGraph.symbolByDecl.values()) {
      // First lookup the symbol by its declaration. It is typical for the declaration to not have
      // changed across rebuilds, so this is likely to find the symbol. Using the declaration also
      // allows to diff symbols for which no unique identifier could be determined.
      let previousSymbol = priorGraph.getSymbolByDecl(symbol.decl);
      if (previousSymbol === null) {
        // The declaration could not be resolved to a symbol in a prior compilation, which may
        // happen because the file containing the declaration has changed. In that case we want to
        // lookup the symbol based on its unique identifier, as that allows us to still compare the
        // changed declaration to the prior compilation.

        if (symbol.identifier === null) {
          // If, however, the symbol does not have a unique identifier then we are unable to
          // find it in the prior compilation, so we must assume it has fully changed.
          affectedSymbols.push({symbol, affects: Affects.All});
          continue;
        }

        previousSymbol = priorGraph.getSymbolByName(symbol.path, symbol.identifier);
        if (previousSymbol === null) {
          // If we were unable to locate the symbol in the prior compilation based on its
          // identifier, then we must also assume that it has fully changed.
          affectedSymbols.push({symbol, affects: Affects.All});
          continue;
        }
      }

      // Now that we have found the symbol from a prior compilation, we compute the semantic
      // difference to find out how the changes, if any, affect the compilation.
      const affects = symbol.diff(previousSymbol);
      if (affects !== Affects.None) {
        affectedSymbols.push({symbol, affects});
      }
    }

    // The last phase of the semantic diffing algorithm is to distribute the facts that have been
    // gathered for the affected symbols across the graph, potentially invalidating more areas of
    // the graph depending on the recorded facts.
    const context = new DistributionContextImpl();
    for (const {symbol, affects} of affectedSymbols) {
      if (affects & Affects.ModuleScope | Affects.ModuleExports) {
        context.invalidate(symbol, InvalidationFlags.Emit | InvalidationFlags.TypeCheck);
      }
      if (affects & Affects.RemoteScope) {
        context.invalidate(symbol, InvalidationFlags.Emit);
      }

      // Start the distribution for symbol by targeting itself.
      context.distributeTo(symbol, symbol, affects);
    }

    return context.invalidatedFiles;
  }

  /**
   * Gets or creates an `UnresolvedSymbol` for the provided class declaration.
   */
  private getUnresolvedSymbol(decl: ClassDeclaration): UnresolvedSymbol {
    if (this.unresolvedSymbols.has(decl)) {
      return this.unresolvedSymbols.get(decl)!;
    }

    const path = absoluteFromSourceFile(getSourceFile(decl));
    const identifier = getSymbolIdentifier(decl);
    const symbol = new UnresolvedSymbol(path, decl, identifier);
    this.unresolvedSymbols.set(decl, symbol);
    return symbol;
  }
}

class DistributionContextImpl implements DistributionContext {
  readonly invalidatedFiles = new Map<AbsoluteFsPath, InvalidationFlags>();
  private readonly visited = new Map<SemanticSymbol, Map<SemanticSymbol, Affects>>();

  invalidate(symbol: SemanticSymbol, flags: InvalidationFlags): void {
    const path = symbol.path;
    if (!this.invalidatedFiles.has(path)) {
      this.invalidatedFiles.set(path, flags);
    } else {
      this.invalidatedFiles.set(path, flags | this.invalidatedFiles.get(path)!);
    }
  }

  distributeTo(target: SemanticSymbol, affected: SemanticSymbol, affects: Affects): void {
    if (!this.visited.has(affected)) {
      this.visited.set(affected, new Map<SemanticSymbol, Affects>());
    }
    const visited = this.visited.get(affected)!;

    if (visited.has(target)) {
      // The symbol to distribute to has already been visited, but it may not have seen the impact
      // as indicated by `affects` that is currently being distributed. As such, we can only skip
      // the distribution process if the symbol has already been made aware of the flags that are
      // currently being distributed.
      const seenAffects = visited.get(target)!;
      if (seenAffects & affects) {
        // The symbol has already seen this impact so we don't have continue the distribution
        // process.
        return;
      }
      visited.set(target, affects | seenAffects);
    } else {
      visited.set(target, affects);
    }

    target.distribute(affected, affects, this);
  }
}
