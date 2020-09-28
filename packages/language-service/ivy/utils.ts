/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteSourceSpan, AST, BindingPipe, CssSelector, MethodCall, ParseSourceSpan, PropertyRead, PropertyWrite, SelectorMatcher, TmplAstBoundAttribute, TmplAstElement, TmplAstNode, TmplAstTemplate, TmplAstTextAttribute, TmplAstVariable,} from '@angular/compiler';
import {DirectiveSymbol, TemplateTypeChecker} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import * as e from '@angular/compiler/src/expression_parser/ast';
import * as t from '@angular/compiler/src/render3/r3_ast';
import {ALIAS_NAME, SYMBOL_PUNC} from '@angular/language-service/src/hover';
import * as ts from 'typescript';

/**
 * Given a list of directives and a text to use as a selector, returns the directives which match
 * for the selector.
 */
export function getDirectiveMatches(
    directives: DirectiveSymbol[], selector: string): DirectiveSymbol[] {
  const selectorToMatch = CssSelector.parse(selector);
  if (selectorToMatch.length === 0) {
    return [];
  }
  return directives.filter((dir: DirectiveSymbol) => {
    if (dir.selector === null) {
      return false;
    }

    const matcher = new SelectorMatcher();
    matcher.addSelectables(CssSelector.parse(dir.selector));

    return matcher.match(selectorToMatch[0], null);
  });
}

export function getTextSpanOfNode(node: TmplAstNode|AST) {
  if (isTemplateNode(node)) {
    const spanToUse = (node instanceof TmplAstBoundAttribute || node instanceof TmplAstVariable) ?
        node.keySpan :
        node.sourceSpan;
    return toTextSpan(spanToUse);
  } else if (
      node instanceof PropertyWrite || node instanceof MethodCall || node instanceof BindingPipe ||
      node instanceof PropertyRead) {
    // The `name` part of a `PropertyWrite`, `MethodCall`, and `BindingPipe` does not
    // have its own AST so there is no way to retrieve a `Symbol` for just the `name` via a specific
    // node.
    return toTextSpan(node.nameSpan);
  } else {
    return toTextSpan(node.sourceSpan);
  }
}

export function toTextSpan(span: AbsoluteSourceSpan|ParseSourceSpan) {
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

export function isTemplateNode(node: TmplAstNode|AST): node is TmplAstNode {
  // Template node implements the Node interface so we cannot use instanceof.
  return node.sourceSpan instanceof ParseSourceSpan;
}

export function isExpressionNode(node: t.Node|e.AST): node is e.AST {
  return node instanceof e.AST;
}

/**
 * Retrieves the `ts.ClassDeclaration` at a location along with its template nodes.
 */
export function getTemplateInfoAtPosition(
    fileName: string, position: number, program: ts.Program,
    templateTypeChecker: TemplateTypeChecker):
    {template: TmplAstNode[], component: ts.ClassDeclaration}|undefined {
  if (fileName.endsWith('.ts')) {
    return getInlineTemplateInfoAtPosition(fileName, position, program, templateTypeChecker);
  } else {
    throw new Error('Ivy LS currently does not support external templates.');
  }
}

/**
 * Retrieves the `ts.ClassDeclaration` at a location along with its template nodes.
 */
function getInlineTemplateInfoAtPosition(
    fileName: string, position: number, program: ts.Program,
    templateTypeChecker: TemplateTypeChecker):
    {template: TmplAstNode[], component: ts.ClassDeclaration}|undefined {
  const sourceFile = program.getSourceFile(fileName);
  if (!sourceFile) {
    return undefined;
  }

  for (const statement of sourceFile.statements) {
    if (!ts.isClassDeclaration(statement) || position < statement.pos || position > statement.end) {
      continue;
    }

    const template = templateTypeChecker.getTemplate(statement);
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
 * @param attribute The attribute name to use for directive matching
 * @param hostNode The element or template node that the attribute is on
 * @param directives The list of directives to match against
 */
export function getDirectiveMatchesForAttribute(
    attribute: string, hostNode: TmplAstTemplate|TmplAstElement, directives: DirectiveSymbol[]) {
  let attributes: Array<TmplAstTextAttribute|TmplAstBoundAttribute> =
      [...hostNode.attributes, ...hostNode.inputs];
  if (hostNode instanceof TmplAstTemplate) {
    attributes = [...attributes, ...hostNode.templateAttrs];
  }
  const toAttributeString = (a: TmplAstTextAttribute|TmplAstBoundAttribute) =>
      `[${a.name}=${a.valueSpan?.toString() ?? ''}]`;
  const attrs = attributes.map(a => toAttributeString(a));
  const attrsOmit = attributes.map(a => a.name === attribute ? '' : toAttributeString(a));

  const hostNodeName = hostNode instanceof TmplAstTemplate ? hostNode.tagName : hostNode.name;
  const directivesWithAttribute = getDirectiveMatches(directives, hostNodeName + attrs.join(''));
  const directivesWithoutAttribute =
      getDirectiveMatches(directives, hostNodeName + attrsOmit.join(''));
  return directivesWithAttribute.filter(d => !directivesWithoutAttribute.some(s => s === d));
}

/**
 * Returns a new `ts.SymbolDisplayPart` array which has the alias imports from the tcb filtered
 * out, i.e. `i0.NgForOf`.
 */
export function filterAliasImports(displayParts: ts.SymbolDisplayPart[]) {
  return displayParts.filter((part, i) => {
    const tcbAliasImportRegex = /i\d+/;
    const previousPart = displayParts![i - 1];
    const nextPart = displayParts![i + 1];
    const isImportAlias = (p: {kind: string, text: string}) =>
        p.kind === ALIAS_NAME && p.text.match(tcbAliasImportRegex) !== null;
    const isDotPunctuation = (p: {kind: string, text: string}) =>
        p.kind === SYMBOL_PUNC && p.text === '.';

    const aliasNameFollowedByDot =
        isImportAlias(part) && nextPart !== undefined && isDotPunctuation(nextPart);
    const dotPrecededByAlias =
        isDotPunctuation(part) && previousPart !== undefined && isImportAlias(previousPart);

    return !aliasNameFollowedByDot && !dotPrecededByAlias;
  });
}
