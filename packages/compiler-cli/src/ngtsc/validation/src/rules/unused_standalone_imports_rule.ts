/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {ErrorCode, makeDiagnostic} from '../../../diagnostics';
import type {ImportedSymbolsTracker, Reference} from '../../../imports';
import type {ClassDeclaration} from '../../../reflection';
import type {
  TemplateTypeChecker,
  TypeCheckableDirectiveMeta,
  TypeCheckingConfig,
} from '../../../typecheck/api';

import type {SourceFileValidatorRule} from './api';

/**
 * Rule that flags unused symbols inside of the `imports` array of a component.
 */
export class UnusedStandaloneImportsRule implements SourceFileValidatorRule {
  constructor(
    private templateTypeChecker: TemplateTypeChecker,
    private typeCheckingConfig: TypeCheckingConfig,
    private importedSymbolsTracker: ImportedSymbolsTracker,
  ) {}

  shouldCheck(sourceFile: ts.SourceFile): boolean {
    return (
      this.typeCheckingConfig.unusedStandaloneImports !== 'suppress' &&
      (this.importedSymbolsTracker.hasNamedImport(sourceFile, 'Component', '@angular/core') ||
        this.importedSymbolsTracker.hasNamespaceImport(sourceFile, '@angular/core'))
    );
  }

  checkNode(node: ts.Node): ts.Diagnostic | ts.Diagnostic[] | null {
    if (!ts.isClassDeclaration(node)) {
      return null;
    }

    const metadata = this.templateTypeChecker.getDirectiveMetadata(node);

    if (
      !metadata ||
      !metadata.isStandalone ||
      metadata.rawImports === null ||
      metadata.imports === null ||
      metadata.imports.length === 0
    ) {
      return null;
    }

    const usedDirectives = this.templateTypeChecker.getUsedDirectives(node);
    const usedPipes = this.templateTypeChecker.getUsedPipes(node);

    // These will be null if the component is invalid for some reason.
    if (!usedDirectives || !usedPipes) {
      return null;
    }

    const usedDirectivesSet = new Set(
      usedDirectives.map((dir) => dir.ref.node as ts.ClassDeclaration),
    );

    const usedPipesSet = new Set(usedPipes);

    const unused = this.getUnusedSymbols(metadata, usedDirectivesSet, usedPipesSet);

    const propertyAssignment = closestNode(metadata.rawImports, ts.isPropertyAssignment);
    const category =
      this.typeCheckingConfig.unusedStandaloneImports === 'error'
        ? ts.DiagnosticCategory.Error
        : ts.DiagnosticCategory.Warning;

    if (
      unused !== null &&
      unused.length === metadata.imports.length &&
      propertyAssignment !== null
    ) {
      return makeDiagnostic(
        ErrorCode.UNUSED_STANDALONE_IMPORTS,
        propertyAssignment.name,
        'All imports are unused',
        undefined,
        category,
      );
    }

    const diagnostics: ts.Diagnostic[] = [];

    const localArrayDiagnostics = this.checkLocalArraysAllUnused(
      metadata,
      usedDirectivesSet,
      usedPipesSet,
      category,
    );

    diagnostics.push(...localArrayDiagnostics);

    if (unused !== null) {
      for (const ref of unused) {
        const diagnosticNode =
          ref.getIdentityInExpression(metadata.rawImports!) ||
          ref.getIdentityIn(node.getSourceFile()) ||
          metadata.rawImports!;

        diagnostics.push(
          makeDiagnostic(
            ErrorCode.UNUSED_STANDALONE_IMPORTS,
            diagnosticNode,
            `${ref.node.name.text} is not used within the template of ${metadata.name}`,
            undefined,
            category,
          ),
        );
      }
    }

    return diagnostics.length > 0 ? diagnostics : null;
  }

  private getUnusedSymbols(
    metadata: TypeCheckableDirectiveMeta,
    usedDirectives: Set<ts.ClassDeclaration>,
    usedPipes: Set<string>,
  ) {
    const {imports, rawImports} = metadata;

    if (imports === null || rawImports === null) {
      return null;
    }

    let unused: Reference<ClassDeclaration>[] | null = null;

    for (const current of imports) {
      const currentNode = current.node as ts.ClassDeclaration;
      const dirMeta = this.templateTypeChecker.getDirectiveMetadata(currentNode);

      if (dirMeta !== null) {
        if (
          dirMeta.isStandalone &&
          !usedDirectives.has(currentNode) &&
          !this.isPotentialSharedReference(current, rawImports)
        ) {
          unused ??= [];
          unused.push(current);
        }
        continue;
      }

      const pipeMeta = this.templateTypeChecker.getPipeMetadata(currentNode);

      if (
        pipeMeta !== null &&
        pipeMeta.isStandalone &&
        pipeMeta.name !== null &&
        !usedPipes.has(pipeMeta.name) &&
        !this.isPotentialSharedReference(current, rawImports)
      ) {
        unused ??= [];
        unused.push(current);
      }
    }

    return unused;
  }

  /**
   * Determines if an import reference *might* be coming from a shared imports array.
   * @param reference Reference to be checked.
   * @param rawImports AST node that defines the `imports` array.
   */
  private isPotentialSharedReference(reference: Reference, rawImports: ts.Expression): boolean {
    // If the reference is defined directly in the `imports` array, it cannot be shared.
    if (reference.getIdentityInExpression(rawImports) !== null) {
      return false;
    }

    // If the reference comes from any array variable (local or exported), we treat it as
    // potentially shared and don't report individual unused items. The checkLocalArraysAllUnused
    // method will report "All imports are unused" for local arrays where ALL elements are unused.
    // This avoids noisy diagnostics for users who use arrays to group related imports.
    return true;
  }

  private checkLocalArraysAllUnused(
    metadata: TypeCheckableDirectiveMeta,
    usedDirectives: Set<ts.ClassDeclaration>,
    usedPipes: Set<string>,
    category: ts.DiagnosticCategory,
  ): ts.Diagnostic[] {
    const {rawImports} = metadata;
    if (rawImports === null) {
      return [];
    }

    const diagnostics: ts.Diagnostic[] = [];
    const arrayIdentifiers = this.collectArrayIdentifiers(rawImports);

    for (const {identifier, node: arrayNode} of arrayIdentifiers) {
      const sourceFile = identifier.getSourceFile();
      const declaration = this.findVariableDeclaration(identifier, sourceFile);

      if (declaration === null || !declaration.initializer) {
        continue;
      }

      // Check if this is a local (non-exported) variable
      const variableStatement = this.findParentVariableStatement(declaration);
      if (variableStatement === null) {
        continue;
      }

      const isExported = variableStatement.modifiers?.some(
        (m) => m.kind === ts.SyntaxKind.ExportKeyword,
      );

      if (isExported) {
        continue;
      }

      if (!ts.isArrayLiteralExpression(declaration.initializer)) {
        continue;
      }

      const allUnused = this.areAllArrayElementsUnused(
        declaration.initializer,
        usedDirectives,
        usedPipes,
      );

      if (allUnused) {
        diagnostics.push(
          makeDiagnostic(
            ErrorCode.UNUSED_STANDALONE_IMPORTS,
            arrayNode,
            'All imports are unused',
            undefined,
            category,
          ),
        );
      }
    }

    return diagnostics;
  }

  /**
   * Collects array identifiers from rawImports (both spread and direct references).
   */
  private collectArrayIdentifiers(
    rawImports: ts.Expression,
  ): Array<{identifier: ts.Identifier; node: ts.Node}> {
    const result: Array<{identifier: ts.Identifier; node: ts.Node}> = [];

    // Handle case where imports is directly an identifier (e.g., imports: importsAsArray)
    if (ts.isIdentifier(rawImports)) {
      result.push({identifier: rawImports, node: rawImports});
      return result;
    }

    if (!ts.isArrayLiteralExpression(rawImports)) {
      return result;
    }

    for (const element of rawImports.elements) {
      if (ts.isSpreadElement(element)) {
        // Handle spread syntax: ...ARRAY
        if (ts.isIdentifier(element.expression)) {
          result.push({identifier: element.expression, node: element});
        }
      } else if (ts.isIdentifier(element)) {
        // Handle direct nested array: ARRAY (without spread)
        result.push({identifier: element, node: element});
      }
    }

    return result;
  }

  private areAllArrayElementsUnused(
    arrayLiteral: ts.ArrayLiteralExpression,
    usedDirectives: Set<ts.ClassDeclaration>,
    usedPipes: Set<string>,
  ): boolean {
    if (arrayLiteral.elements.length === 0) {
      return false;
    }

    for (const element of arrayLiteral.elements) {
      if (!ts.isIdentifier(element)) {
        return false;
      }

      const elementName = element.text;

      for (const usedDir of usedDirectives) {
        if (usedDir.name?.text === elementName) {
          return false;
        }
      }

      if (usedPipes.has(elementName)) {
        return false;
      }
    }

    return true;
  }

  private findVariableDeclaration(
    identifier: ts.Identifier,
    sourceFile: ts.SourceFile,
  ): ts.VariableDeclaration | null {
    const targetText = identifier.text;
    let foundDeclaration: ts.VariableDeclaration | null = null;

    const visit = (node: ts.Node): void => {
      if (foundDeclaration) {
        return;
      }

      if (
        ts.isVariableDeclaration(node) &&
        ts.isIdentifier(node.name) &&
        node.name.text === targetText
      ) {
        if (node.name.pos < identifier.pos) {
          foundDeclaration = node;
          return;
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return foundDeclaration;
  }

  private findParentVariableStatement(node: ts.Node): ts.VariableStatement | null {
    let current: ts.Node | undefined = node;
    while (current) {
      if (ts.isVariableStatement(current)) {
        return current;
      }
      current = current.parent;
    }
    return null;
  }
}

/** Gets the closest parent node of a certain type. */
function closestNode<T extends ts.Node>(
  start: ts.Node,
  predicate: (node: ts.Node) => node is T,
): T | null {
  let current = start.parent;

  while (current) {
    if (predicate(current)) {
      return current;
    } else {
      current = current.parent;
    }
  }

  return null;
}
