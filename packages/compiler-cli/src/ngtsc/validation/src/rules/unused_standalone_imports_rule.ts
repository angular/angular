/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {ErrorCode, makeDiagnostic, makeRelatedInformation} from '../../../diagnostics';
import {ImportedSymbolsTracker, Reference} from '../../../imports';
import {
  TemplateTypeChecker,
  TypeCheckableDirectiveMeta,
  TypeCheckingConfig,
} from '../../../typecheck/api';

import {SourceFileValidatorRule} from './api';

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

  checkNode(node: ts.Node): ts.Diagnostic | null {
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

    const unused = this.getUnusedSymbols(
      metadata,
      new Set(usedDirectives.map((dir) => dir.ref.node as ts.ClassDeclaration)),
      new Set(usedPipes),
    );

    if (unused === null) {
      return null;
    }

    const category =
      this.typeCheckingConfig.unusedStandaloneImports === 'error'
        ? ts.DiagnosticCategory.Error
        : ts.DiagnosticCategory.Warning;

    if (unused.length === metadata.imports.length) {
      return makeDiagnostic(
        ErrorCode.UNUSED_STANDALONE_IMPORTS,
        metadata.rawImports,
        'All imports are unused',
        undefined,
        category,
      );
    }

    return makeDiagnostic(
      ErrorCode.UNUSED_STANDALONE_IMPORTS,
      metadata.rawImports,
      'Imports array contains unused imports',
      unused.map(([ref, type, name]) =>
        makeRelatedInformation(
          ref.getOriginForDiagnostics(metadata.rawImports!),
          `${type} "${name}" is not used within the template`,
        ),
      ),
      category,
    );
  }

  private getUnusedSymbols(
    metadata: TypeCheckableDirectiveMeta,
    usedDirectives: Set<ts.ClassDeclaration>,
    usedPipes: Set<string>,
  ) {
    if (metadata.imports === null || metadata.rawImports === null) {
      return null;
    }

    let unused: [ref: Reference, type: string, name: string][] | null = null;

    for (const current of metadata.imports) {
      const currentNode = current.node as ts.ClassDeclaration;
      const dirMeta = this.templateTypeChecker.getDirectiveMetadata(currentNode);

      if (dirMeta !== null) {
        if (dirMeta.isStandalone && (usedDirectives === null || !usedDirectives.has(currentNode))) {
          unused ??= [];
          unused.push([current, dirMeta.isComponent ? 'Component' : 'Directive', dirMeta.name]);
        }
        continue;
      }

      const pipeMeta = this.templateTypeChecker.getPipeMetadata(currentNode);

      if (
        pipeMeta !== null &&
        pipeMeta.isStandalone &&
        (usedPipes === null || !usedPipes.has(pipeMeta.name))
      ) {
        unused ??= [];
        unused.push([current, 'Pipe', pipeMeta.ref.node.name.text]);
      }
    }

    return unused;
  }
}
