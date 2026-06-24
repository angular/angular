/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {ClassDeclaration} from '../../reflection';
import {getContainingImportDeclaration} from '../../reflection/src/typescript';

const AssumeEager = 'AssumeEager';
type AssumeEager = typeof AssumeEager;

/**
 * Maps imported symbol name to a set of locations where the symbols is used
 * in a source file.
 */
type SymbolMap = Map<string, Set<ts.Identifier> | AssumeEager>;

/**
 * Allows to register a symbol as deferrable and keep track of its usage.
 *
 * This information is later used to determine whether it's safe to drop
 * a regular import of this symbol (actually the entire import declaration)
 * in favor of using a dynamic import for cases when defer blocks are used.
 */
export class DeferredSymbolTracker {
  private readonly imports = new Map<ts.ImportDeclaration, SymbolMap>();

  /**
   * Map of a component class -> all import declarations that bring symbols
   * used within `@Component.deferredImports` field.
   */
  private readonly explicitlyDeferredImports = new Map<ClassDeclaration, ts.ImportDeclaration[]>();

  constructor(
    private readonly typeChecker: ts.TypeChecker,
    private onlyExplicitDeferDependencyImports: boolean,
  ) {}

  /**
   * Given an import declaration node, extract the names of all imported symbols
   * and return them as a map where each symbol is a key and `AssumeEager` is a value.
   *
   * The logic recognizes the following import shapes:
   *
   * Case 1: `import {a, b as B} from 'a'`
   * Case 2: `import X from 'a'`
   * Case 3: `import * as x from 'a'`
   */
  private extractImportedSymbols(importDecl: ts.ImportDeclaration): Map<string, AssumeEager> {
    const symbolMap = new Map<string, AssumeEager>();

    // Unsupported case: `import 'a'`
    if (importDecl.importClause === undefined) {
      throw new Error(`Provided import declaration doesn't have any symbols.`);
    }

    // If the entire import is a type-only import, none of the symbols can be eager.
    if (importDecl.importClause.isTypeOnly) {
      return symbolMap;
    }

    if (importDecl.importClause.namedBindings !== undefined) {
      const bindings = importDecl.importClause.namedBindings;
      if (ts.isNamedImports(bindings)) {
        // Case 1: `import {a, b as B} from 'a'`
        for (const element of bindings.elements) {
          if (!element.isTypeOnly) {
            symbolMap.set(element.name.text, AssumeEager);
          }
        }
      } else {
        // Case 2: `import X from 'a'`
        symbolMap.set(bindings.name.text, AssumeEager);
      }
    } else if (importDecl.importClause.name !== undefined) {
      // Case 2: `import * as x from 'a'`
      symbolMap.set(importDecl.importClause.name.text, AssumeEager);
    } else {
      throw new Error('Unrecognized import structure.');
    }
    return symbolMap;
  }

  /**
   * Retrieves a list of import declarations that contain symbols used within
   * `@Component.deferredImports` of a specific component class, but those imports
   * can not be removed, since there are other symbols imported alongside deferred
   * components.
   */
  getNonRemovableDeferredImports(
    sourceFile: ts.SourceFile,
    classDecl: ClassDeclaration,
  ): ts.ImportDeclaration[] {
    const affectedImports: ts.ImportDeclaration[] = [];
    const importDecls = this.explicitlyDeferredImports.get(classDecl) ?? [];
    for (const importDecl of importDecls) {
      if (importDecl.getSourceFile() === sourceFile && !this.canDefer(importDecl)) {
        affectedImports.push(importDecl);
      }
    }
    return affectedImports;
  }

  /**
   * Marks a given identifier and an associated import declaration as a candidate
   * for defer loading.
   */
  markAsDeferrableCandidate(
    identifier: ts.Identifier,
    importDecl: ts.ImportDeclaration,
    componentClassDecl: ClassDeclaration,
    isExplicitlyDeferred: boolean,
  ): void {
    if (this.onlyExplicitDeferDependencyImports && !isExplicitlyDeferred) {
      // Ignore deferrable candidates when only explicit deferred imports mode is enabled.
      // In that mode only dependencies from the `@Component.deferredImports` field are
      // defer-loadable.
      return;
    }

    if (isExplicitlyDeferred) {
      if (this.explicitlyDeferredImports.has(componentClassDecl)) {
        this.explicitlyDeferredImports.get(componentClassDecl)!.push(importDecl);
      } else {
        this.explicitlyDeferredImports.set(componentClassDecl, [importDecl]);
      }
    }

    let symbolMap = this.imports.get(importDecl);

    // Do we come across this import for the first time?
    if (!symbolMap) {
      symbolMap = this.extractImportedSymbols(importDecl);
      this.imports.set(importDecl, symbolMap);
    }

    if (!symbolMap.has(identifier.text)) {
      throw new Error(
        `The '${identifier.text}' identifier doesn't belong ` +
          `to the provided import declaration.`,
      );
    }

    if (symbolMap.get(identifier.text) === AssumeEager) {
      // We process this symbol for the first time, populate references.
      symbolMap.set(
        identifier.text,
        this.lookupIdentifiersInSourceFile(identifier.text, importDecl),
      );
    }

    const identifiers = symbolMap.get(identifier.text) as Set<ts.Identifier>;

    // Drop the current identifier, since we are trying to make it deferrable
    // (it's used as a dependency in one of the defer blocks).
    identifiers.delete(identifier);
  }

  /**
   * Whether all symbols from a given import declaration have no references
   * in a source file, thus it's safe to use dynamic imports.
   */
  canDefer(importDecl: ts.ImportDeclaration): boolean {
    if (!this.imports.has(importDecl)) {
      return false;
    }

    const symbolsMap = this.imports.get(importDecl)!;
    for (const refs of symbolsMap.values()) {
      if (refs === AssumeEager || refs.size > 0) {
        // There may be still eager references to this symbol.
        return false;
      }
    }

    return true;
  }

  /**
   * Returns a set of import declarations that is safe to remove
   * from the current source file and generate dynamic imports instead.
   */
  getDeferrableImportDecls(): Set<ts.ImportDeclaration> {
    const deferrableDecls = new Set<ts.ImportDeclaration>();
    for (const [importDecl] of this.imports) {
      if (this.canDefer(importDecl)) {
        deferrableDecls.add(importDecl);
      }
    }
    return deferrableDecls;
  }

  private lookupIdentifiersInSourceFile(
    name: string,
    importDecl: ts.ImportDeclaration,
  ): Set<ts.Identifier> {
    const results = new Set<ts.Identifier>();
    const visit = (node: ts.Node): void => {
      // Don't record references from the declaration itself or inside
      // type nodes which will be stripped from the JS output.
      if (node === importDecl || ts.isTypeNode(node)) {
        return;
      }

      if (ts.isIdentifier(node) && node.text === name) {
        // Is `node` actually a reference to this symbol?
        const sym = this.typeChecker.getSymbolAtLocation(node);
        if (sym === undefined) {
          return;
        }

        if (sym.declarations === undefined || sym.declarations.length === 0) {
          return;
        }
        const importClause = sym.declarations[0];
        // Is declaration from this import statement?
        const decl = getContainingImportDeclaration(importClause);
        if (decl !== importDecl) {
          return;
        }

        // `node` *is* a reference to the same import.
        results.add(node);
      }
      ts.forEachChild(node, visit);
    };

    visit(importDecl.getSourceFile());
    return results;
  }
}
