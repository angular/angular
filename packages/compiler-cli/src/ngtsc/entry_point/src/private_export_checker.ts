/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {ErrorCode, ngErrorCode} from '../../diagnostics';
import {DeclarationNode} from '../../reflection';

import {ReferenceGraph} from './reference_graph';

/**
 * Produce `ts.Diagnostic`s for classes that are visible from exported types (e.g. directives
 * exposed by exported `NgModule`s) that are not themselves exported.
 *
 * This function reconciles two concepts:
 *
 * A class is Exported if it's exported from the main library `entryPoint` file.
 * A class is Visible if, via Angular semantics, a downstream consumer can import an Exported class
 * and be affected by the class in question. For example, an Exported NgModule may expose a
 * directive class to its consumers. Consumers that import the NgModule may have the directive
 * applied to elements in their templates. In this case, the directive is considered Visible.
 *
 * `checkForPrivateExports` attempts to verify that all Visible classes are Exported, and report
 * `ts.Diagnostic`s for those that aren't.
 *
 * @param entryPoint `ts.SourceFile` of the library's entrypoint, which should export the library's
 * public API.
 * @param checker `ts.TypeChecker` for the current program.
 * @param refGraph `ReferenceGraph` tracking the visibility of Angular types.
 * @returns an array of `ts.Diagnostic`s representing errors when visible classes are not exported
 * properly.
 */
export function checkForPrivateExports(
    entryPoint: ts.SourceFile, checker: ts.TypeChecker, refGraph: ReferenceGraph): ts.Diagnostic[] {
  const diagnostics: ts.Diagnostic[] = [];

  // Firstly, compute the exports of the entry point. These are all the Exported classes.
  const topLevelExports = new Set<DeclarationNode>();

  // Do this via `ts.TypeChecker.getExportsOfModule`.
  const moduleSymbol = checker.getSymbolAtLocation(entryPoint);
  if (moduleSymbol === undefined) {
    throw new Error(`Internal error: failed to get symbol for entrypoint`);
  }
  const exportedSymbols = checker.getExportsOfModule(moduleSymbol);

  // Loop through the exported symbols, de-alias if needed, and add them to `topLevelExports`.
  // TODO(alxhub): use proper iteration when build.sh is removed. (#27762)
  exportedSymbols.forEach(symbol => {
    if (symbol.flags & ts.SymbolFlags.Alias) {
      symbol = checker.getAliasedSymbol(symbol);
    }
    const decl = symbol.valueDeclaration;
    if (decl !== undefined) {
      topLevelExports.add(decl);
    }
  });

  // Next, go through each exported class and expand it to the set of classes it makes Visible,
  // using the `ReferenceGraph`. For each Visible class, verify that it's also Exported, and queue
  // an error if it isn't. `checkedSet` ensures only one error is queued per class.
  const checkedSet = new Set<DeclarationNode>();

  // Loop through each Exported class.
  // TODO(alxhub): use proper iteration when the legacy build is removed. (#27762)
  topLevelExports.forEach(mainExport => {
    // Loop through each class made Visible by the Exported class.
    refGraph.transitiveReferencesOf(mainExport).forEach(transitiveReference => {
      // Skip classes which have already been checked.
      if (checkedSet.has(transitiveReference)) {
        return;
      }
      checkedSet.add(transitiveReference);

      // Verify that the Visible class is also Exported.
      if (!topLevelExports.has(transitiveReference)) {
        // This is an error, `mainExport` makes `transitiveReference` Visible, but
        // `transitiveReference` is not Exported from the entrypoint. Construct a diagnostic to
        // give to the user explaining the situation.

        const descriptor = getDescriptorOfDeclaration(transitiveReference);
        const name = getNameOfDeclaration(transitiveReference);

        // Construct the path of visibility, from `mainExport` to `transitiveReference`.
        let visibleVia = 'NgModule exports';
        const transitivePath = refGraph.pathFrom(mainExport, transitiveReference);
        if (transitivePath !== null) {
          visibleVia = transitivePath.map(seg => getNameOfDeclaration(seg)).join(' -> ');
        }

        const diagnostic: ts.Diagnostic = {
          category: ts.DiagnosticCategory.Error,
          code: ngErrorCode(ErrorCode.SYMBOL_NOT_EXPORTED),
          file: transitiveReference.getSourceFile(),
          ...getPosOfDeclaration(transitiveReference),
          messageText: `Unsupported private ${descriptor} ${name}. This ${
              descriptor} is visible to consumers via ${
              visibleVia}, but is not exported from the top-level library entrypoint.`,
        };

        diagnostics.push(diagnostic);
      }
    });
  });

  return diagnostics;
}

function getPosOfDeclaration(decl: DeclarationNode): {start: number, length: number} {
  const node: ts.Node = getIdentifierOfDeclaration(decl) || decl;
  return {
    start: node.getStart(),
    length: node.getEnd() + 1 - node.getStart(),
  };
}

function getIdentifierOfDeclaration(decl: DeclarationNode): ts.Identifier|null {
  if ((ts.isClassDeclaration(decl) || ts.isVariableDeclaration(decl) ||
       ts.isFunctionDeclaration(decl)) &&
      decl.name !== undefined && ts.isIdentifier(decl.name)) {
    return decl.name;
  } else {
    return null;
  }
}

function getNameOfDeclaration(decl: DeclarationNode): string {
  const id = getIdentifierOfDeclaration(decl);
  return id !== null ? id.text : '(unnamed)';
}

function getDescriptorOfDeclaration(decl: DeclarationNode): string {
  switch (decl.kind) {
    case ts.SyntaxKind.ClassDeclaration:
      return 'class';
    case ts.SyntaxKind.FunctionDeclaration:
      return 'function';
    case ts.SyntaxKind.VariableDeclaration:
      return 'variable';
    case ts.SyntaxKind.EnumDeclaration:
      return 'enum';
    default:
      return 'declaration';
  }
}
