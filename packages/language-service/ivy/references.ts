/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {TmplAstVariable} from '@angular/compiler';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import {absoluteFrom, absoluteFromSourceFile, AbsoluteFsPath} from '@angular/compiler-cli/src/ngtsc/file_system';
import {SymbolKind, TemplateTypeChecker, TypeCheckingProgramStrategy} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import * as ts from 'typescript';

import {getTargetAtPosition} from './template_target';
import {getTemplateInfoAtPosition, isWithin, TemplateInfo, toTextSpan} from './utils';

export class ReferenceBuilder {
  private readonly ttc = this.compiler.getTemplateTypeChecker();

  constructor(
      private readonly strategy: TypeCheckingProgramStrategy,
      private readonly tsLS: ts.LanguageService, private readonly compiler: NgCompiler) {}

  get(filePath: string, position: number): ts.ReferenceEntry[]|undefined {
    this.ttc.generateAllTypeCheckBlocks();
    const templateInfo = getTemplateInfoAtPosition(filePath, position, this.compiler);
    return templateInfo !== undefined ?
        this.getReferencesAtTemplatePosition(templateInfo, position) :
        this.getReferencesAtTypescriptPosition(filePath, position);
  }

  private getReferencesAtTemplatePosition({template, component}: TemplateInfo, position: number):
      ts.ReferenceEntry[]|undefined {
    // Find the AST node in the template at the position.
    const positionDetails = getTargetAtPosition(template, position);
    if (positionDetails === null) {
      return undefined;
    }

    // Get the information about the TCB at the template position.
    const symbol = this.ttc.getSymbolOfNode(positionDetails.node, component);
    if (symbol === null) {
      return undefined;
    }
    switch (symbol.kind) {
      case SymbolKind.Element:
      case SymbolKind.Directive:
      case SymbolKind.Template:
      case SymbolKind.DomBinding:
        // References to elements, templates, and directives will be through template references
        // (#ref). They shouldn't be used directly for a Language Service reference request.
        //
        // Dom bindings aren't currently type-checked (see `checkTypeOfDomBindings`) so they don't
        // have a shim location and so we cannot find references for them.
        //
        // TODO(atscott): Consider finding references for elements that are components as well as
        // when the position is on an element attribute that directly maps to a directive.
        return undefined;
      case SymbolKind.Reference: {
        const {shimPath, positionInShimFile} = symbol.referenceVarLocation;
        return this.getReferencesAtTypescriptPosition(shimPath, positionInShimFile);
      }
      case SymbolKind.Variable: {
        const {positionInShimFile: initializerPosition, shimPath} = symbol.initializerLocation;
        const localVarPosition = symbol.localVarLocation.positionInShimFile;
        const templateNode = positionDetails.node;

        if ((templateNode instanceof TmplAstVariable)) {
          if (templateNode.valueSpan !== undefined && isWithin(position, templateNode.valueSpan)) {
            // In the valueSpan of the variable, we want to get the reference of the initializer.
            return this.getReferencesAtTypescriptPosition(shimPath, initializerPosition);
          } else if (isWithin(position, templateNode.keySpan)) {
            // In the keySpan of the variable, we want to get the reference of the local variable.
            return this.getReferencesAtTypescriptPosition(shimPath, localVarPosition);
          } else {
            return undefined;
          }
        }

        // If the templateNode is not the `TmplAstVariable`, it must be a usage of the variable
        // somewhere in the template.
        return this.getReferencesAtTypescriptPosition(shimPath, localVarPosition);
      }
      case SymbolKind.Input:
      case SymbolKind.Output: {
        // TODO(atscott): Determine how to handle when the binding maps to several inputs/outputs
        const {shimPath, positionInShimFile} = symbol.bindings[0].shimLocation;
        return this.getReferencesAtTypescriptPosition(shimPath, positionInShimFile);
      }
      case SymbolKind.Expression: {
        const {shimPath, positionInShimFile} = symbol.shimLocation;
        return this.getReferencesAtTypescriptPosition(shimPath, positionInShimFile);
      }
    }
  }

  private getReferencesAtTypescriptPosition(fileName: string, position: number):
      ts.ReferenceEntry[]|undefined {
    const refs = this.tsLS.getReferencesAtPosition(fileName, position);
    if (refs === undefined) {
      return undefined;
    }

    const entries: ts.ReferenceEntry[] = [];
    for (const ref of refs) {
      if (this.ttc.isTrackedTypeCheckFile(absoluteFrom(ref.fileName))) {
        const entry = convertToTemplateReferenceEntry(ref, this.ttc);
        if (entry !== null) {
          entries.push(entry);
        }
      } else {
        entries.push(ref);
      }
    }
    return entries;
  }
}

function convertToTemplateReferenceEntry(
    shimReferenceEntry: ts.ReferenceEntry,
    templateTypeChecker: TemplateTypeChecker): ts.ReferenceEntry|null {
  // TODO(atscott): Determine how to consistently resolve paths. i.e. with the project serverHost or
  // LSParseConfigHost in the adapter. We should have a better defined way to normalize paths.
  const mapping = templateTypeChecker.getTemplateMappingAtShimLocation({
    shimPath: absoluteFrom(shimReferenceEntry.fileName),
    positionInShimFile: shimReferenceEntry.textSpan.start,
  });
  if (mapping === null) {
    return null;
  }
  const {templateSourceMapping, span} = mapping;

  let templateUrl: AbsoluteFsPath;
  if (templateSourceMapping.type === 'direct') {
    templateUrl = absoluteFromSourceFile(templateSourceMapping.node.getSourceFile());
  } else if (templateSourceMapping.type === 'external') {
    templateUrl = absoluteFrom(templateSourceMapping.templateUrl);
  } else {
    // This includes indirect mappings, which are difficult to map directly to the code location.
    // Diagnostics similarly return a synthetic template string for this case rather than a real
    // location.
    return null;
  }

  return {
    ...shimReferenceEntry,
    fileName: templateUrl,
    textSpan: toTextSpan(span),
  };
}
