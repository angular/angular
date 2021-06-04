/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteSourceSpan, CssSelector, ParseSourceSpan, SelectorMatcher, TmplAstBoundEvent} from '@angular/compiler';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import {absoluteFrom, absoluteFromSourceFile, AbsoluteFsPath} from '@angular/compiler-cli/src/ngtsc/file_system';
import {isExternalResource} from '@angular/compiler-cli/src/ngtsc/metadata';
import {DeclarationNode} from '@angular/compiler-cli/src/ngtsc/reflection';
import {DirectiveSymbol, TemplateTypeChecker} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import * as e from '@angular/compiler/src/expression_parser/ast';  // e for expression AST
import * as t from '@angular/compiler/src/render3/r3_ast';         // t for template AST
import * as ts from 'typescript';

import {ALIAS_NAME, SYMBOL_PUNC} from './display_parts';
import {findTightestNode, getParentClassDeclaration} from './ts_utils';

export function getTextSpanOfNode(node: t.Node|e.AST): ts.TextSpan {
  if (isTemplateNodeWithKeyAndValue(node)) {
    return toTextSpan(node.keySpan);
  } else if (
      node instanceof e.PropertyWrite || node instanceof e.MethodCall ||
      node instanceof e.BindingPipe || node instanceof e.PropertyRead) {
    // The `name` part of a `PropertyWrite`, `MethodCall`, and `BindingPipe` does not
    // have its own AST so there is no way to retrieve a `Symbol` for just the `name` via a specific
    // node.
    return toTextSpan(node.nameSpan);
  } else {
    return toTextSpan(node.sourceSpan);
  }
}

export function toTextSpan(span: AbsoluteSourceSpan|ParseSourceSpan|e.ParseSpan): ts.TextSpan {
  let start: number, end: number;
  if (span instanceof AbsoluteSourceSpan || span instanceof e.ParseSpan) {
    start = span.start;
    end = span.end;
  } else {
    start = span.start.offset;
    end = span.end.offset;
  }
  return {start, length: end - start};
}

interface NodeWithKeyAndValue extends t.Node {
  keySpan: ParseSourceSpan;
  valueSpan?: ParseSourceSpan;
}

export function isTemplateNodeWithKeyAndValue(node: t.Node|e.AST): node is NodeWithKeyAndValue {
  return isTemplateNode(node) && node.hasOwnProperty('keySpan');
}

export function isWithinKey(position: number, node: NodeWithKeyAndValue): boolean {
  let {keySpan, valueSpan} = node;
  if (valueSpan === undefined && node instanceof TmplAstBoundEvent) {
    valueSpan = node.handlerSpan;
  }
  const isWithinKeyValue =
      isWithin(position, keySpan) || !!(valueSpan && isWithin(position, valueSpan));
  return isWithinKeyValue;
}

export function isWithinKeyValue(position: number, node: NodeWithKeyAndValue): boolean {
  let {keySpan, valueSpan} = node;
  if (valueSpan === undefined && node instanceof TmplAstBoundEvent) {
    valueSpan = node.handlerSpan;
  }
  const isWithinKeyValue =
      isWithin(position, keySpan) || !!(valueSpan && isWithin(position, valueSpan));
  return isWithinKeyValue;
}

export function isTemplateNode(node: t.Node|e.AST): node is t.Node {
  // Template node implements the Node interface so we cannot use instanceof.
  return node.sourceSpan instanceof ParseSourceSpan;
}

export function isExpressionNode(node: t.Node|e.AST): node is e.AST {
  return node instanceof e.AST;
}

export interface TemplateInfo {
  template: t.Node[];
  component: ts.ClassDeclaration;
}

function getInlineTemplateInfoAtPosition(
    sf: ts.SourceFile, position: number, compiler: NgCompiler): TemplateInfo|undefined {
  const expression = findTightestNode(sf, position);
  if (expression === undefined) {
    return undefined;
  }
  const classDecl = getParentClassDeclaration(expression);
  if (classDecl === undefined) {
    return undefined;
  }

  // Return `undefined` if the position is not on the template expression or the template resource
  // is not inline.
  const resources = compiler.getComponentResources(classDecl);
  if (resources === null || isExternalResource(resources.template) ||
      expression !== resources.template.expression) {
    return undefined;
  }

  const template = compiler.getTemplateTypeChecker().getTemplate(classDecl);
  if (template === null) {
    return undefined;
  }

  return {template, component: classDecl};
}

/**
 * Retrieves the `ts.ClassDeclaration` at a location along with its template nodes.
 */
export function getTemplateInfoAtPosition(
    fileName: string, position: number, compiler: NgCompiler): TemplateInfo|undefined {
  if (isTypeScriptFile(fileName)) {
    const sf = compiler.getCurrentProgram().getSourceFile(fileName);
    if (sf === undefined) {
      return undefined;
    }

    return getInlineTemplateInfoAtPosition(sf, position, compiler);
  } else {
    return getFirstComponentForTemplateFile(fileName, compiler);
  }
}

/**
 * First, attempt to sort component declarations by file name.
 * If the files are the same, sort by start location of the declaration.
 */
function tsDeclarationSortComparator(a: DeclarationNode, b: DeclarationNode): number {
  const aFile = a.getSourceFile().fileName;
  const bFile = b.getSourceFile().fileName;
  if (aFile < bFile) {
    return -1;
  } else if (aFile > bFile) {
    return 1;
  } else {
    return b.getFullStart() - a.getFullStart();
  }
}

function getFirstComponentForTemplateFile(fileName: string, compiler: NgCompiler): TemplateInfo|
    undefined {
  const templateTypeChecker = compiler.getTemplateTypeChecker();
  const components = compiler.getComponentsWithTemplateFile(fileName);
  const sortedComponents = Array.from(components).sort(tsDeclarationSortComparator);
  for (const component of sortedComponents) {
    if (!ts.isClassDeclaration(component)) {
      continue;
    }
    const template = templateTypeChecker.getTemplate(component);
    if (template === null) {
      continue;
    }
    return {template, component};
  }

  return undefined;
}

/**
 * Given an attribute node, converts it to string form.
 */
function toAttributeString(attribute: t.TextAttribute|t.BoundAttribute|t.BoundEvent): string {
  if (attribute instanceof t.BoundEvent || attribute instanceof t.BoundAttribute) {
    return `[${attribute.name}]`;
  } else {
    return `[${attribute.name}=${attribute.valueSpan?.toString() ?? ''}]`;
  }
}

function getNodeName(node: t.Template|t.Element): string {
  return node instanceof t.Template ? node.tagName : node.name;
}

/**
 * Given a template or element node, returns all attributes on the node.
 */
function getAttributes(node: t.Template|
                       t.Element): Array<t.TextAttribute|t.BoundAttribute|t.BoundEvent> {
  const attributes: Array<t.TextAttribute|t.BoundAttribute|t.BoundEvent> =
      [...node.attributes, ...node.inputs, ...node.outputs];
  if (node instanceof t.Template) {
    attributes.push(...node.templateAttrs);
  }
  return attributes;
}

/**
 * Given two `Set`s, returns all items in the `left` which do not appear in the `right`.
 */
function difference<T>(left: Set<T>, right: Set<T>): Set<T> {
  const result = new Set<T>();
  for (const dir of left) {
    if (!right.has(dir)) {
      result.add(dir);
    }
  }
  return result;
}

/**
 * Given an element or template, determines which directives match because the tag is present. For
 * example, if a directive selector is `div[myAttr]`, this would match div elements but would not if
 * the selector were just `[myAttr]`. We find which directives are applied because of this tag by
 * elimination: compare the directive matches with the tag present against the directive matches
 * without it. The difference would be the directives which match because the tag is present.
 *
 * @param element The element or template node that the attribute/tag is part of.
 * @param directives The list of directives to match against.
 * @returns The list of directives matching the tag name via the strategy described above.
 */
// TODO(atscott): Add unit tests for this and the one for attributes
export function getDirectiveMatchesForElementTag(
    element: t.Template|t.Element, directives: DirectiveSymbol[]): Set<DirectiveSymbol> {
  const attributes = getAttributes(element);
  const allAttrs = attributes.map(toAttributeString);
  const allDirectiveMatches =
      getDirectiveMatchesForSelector(directives, getNodeName(element) + allAttrs.join(''));
  const matchesWithoutElement = getDirectiveMatchesForSelector(directives, allAttrs.join(''));
  return difference(allDirectiveMatches, matchesWithoutElement);
}


export function makeElementSelector(element: t.Element|t.Template): string {
  const attributes = getAttributes(element);
  const allAttrs = attributes.map(toAttributeString);
  return getNodeName(element) + allAttrs.join('');
}

/**
 * Given an attribute name, determines which directives match because the attribute is present. We
 * find which directives are applied because of this attribute by elimination: compare the directive
 * matches with the attribute present against the directive matches without it. The difference would
 * be the directives which match because the attribute is present.
 *
 * @param name The name of the attribute
 * @param hostNode The node which the attribute appears on
 * @param directives The list of directives to match against.
 * @returns The list of directives matching the tag name via the strategy described above.
 */
export function getDirectiveMatchesForAttribute(
    name: string, hostNode: t.Template|t.Element,
    directives: DirectiveSymbol[]): Set<DirectiveSymbol> {
  const attributes = getAttributes(hostNode);
  const allAttrs = attributes.map(toAttributeString);
  const allDirectiveMatches =
      getDirectiveMatchesForSelector(directives, getNodeName(hostNode) + allAttrs.join(''));
  const attrsExcludingName = attributes.filter(a => a.name !== name).map(toAttributeString);
  const matchesWithoutAttr = getDirectiveMatchesForSelector(
      directives, getNodeName(hostNode) + attrsExcludingName.join(''));
  return difference(allDirectiveMatches, matchesWithoutAttr);
}

/**
 * Given a list of directives and a text to use as a selector, returns the directives which match
 * for the selector.
 */
function getDirectiveMatchesForSelector(
    directives: DirectiveSymbol[], selector: string): Set<DirectiveSymbol> {
  const selectors = CssSelector.parse(selector);
  if (selectors.length === 0) {
    return new Set();
  }
  return new Set(directives.filter((dir: DirectiveSymbol) => {
    if (dir.selector === null) {
      return false;
    }

    const matcher = new SelectorMatcher();
    matcher.addSelectables(CssSelector.parse(dir.selector));

    return selectors.some(selector => matcher.match(selector, null));
  }));
}

/**
 * Returns a new `ts.SymbolDisplayPart` array which has the alias imports from the tcb filtered
 * out, i.e. `i0.NgForOf`.
 */
export function filterAliasImports(displayParts: ts.SymbolDisplayPart[]): ts.SymbolDisplayPart[] {
  const tcbAliasImportRegex = /i\d+/;
  function isImportAlias(part: {kind: string, text: string}) {
    return part.kind === ALIAS_NAME && tcbAliasImportRegex.test(part.text);
  }
  function isDotPunctuation(part: {kind: string, text: string}) {
    return part.kind === SYMBOL_PUNC && part.text === '.';
  }

  return displayParts.filter((part, i) => {
    const previousPart = displayParts[i - 1];
    const nextPart = displayParts[i + 1];

    const aliasNameFollowedByDot =
        isImportAlias(part) && nextPart !== undefined && isDotPunctuation(nextPart);
    const dotPrecededByAlias =
        isDotPunctuation(part) && previousPart !== undefined && isImportAlias(previousPart);

    return !aliasNameFollowedByDot && !dotPrecededByAlias;
  });
}

export function isDollarEvent(n: t.Node|e.AST): n is e.PropertyRead {
  return n instanceof e.PropertyRead && n.name === '$event' &&
      n.receiver instanceof e.ImplicitReceiver && !(n.receiver instanceof e.ThisReceiver);
}

/**
 * Returns a new array formed by applying a given callback function to each element of the array,
 * and then flattening the result by one level.
 */
export function flatMap<T, R>(items: T[]|readonly T[], f: (item: T) => R[] | readonly R[]): R[] {
  const results: R[] = [];
  for (const x of items) {
    results.push(...f(x));
  }
  return results;
}

export function isTypeScriptFile(fileName: string): boolean {
  return fileName.endsWith('.ts');
}

export function isExternalTemplate(fileName: string): boolean {
  return !isTypeScriptFile(fileName);
}

export function isWithin(position: number, span: AbsoluteSourceSpan|ParseSourceSpan): boolean {
  let start: number, end: number;
  if (span instanceof ParseSourceSpan) {
    start = span.start.offset;
    end = span.end.offset;
  } else {
    start = span.start;
    end = span.end;
  }
  // Note both start and end are inclusive because we want to match conditions
  // like ¦start and end¦ where ¦ is the cursor.
  return start <= position && position <= end;
}

/**
 * For a given location in a shim file, retrieves the corresponding file url for the template and
 * the span in the template.
 */
export function getTemplateLocationFromShimLocation(
    templateTypeChecker: TemplateTypeChecker, shimPath: AbsoluteFsPath,
    positionInShimFile: number): {templateUrl: AbsoluteFsPath, span: ParseSourceSpan}|null {
  const mapping =
      templateTypeChecker.getTemplateMappingAtShimLocation({shimPath, positionInShimFile});
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
    // This includes indirect mappings, which are difficult to map directly to the code
    // location. Diagnostics similarly return a synthetic template string for this case rather
    // than a real location.
    return null;
  }
  return {templateUrl, span};
}
