/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteSourceSpan, CssSelector, ParseSourceSpan, SelectorMatcher} from '@angular/compiler';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import {DirectiveSymbol} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import * as e from '@angular/compiler/src/expression_parser/ast';  // e for expression AST
import * as t from '@angular/compiler/src/render3/r3_ast';         // t for template AST
import * as ts from 'typescript';

import {ALIAS_NAME, SYMBOL_PUNC} from '../common/quick_info';

/**
 * Given a list of directives and a text to use as a selector, returns the directives which match
 * for the selector.
 */
export function getDirectiveMatches(
    directives: DirectiveSymbol[], selector: string): Set<DirectiveSymbol> {
  const selectorToMatch = CssSelector.parse(selector);
  if (selectorToMatch.length === 0) {
    return new Set();
  }
  return new Set(directives.filter((dir: DirectiveSymbol) => {
    if (dir.selector === null) {
      return false;
    }

    const matcher = new SelectorMatcher();
    matcher.addSelectables(CssSelector.parse(dir.selector));

    return matcher.match(selectorToMatch[0], null);
  }));
}

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

export function toTextSpan(span: AbsoluteSourceSpan|ParseSourceSpan): ts.TextSpan {
  let start: number, end: number;
  if (span instanceof AbsoluteSourceSpan) {
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

/**
 * Retrieves the `ts.ClassDeclaration` at a location along with its template nodes.
 */
export function getTemplateInfoAtPosition(
    fileName: string, position: number, compiler: NgCompiler): TemplateInfo|undefined {
  if (fileName.endsWith('.ts')) {
    return getInlineTemplateInfoAtPosition(fileName, position, compiler);
  } else {
    return getFirstComponentForTemplateFile(fileName, compiler);
  }
}


/**
 * First, attempt to sort component declarations by file name.
 * If the files are the same, sort by start location of the declaration.
 */
function tsDeclarationSortComparator(a: ts.Declaration, b: ts.Declaration): number {
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
 * Retrieves the `ts.ClassDeclaration` at a location along with its template nodes.
 */
function getInlineTemplateInfoAtPosition(
    fileName: string, position: number, compiler: NgCompiler): TemplateInfo|undefined {
  const sourceFile = compiler.getNextProgram().getSourceFile(fileName);
  if (!sourceFile) {
    return undefined;
  }

  // We only support top level statements / class declarations
  for (const statement of sourceFile.statements) {
    if (!ts.isClassDeclaration(statement) || position < statement.pos || position > statement.end) {
      continue;
    }

    const template = compiler.getTemplateTypeChecker().getTemplate(statement);
    if (template === null) {
      return undefined;
    }

    return {template, component: statement};
  }

  return undefined;
}

/**
 * Given an attribute name and the element or template the attribute appears on, determines which
 * directives match because the attribute is present. That is, we find which directives are applied
 * because of this attribute by elimination: compare the directive matches with the attribute
 * present against the directive matches without it. The difference would be the directives which
 * match because the attribute is present.
 *
 * @param attribute The attribute name to use for directive matching.
 * @param hostNode The element or template node that the attribute is on.
 * @param directives The list of directives to match against.
 * @returns The list of directives matching the attribute via the strategy described above.
 */
export function getDirectiveMatchesForAttribute(
    attribute: string, hostNode: t.Template|t.Element,
    directives: DirectiveSymbol[]): Set<DirectiveSymbol> {
  const attributes: Array<t.TextAttribute|t.BoundAttribute> =
      [...hostNode.attributes, ...hostNode.inputs];
  if (hostNode instanceof t.Template) {
    attributes.push(...hostNode.templateAttrs);
  }
  function toAttributeString(a: t.TextAttribute|t.BoundAttribute) {
    return `[${a.name}=${a.valueSpan?.toString() ?? ''}]`;
  }
  const attrs = attributes.map(toAttributeString);
  const attrsOmit = attributes.map(a => a.name === attribute ? '' : toAttributeString(a));

  const hostNodeName = hostNode instanceof t.Template ? hostNode.tagName : hostNode.name;
  const directivesWithAttribute = getDirectiveMatches(directives, hostNodeName + attrs.join(''));
  const directivesWithoutAttribute =
      getDirectiveMatches(directives, hostNodeName + attrsOmit.join(''));

  const result = new Set<DirectiveSymbol>();
  for (const dir of directivesWithAttribute) {
    if (!directivesWithoutAttribute.has(dir)) {
      result.add(dir);
    }
  }
  return result;
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
