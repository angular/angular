/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteSourceSpan, AST, BindingPipe, LiteralPrimitive, MethodCall, ParseSourceSpan, PropertyRead, PropertyWrite, SafeMethodCall, SafePropertyRead, TmplAstBoundAttribute, TmplAstBoundEvent, TmplAstNode, TmplAstReference, TmplAstTextAttribute, TmplAstVariable} from '@angular/compiler';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import {absoluteFrom, absoluteFromSourceFile, AbsoluteFsPath} from '@angular/compiler-cli/src/ngtsc/file_system';
import {PerfPhase} from '@angular/compiler-cli/src/ngtsc/perf';
import {DirectiveSymbol, ShimLocation, SymbolKind, TemplateTypeChecker, TypeCheckingProgramStrategy} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import {ExpressionIdentifier, hasExpressionIdentifier} from '@angular/compiler-cli/src/ngtsc/typecheck/src/comments';
import * as ts from 'typescript';

import {getTargetAtPosition, TargetNodeKind} from './template_target';
import {findTightestNode} from './ts_utils';
import {getDirectiveMatchesForAttribute, getDirectiveMatchesForElementTag, getTemplateInfoAtPosition, getTemplateLocationFromShimLocation, isWithin, TemplateInfo, toTextSpan} from './utils';

interface FilePosition {
  fileName: string;
  position: number;
}

function toFilePosition(shimLocation: ShimLocation): FilePosition {
  return {fileName: shimLocation.shimPath, position: shimLocation.positionInShimFile};
}

enum RequestKind {
  Template,
  TypeScript,
}

interface TemplateRequest {
  kind: RequestKind.Template;
  requestNode: TmplAstNode|AST;
  position: number;
}

interface TypeScriptRequest {
  kind: RequestKind.TypeScript;
  requestNode: ts.Node;
}

type RequestOrigin = TemplateRequest|TypeScriptRequest;

interface TemplateLocationDetails {
  /**
   * A target node in a template.
   */
  templateTarget: TmplAstNode|AST;

  /**
   * TypeScript locations which the template node maps to. A given template node might map to
   * several TS nodes. For example, a template node for an attribute might resolve to several
   * directives or a directive and one of its inputs.
   */
  typescriptLocations: FilePosition[];
}

export class ReferencesAndRenameBuilder {
  private readonly ttc = this.compiler.getTemplateTypeChecker();

  constructor(
      private readonly strategy: TypeCheckingProgramStrategy,
      private readonly tsLS: ts.LanguageService, private readonly compiler: NgCompiler) {}

  getRenameInfo(filePath: string, position: number):
      Omit<ts.RenameInfoSuccess, 'kind'|'kindModifiers'>|ts.RenameInfoFailure {
    return this.compiler.perfRecorder.inPhase(PerfPhase.LsReferencesAndRenames, () => {
      const templateInfo = getTemplateInfoAtPosition(filePath, position, this.compiler);
      // We could not get a template at position so we assume the request came from outside the
      // template.
      if (templateInfo === undefined) {
        return this.tsLS.getRenameInfo(filePath, position);
      }

      const allTargetDetails = this.getTargetDetailsAtTemplatePosition(templateInfo, position);
      if (allTargetDetails === null) {
        return {
          canRename: false,
          localizedErrorMessage: 'Could not find template node at position.',
        };
      }
      const {templateTarget} = allTargetDetails[0];
      const templateTextAndSpan = getRenameTextAndSpanAtPosition(templateTarget, position);
      if (templateTextAndSpan === null) {
        return {canRename: false, localizedErrorMessage: 'Could not determine template node text.'};
      }
      const {text, span} = templateTextAndSpan;
      return {
        canRename: true,
        displayName: text,
        fullDisplayName: text,
        triggerSpan: span,
      };
    });
  }

  findRenameLocations(filePath: string, position: number): readonly ts.RenameLocation[]|undefined {
    this.ttc.generateAllTypeCheckBlocks();
    return this.compiler.perfRecorder.inPhase(PerfPhase.LsReferencesAndRenames, () => {
      const templateInfo = getTemplateInfoAtPosition(filePath, position, this.compiler);
      // We could not get a template at position so we assume the request came from outside the
      // template.
      if (templateInfo === undefined) {
        const requestNode = this.getTsNodeAtPosition(filePath, position);
        if (requestNode === null) {
          return undefined;
        }
        const requestOrigin: TypeScriptRequest = {kind: RequestKind.TypeScript, requestNode};
        return this.findRenameLocationsAtTypescriptPosition(filePath, position, requestOrigin);
      }

      return this.findRenameLocationsAtTemplatePosition(templateInfo, position);
    });
  }

  private findRenameLocationsAtTemplatePosition(templateInfo: TemplateInfo, position: number):
      readonly ts.RenameLocation[]|undefined {
    const allTargetDetails = this.getTargetDetailsAtTemplatePosition(templateInfo, position);
    if (allTargetDetails === null) {
      return undefined;
    }

    const allRenameLocations: ts.RenameLocation[] = [];
    for (const targetDetails of allTargetDetails) {
      const requestOrigin: TemplateRequest = {
        kind: RequestKind.Template,
        requestNode: targetDetails.templateTarget,
        position,
      };

      for (const location of targetDetails.typescriptLocations) {
        const locations = this.findRenameLocationsAtTypescriptPosition(
            location.fileName, location.position, requestOrigin);
        // If we couldn't find rename locations for _any_ result, we should not allow renaming to
        // proceed instead of having a partially complete rename.
        if (locations === undefined) {
          return undefined;
        }
        allRenameLocations.push(...locations);
      }
    }
    return allRenameLocations.length > 0 ? allRenameLocations : undefined;
  }

  private getTsNodeAtPosition(filePath: string, position: number): ts.Node|null {
    const sf = this.strategy.getProgram().getSourceFile(filePath);
    if (!sf) {
      return null;
    }
    return findTightestNode(sf, position) ?? null;
  }

  findRenameLocationsAtTypescriptPosition(
      filePath: string, position: number,
      requestOrigin: RequestOrigin): readonly ts.RenameLocation[]|undefined {
    return this.compiler.perfRecorder.inPhase(PerfPhase.LsReferencesAndRenames, () => {
      let originalNodeText: string;
      if (requestOrigin.kind === RequestKind.TypeScript) {
        originalNodeText = requestOrigin.requestNode.getText();
      } else {
        const templateNodeText =
            getRenameTextAndSpanAtPosition(requestOrigin.requestNode, requestOrigin.position);
        if (templateNodeText === null) {
          return undefined;
        }
        originalNodeText = templateNodeText.text;
      }

      const locations = this.tsLS.findRenameLocations(
          filePath, position, /*findInStrings*/ false, /*findInComments*/ false);
      if (locations === undefined) {
        return undefined;
      }

      const entries: Map<string, ts.RenameLocation> = new Map();
      for (const location of locations) {
        // TODO(atscott): Determine if a file is a shim file in a more robust way and make the API
        // available in an appropriate location.
        if (this.ttc.isTrackedTypeCheckFile(absoluteFrom(location.fileName))) {
          const entry = this.convertToTemplateDocumentSpan(location, this.ttc, originalNodeText);
          // There is no template node whose text matches the original rename request. Bail on
          // renaming completely rather than providing incomplete results.
          if (entry === null) {
            return undefined;
          }
          entries.set(createLocationKey(entry), entry);
        } else {
          // Ensure we only allow renaming a TS result with matching text
          const refNode = this.getTsNodeAtPosition(location.fileName, location.textSpan.start);
          if (refNode === null || refNode.getText() !== originalNodeText) {
            return undefined;
          }
          entries.set(createLocationKey(location), location);
        }
      }
      return Array.from(entries.values());
    });
  }

  getReferencesAtPosition(filePath: string, position: number): ts.ReferenceEntry[]|undefined {
    this.ttc.generateAllTypeCheckBlocks();

    return this.compiler.perfRecorder.inPhase(PerfPhase.LsReferencesAndRenames, () => {
      const templateInfo = getTemplateInfoAtPosition(filePath, position, this.compiler);
      if (templateInfo === undefined) {
        return this.getReferencesAtTypescriptPosition(filePath, position);
      }
      return this.getReferencesAtTemplatePosition(templateInfo, position);
    });
  }

  private getReferencesAtTemplatePosition(templateInfo: TemplateInfo, position: number):
      ts.ReferenceEntry[]|undefined {
    const allTargetDetails = this.getTargetDetailsAtTemplatePosition(templateInfo, position);
    if (allTargetDetails === null) {
      return undefined;
    }
    const allReferences: ts.ReferenceEntry[] = [];
    for (const targetDetails of allTargetDetails) {
      for (const location of targetDetails.typescriptLocations) {
        const refs = this.getReferencesAtTypescriptPosition(location.fileName, location.position);
        if (refs !== undefined) {
          allReferences.push(...refs);
        }
      }
    }
    return allReferences.length > 0 ? allReferences : undefined;
  }

  private getTargetDetailsAtTemplatePosition({template, component}: TemplateInfo, position: number):
      TemplateLocationDetails[]|null {
    // Find the AST node in the template at the position.
    const positionDetails = getTargetAtPosition(template, position);
    if (positionDetails === null) {
      return null;
    }

    const nodes = positionDetails.context.kind === TargetNodeKind.TwoWayBindingContext ?
        positionDetails.context.nodes :
        [positionDetails.context.node];

    const details: TemplateLocationDetails[] = [];

    for (const node of nodes) {
      // Get the information about the TCB at the template position.
      const symbol = this.ttc.getSymbolOfNode(node, component);
      if (symbol === null) {
        continue;
      }

      const templateTarget = node;
      switch (symbol.kind) {
        case SymbolKind.Directive:
        case SymbolKind.Template:
          // References to elements, templates, and directives will be through template references
          // (#ref). They shouldn't be used directly for a Language Service reference request.
          break;
        case SymbolKind.Element: {
          const matches = getDirectiveMatchesForElementTag(symbol.templateNode, symbol.directives);
          details.push(
              {typescriptLocations: this.getPositionsForDirectives(matches), templateTarget});
          break;
        }
        case SymbolKind.DomBinding: {
          // Dom bindings aren't currently type-checked (see `checkTypeOfDomBindings`) so they don't
          // have a shim location. This means we can't match dom bindings to their lib.dom
          // reference, but we can still see if they match to a directive.
          if (!(node instanceof TmplAstTextAttribute) && !(node instanceof TmplAstBoundAttribute)) {
            return null;
          }
          const directives = getDirectiveMatchesForAttribute(
              node.name, symbol.host.templateNode, symbol.host.directives);
          details.push({
            typescriptLocations: this.getPositionsForDirectives(directives),
            templateTarget,
          });
          break;
        }
        case SymbolKind.Reference: {
          details.push({
            typescriptLocations: [toFilePosition(symbol.referenceVarLocation)],
            templateTarget,
          });
          break;
        }
        case SymbolKind.Variable: {
          if ((templateTarget instanceof TmplAstVariable)) {
            if (templateTarget.valueSpan !== undefined &&
                isWithin(position, templateTarget.valueSpan)) {
              // In the valueSpan of the variable, we want to get the reference of the initializer.
              details.push({
                typescriptLocations: [toFilePosition(symbol.initializerLocation)],
                templateTarget,
              });
            } else if (isWithin(position, templateTarget.keySpan)) {
              // In the keySpan of the variable, we want to get the reference of the local variable.
              details.push({
                typescriptLocations: [toFilePosition(symbol.localVarLocation)],
                templateTarget,
              });
            }
          } else {
            // If the templateNode is not the `TmplAstVariable`, it must be a usage of the
            // variable somewhere in the template.
            details.push({
              typescriptLocations: [toFilePosition(symbol.localVarLocation)],
              templateTarget,
            });
          }
          break;
        }
        case SymbolKind.Input:
        case SymbolKind.Output: {
          details.push({
            typescriptLocations:
                symbol.bindings.map(binding => toFilePosition(binding.shimLocation)),
            templateTarget,
          });
          break;
        }
        case SymbolKind.Pipe:
        case SymbolKind.Expression: {
          details.push(
              {typescriptLocations: [toFilePosition(symbol.shimLocation)], templateTarget});
          break;
        }
      }
    }

    return details.length > 0 ? details : null;
  }

  private getPositionsForDirectives(directives: Set<DirectiveSymbol>): FilePosition[] {
    const allDirectives: FilePosition[] = [];
    for (const dir of directives.values()) {
      const dirClass = dir.tsSymbol.valueDeclaration;
      if (dirClass === undefined || !ts.isClassDeclaration(dirClass) ||
          dirClass.name === undefined) {
        continue;
      }

      const {fileName} = dirClass.getSourceFile();
      const position = dirClass.name.getStart();
      allDirectives.push({fileName, position});
    }

    return allDirectives;
  }

  private getReferencesAtTypescriptPosition(fileName: string, position: number):
      ts.ReferenceEntry[]|undefined {
    const refs = this.tsLS.getReferencesAtPosition(fileName, position);
    if (refs === undefined) {
      return undefined;
    }

    const entries: Map<string, ts.ReferenceEntry> = new Map();
    for (const ref of refs) {
      if (this.ttc.isTrackedTypeCheckFile(absoluteFrom(ref.fileName))) {
        const entry = this.convertToTemplateDocumentSpan(ref, this.ttc);
        if (entry !== null) {
          entries.set(createLocationKey(entry), entry);
        }
      } else {
        // TODO(atscott): uncomment when VSCode deduplicates results on their end
        // https://github.com/microsoft/vscode/issues/117095
        // entries.set(createLocationKey(ref), ref);
      }
    }
    return Array.from(entries.values());
  }

  private convertToTemplateDocumentSpan<T extends ts.DocumentSpan>(
      shimDocumentSpan: T, templateTypeChecker: TemplateTypeChecker, requiredNodeText?: string): T
      |null {
    const sf = this.strategy.getProgram().getSourceFile(shimDocumentSpan.fileName);
    if (sf === undefined) {
      return null;
    }
    const tcbNode = findTightestNode(sf, shimDocumentSpan.textSpan.start);
    if (tcbNode === undefined ||
        hasExpressionIdentifier(sf, tcbNode, ExpressionIdentifier.EVENT_PARAMETER)) {
      // If the reference result is the $event parameter in the subscribe/addEventListener
      // function in the TCB, we want to filter this result out of the references. We really only
      // want to return references to the parameter in the template itself.
      return null;
    }
    // TODO(atscott): Determine how to consistently resolve paths. i.e. with the project
    // serverHost or LSParseConfigHost in the adapter. We should have a better defined way to
    // normalize paths.
    const mapping = getTemplateLocationFromShimLocation(
        templateTypeChecker, absoluteFrom(shimDocumentSpan.fileName),
        shimDocumentSpan.textSpan.start);
    if (mapping === null) {
      return null;
    }

    const {span, templateUrl} = mapping;
    if (requiredNodeText !== undefined && span.toString() !== requiredNodeText) {
      return null;
    }

    return {
      ...shimDocumentSpan,
      fileName: templateUrl,
      textSpan: toTextSpan(span),
      // Specifically clear other text span values because we do not have enough knowledge to
      // convert these to spans in the template.
      contextSpan: undefined,
      originalContextSpan: undefined,
      originalTextSpan: undefined,
    };
  }
}

function getRenameTextAndSpanAtPosition(
    node: TmplAstNode|AST, position: number): {text: string, span: ts.TextSpan}|null {
  if (node instanceof TmplAstBoundAttribute || node instanceof TmplAstTextAttribute ||
      node instanceof TmplAstBoundEvent) {
    if (node.keySpan === undefined) {
      return null;
    }
    return {text: node.name, span: toTextSpan(node.keySpan)};
  } else if (node instanceof TmplAstVariable || node instanceof TmplAstReference) {
    if (isWithin(position, node.keySpan)) {
      return {text: node.keySpan.toString(), span: toTextSpan(node.keySpan)};
    } else if (node.valueSpan && isWithin(position, node.valueSpan)) {
      return {text: node.valueSpan.toString(), span: toTextSpan(node.valueSpan)};
    }
  }

  if (node instanceof BindingPipe) {
    // TODO(atscott): Add support for renaming pipes
    return null;
  }
  if (node instanceof PropertyRead || node instanceof MethodCall || node instanceof PropertyWrite ||
      node instanceof SafePropertyRead || node instanceof SafeMethodCall) {
    return {text: node.name, span: toTextSpan(node.nameSpan)};
  } else if (node instanceof LiteralPrimitive) {
    const span = toTextSpan(node.sourceSpan);
    const text = node.value;
    if (typeof text === 'string') {
      // The span of a string literal includes the quotes but they should be removed for renaming.
      span.start += 1;
      span.length -= 2;
    }
    return {text, span};
  }

  return null;
}


/**
 * Creates a "key" for a rename/reference location by concatenating file name, span start, and span
 * length. This allows us to de-duplicate template results when an item may appear several times
 * in the TCB but map back to the same template location.
 */
function createLocationKey(ds: ts.DocumentSpan) {
  return ds.fileName + ds.textSpan.start + ds.textSpan.length;
}