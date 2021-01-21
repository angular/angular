/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AST, BindingPipe, LiteralPrimitive, MethodCall, PropertyRead, PropertyWrite, SafeMethodCall, SafePropertyRead, TmplAstBoundAttribute, TmplAstBoundEvent, TmplAstNode, TmplAstReference, TmplAstTextAttribute, TmplAstVariable} from '@angular/compiler';
import {absoluteFrom} from '@angular/compiler-cli/src/ngtsc/file_system';
import {DirectiveSymbol, ShimLocation, SymbolKind, TemplateTypeChecker} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import {ExpressionIdentifier, hasExpressionIdentifier} from '@angular/compiler-cli/src/ngtsc/typecheck/src/comments';
import * as ts from 'typescript';

import {getTargetAtPosition, TargetNodeKind} from './template_target';
import {findTightestNode} from './ts_utils';
import {getDirectiveMatchesForAttribute, getDirectiveMatchesForElementTag, getTemplateLocationFromShimLocation, isWithin, TemplateInfo, toTextSpan} from './utils';

interface FilePosition {
  fileName: string;
  position: number;
}

function toFilePosition(shimLocation: ShimLocation): FilePosition {
  return {fileName: shimLocation.shimPath, position: shimLocation.positionInShimFile};
}
export interface TemplateLocationDetails {
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


export function getTargetDetailsAtTemplatePosition(
    {template, component}: TemplateInfo, position: number,
    templateTypeChecker: TemplateTypeChecker): TemplateLocationDetails[]|null {
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
    const symbol = templateTypeChecker.getSymbolOfNode(node, component);
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
        details.push({typescriptLocations: getPositionsForDirectives(matches), templateTarget});
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
          typescriptLocations: getPositionsForDirectives(directives),
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
          typescriptLocations: symbol.bindings.map(binding => toFilePosition(binding.shimLocation)),
          templateTarget,
        });
        break;
      }
      case SymbolKind.Pipe:
      case SymbolKind.Expression: {
        details.push({typescriptLocations: [toFilePosition(symbol.shimLocation)], templateTarget});
        break;
      }
    }
  }

  return details.length > 0 ? details : null;
}

function getPositionsForDirectives(directives: Set<DirectiveSymbol>): FilePosition[] {
  const allDirectives: FilePosition[] = [];
  for (const dir of directives.values()) {
    const dirClass = dir.tsSymbol.valueDeclaration;
    if (dirClass === undefined || !ts.isClassDeclaration(dirClass) || dirClass.name === undefined) {
      continue;
    }

    const {fileName} = dirClass.getSourceFile();
    const position = dirClass.name.getStart();
    allDirectives.push({fileName, position});
  }

  return allDirectives;
}

/**
 * Creates a "key" for a rename/reference location by concatenating file name, span start, and span
 * length. This allows us to de-duplicate template results when an item may appear several times
 * in the TCB but map back to the same template location.
 */
export function createLocationKey(ds: ts.DocumentSpan) {
  return ds.fileName + ds.textSpan.start + ds.textSpan.length;
}

export function convertToTemplateDocumentSpan<T extends ts.DocumentSpan>(
    shimDocumentSpan: T, templateTypeChecker: TemplateTypeChecker, program: ts.Program,
    requiredNodeText?: string): T|null {
  const sf = program.getSourceFile(shimDocumentSpan.fileName);
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

export function getRenameTextAndSpanAtPosition(
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