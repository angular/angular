/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  AST,
  Binary,
  BindingPipe,
  LiteralPrimitive,
  PropertyRead,
  SafePropertyRead,
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
  TmplAstLetDeclaration,
  TmplAstNode,
  TmplAstElement,
  TmplAstReference,
  TmplAstTextAttribute,
  TmplAstVariable,
  TmplAstComponent,
  TmplAstDirective,
  TmplAstRecursiveVisitor,
  tmplAstVisitAll,
} from '@angular/compiler';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import {absoluteFrom} from '@angular/compiler-cli/src/ngtsc/file_system';
import {DirectiveMeta, PipeMeta} from '@angular/compiler-cli/src/ngtsc/metadata';
import {
  DirectiveSymbol,
  SelectorlessComponentSymbol,
  SelectorlessDirectiveSymbol,
  Symbol,
  SymbolKind,
  TcbLocation,
  TemplateTypeChecker,
} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import {
  ExpressionIdentifier,
  hasExpressionIdentifier,
} from '@angular/compiler-cli/src/ngtsc/typecheck/src/comments';
import ts from 'typescript';

import {getTargetAtPosition, TargetNodeKind} from './template_target';
import {findTightestNode, getParentClassDeclaration} from './utils/ts_utils';
import {
  getDirectiveMatchesForAttribute,
  getDirectiveMatchesForElementTag,
  getTemplateLocationFromTcbLocation,
  isWithin,
  TypeCheckInfo,
  toTextSpan,
} from './utils';

/** Represents a location in a file. */
export interface FilePosition {
  fileName: string;
  position: number;
}

/**
 * Converts a `TcbLocation` to a more genericly named `FilePosition`.
 */
function toFilePosition(tcbLocation: TcbLocation): FilePosition {
  return {fileName: tcbLocation.tcbPath, position: tcbLocation.positionInFile};
}
export interface TemplateLocationDetails {
  /**
   * A target node in a template.
   */
  templateTarget: TmplAstNode | AST;

  /**
   * TypeScript locations which the template node maps to. A given template node might map to
   * several TS nodes. For example, a template node for an attribute might resolve to several
   * directives or a directive and one of its inputs.
   */
  typescriptLocations: FilePosition[];

  /**
   * The resolved Symbol for the template target.
   */
  symbol: Symbol;
}

/**
 * Takes a position in a template and finds equivalent targets in TS files as well as details about
 * the targeted template node.
 */
export function getTargetDetailsAtTemplatePosition(
  info: TypeCheckInfo,
  position: number,
  templateTypeChecker: TemplateTypeChecker,
): TemplateLocationDetails[] | null {
  // Find the AST node in the template at the position.
  const positionDetails = getTargetAtPosition(info.nodes, position);
  if (positionDetails === null) {
    return null;
  }

  const nodes =
    positionDetails.context.kind === TargetNodeKind.TwoWayBindingContext
      ? positionDetails.context.nodes
      : [positionDetails.context.node];

  const details: TemplateLocationDetails[] = [];

  for (const node of nodes) {
    // Get the information about the TCB at the template position.
    const symbol = templateTypeChecker.getSymbolOfNode(node, info.declaration);
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
        details.push({
          typescriptLocations: getPositionsForDirectives(matches),
          templateTarget,
          symbol,
        });
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
          node.name,
          symbol.host.templateNode,
          symbol.host.directives,
        );
        details.push({
          typescriptLocations: getPositionsForDirectives(directives),
          templateTarget,
          symbol,
        });
        break;
      }
      case SymbolKind.Reference: {
        details.push({
          typescriptLocations: [toFilePosition(symbol.referenceVarLocation)],
          templateTarget,
          symbol,
        });
        break;
      }
      case SymbolKind.Variable: {
        if (templateTarget instanceof TmplAstVariable) {
          if (
            templateTarget.valueSpan !== undefined &&
            isWithin(position, templateTarget.valueSpan)
          ) {
            // In the valueSpan of the variable, we want to get the reference of the initializer.
            details.push({
              typescriptLocations: [toFilePosition(symbol.initializerLocation)],
              templateTarget,
              symbol,
            });
          } else if (isWithin(position, templateTarget.keySpan)) {
            // In the keySpan of the variable, we want to get the reference of the local variable.
            details.push({
              typescriptLocations: [toFilePosition(symbol.localVarLocation)],
              templateTarget,
              symbol,
            });
          }
        } else {
          // If the templateNode is not the `TmplAstVariable`, it must be a usage of the
          // variable somewhere in the template.
          details.push({
            typescriptLocations: [toFilePosition(symbol.localVarLocation)],
            templateTarget,
            symbol,
          });
        }
        break;
      }
      case SymbolKind.LetDeclaration:
        // If the templateNode isn't on a let declaration, it has to be on a usage of it
        // somewhere in the template. Otherwise only pick up when it's within the name.
        if (
          !(templateTarget instanceof TmplAstLetDeclaration) ||
          isWithin(position, templateTarget.nameSpan)
        ) {
          details.push({
            typescriptLocations: [toFilePosition(symbol.localVarLocation)],
            templateTarget,
            symbol,
          });
        }
        break;
      case SymbolKind.Input:
      case SymbolKind.Output: {
        details.push({
          typescriptLocations: symbol.bindings.map((binding) =>
            toFilePosition(binding.tcbLocation),
          ),
          templateTarget,
          symbol,
        });
        break;
      }
      case SymbolKind.Pipe:
      case SymbolKind.Expression: {
        details.push({
          typescriptLocations: [toFilePosition(symbol.tcbLocation)],
          templateTarget,
          symbol,
        });
        break;
      }
      case SymbolKind.SelectorlessDirective:
      case SymbolKind.SelectorlessComponent:
        const dirPosition = getPositionForDirective(symbol);
        if (dirPosition !== null) {
          details.push({
            typescriptLocations: [dirPosition],
            templateTarget,
            symbol,
          });
        }
        break;
    }
  }

  return details.length > 0 ? details : null;
}

/**
 * Given a set of `DirectiveSymbol`s, finds the equivalent `FilePosition` of the class declaration.
 */
function getPositionsForDirectives(directives: Set<DirectiveSymbol>): FilePosition[] {
  const allDirectives: FilePosition[] = [];
  for (const dir of directives.values()) {
    const position = getPositionForDirective(dir);
    if (position !== null) {
      allDirectives.push(position);
    }
  }
  return allDirectives;
}

/** Gets the `FilePosition` for a single directive symbol. */
function getPositionForDirective(
  directive: DirectiveSymbol | SelectorlessComponentSymbol | SelectorlessDirectiveSymbol,
): FilePosition | null {
  const declaration = directive.tsSymbol?.valueDeclaration;

  if (
    declaration !== undefined &&
    ts.isClassDeclaration(declaration) &&
    declaration.name !== undefined
  ) {
    const {fileName} = declaration.getSourceFile();
    const position = declaration.name.getStart();
    return {fileName, position};
  }

  return null;
}

/**
 * Creates a "key" for a rename/reference location by concatenating file name, span start, and span
 * length. This allows us to de-duplicate template results when an item may appear several times
 * in the TCB but map back to the same template location.
 */
export function createLocationKey(ds: ts.DocumentSpan) {
  return ds.fileName + ds.textSpan.start + ds.textSpan.length;
}

/**
 * Converts a given `ts.DocumentSpan` in a shim file to its equivalent `ts.DocumentSpan` in the
 * template.
 *
 * You can optionally provide a `requiredNodeText` that ensures the equivalent template node's text
 * matches. If it does not, this function will return `null`.
 */
export function convertToTemplateDocumentSpan<T extends ts.DocumentSpan>(
  shimDocumentSpan: T,
  templateTypeChecker: TemplateTypeChecker,
  program: ts.Program,
  requiredNodeText?: string,
): T | null {
  const sf = program.getSourceFile(shimDocumentSpan.fileName);
  if (sf === undefined) {
    return null;
  }
  const tcbNode = findTightestNode(sf, shimDocumentSpan.textSpan.start);
  if (
    tcbNode === undefined ||
    hasExpressionIdentifier(sf, tcbNode, ExpressionIdentifier.EVENT_PARAMETER)
  ) {
    // If the reference result is the $event parameter in the subscribe/addEventListener
    // function in the TCB, we want to filter this result out of the references. We really only
    // want to return references to the parameter in the template itself.
    return null;
  }
  // Variables in the typecheck block are generated with the type on the right hand
  // side: `var _t1 = null! as i1.DirA`. Finding references of DirA will return the type
  // assertion and we need to map it back to the variable identifier _t1.
  if (hasExpressionIdentifier(sf, tcbNode, ExpressionIdentifier.VARIABLE_AS_EXPRESSION)) {
    let newNode = tcbNode;
    while (!ts.isVariableDeclaration(newNode)) {
      newNode = newNode.parent;
    }
    newNode = newNode.name;
    shimDocumentSpan.textSpan = {
      start: newNode.getStart(),
      length: newNode.getEnd() - newNode.getStart(),
    };
  }
  // TODO(atscott): Determine how to consistently resolve paths. i.e. with the project
  // serverHost or LSParseConfigHost in the adapter. We should have a better defined way to
  // normalize paths.
  const mapping = getTemplateLocationFromTcbLocation(
    templateTypeChecker,
    absoluteFrom(shimDocumentSpan.fileName),
    /* tcbIsShim */ true,
    shimDocumentSpan.textSpan.start,
  );
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

/**
 * Finds the text and `ts.TextSpan` for the node at a position in a template.
 */
export function getRenameTextAndSpanAtPosition(
  node: TmplAstNode | AST,
  position: number,
): {text: string; span: ts.TextSpan} | null {
  if (
    node instanceof TmplAstBoundAttribute ||
    node instanceof TmplAstTextAttribute ||
    node instanceof TmplAstBoundEvent
  ) {
    return node.keySpan === undefined ? null : {text: node.name, span: toTextSpan(node.keySpan)};
  } else if (node instanceof TmplAstLetDeclaration && isWithin(position, node.nameSpan)) {
    return {text: node.nameSpan.toString(), span: toTextSpan(node.nameSpan)};
  } else if (node instanceof TmplAstVariable || node instanceof TmplAstReference) {
    if (isWithin(position, node.keySpan)) {
      return {text: node.keySpan.toString(), span: toTextSpan(node.keySpan)};
    } else if (node.valueSpan && isWithin(position, node.valueSpan)) {
      return {text: node.valueSpan.toString(), span: toTextSpan(node.valueSpan)};
    }
  } else if (
    node instanceof PropertyRead ||
    node instanceof SafePropertyRead ||
    node instanceof BindingPipe
  ) {
    return {text: node.name, span: toTextSpan(node.nameSpan)};
  } else if (
    node instanceof Binary &&
    node.operation === '=' &&
    node.left instanceof PropertyRead
  ) {
    return getRenameTextAndSpanAtPosition(node.left, position);
  } else if (node instanceof LiteralPrimitive) {
    const span = toTextSpan(node.sourceSpan);
    const text = node.value;
    if (typeof text === 'string') {
      // The span of a string literal includes the quotes but they should be removed for renaming.
      span.start += 1;
      span.length -= 2;
    }
    return {text, span};
  } else if (node instanceof TmplAstElement || node instanceof TmplAstDirective) {
    return {text: node.name, span: toTextSpan(node.startSourceSpan)};
  } else if (node instanceof TmplAstComponent) {
    return {text: node.componentName, span: toTextSpan(node.startSourceSpan)};
  }

  return null;
}

/**
 * Retrieves the `PipeMeta` or `DirectiveMeta` of the given `ts.Node`'s parent class.
 *
 * Returns `null` if the node has no parent class or there is no meta associated with the class.
 */
export function getParentClassMeta(
  requestNode: ts.Node,
  compiler: NgCompiler,
): PipeMeta | DirectiveMeta | null {
  const parentClass = getParentClassDeclaration(requestNode);
  if (parentClass === undefined) {
    return null;
  }
  return compiler.getMeta(parentClass);
}

/** Visitor that collects all selectorless AST nodes from a template. */
export class SelectorlessCollector extends TmplAstRecursiveVisitor {
  private nodes: (TmplAstComponent | TmplAstDirective)[] = [];

  static getSelectorlessNodes(nodes: TmplAstNode[]): (TmplAstComponent | TmplAstDirective)[] {
    const visitor = new SelectorlessCollector();
    tmplAstVisitAll(visitor, nodes);
    return visitor.nodes;
  }

  visit(node: TmplAstNode) {
    if (node instanceof TmplAstComponent || node instanceof TmplAstDirective) {
      this.nodes.push(node);
    }
    node.visit(this);
  }
}
