/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  AbsoluteSourceSpan,
  AST,
  ASTWithSource,
  BindingPipe,
  CssSelector,
  ImplicitReceiver,
  LiteralPrimitive,
  ParseSourceSpan,
  ParseSpan,
  PropertyRead,
  SelectorMatcher,
  ThisReceiver,
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
  TmplAstElement,
  TmplAstNode,
  TmplAstTemplate,
  TmplAstTextAttribute,
} from '@angular/compiler';
import {
  absoluteFrom,
  absoluteFromSourceFile,
  AbsoluteFsPath,
  DeclarationNode,
  DirectiveSymbol,
  isExternalResource,
  NgCompiler,
  TemplateTypeChecker,
} from '@angular/compiler-cli';
import ts from 'typescript';

import {
  ALIAS_NAME,
  createDisplayParts,
  DisplayInfoKind,
  SYMBOL_PUNC,
  unsafeCastDisplayInfoKindToScriptElementKind,
} from './display_parts';
import {findTightestNode, getParentClassDeclaration} from './ts_utils';

export function getTextSpanOfNode(node: TmplAstNode | AST): ts.TextSpan {
  if (isTemplateNodeWithKeyAndValue(node)) {
    return toTextSpan(node.keySpan);
  } else if (node instanceof BindingPipe || node instanceof PropertyRead) {
    // The `name` part of a `PropertyRead` and `BindingPipe` does not have its own AST
    // so there is no way to retrieve a `Symbol` for just the `name` via a specific node.
    return toTextSpan(node.nameSpan);
  } else {
    return toTextSpan(node.sourceSpan);
  }
}

export function toTextSpan(span: AbsoluteSourceSpan | ParseSourceSpan | ParseSpan): ts.TextSpan {
  let start: number, end: number;
  if (span instanceof AbsoluteSourceSpan || span instanceof ParseSpan) {
    start = span.start;
    end = span.end;
  } else {
    start = span.start.offset;
    end = span.end.offset;
  }
  return {start, length: end - start};
}

interface NodeWithKeyAndValue extends TmplAstNode {
  keySpan: ParseSourceSpan;
  valueSpan?: ParseSourceSpan;
}

export function isTemplateNodeWithKeyAndValue(
  node: TmplAstNode | AST,
): node is NodeWithKeyAndValue {
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

export function isTemplateNode(node: TmplAstNode | AST): node is TmplAstNode {
  // Template node implements the Node interface so we cannot use instanceof.
  return node.sourceSpan instanceof ParseSourceSpan;
}

export function isExpressionNode(node: TmplAstNode | AST): node is AST {
  return node instanceof AST;
}

export interface TypeCheckInfo {
  nodes: TmplAstNode[];
  declaration: ts.ClassDeclaration;
}

function getInlineTypeCheckInfoAtPosition(
  sf: ts.SourceFile,
  position: number,
  compiler: NgCompiler,
): TypeCheckInfo | undefined {
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
  const resources = compiler.getDirectiveResources(classDecl);
  if (resources === null) {
    return undefined;
  }

  if (
    resources.template !== null &&
    !isExternalResource(resources.template) &&
    expression === resources.template.node
  ) {
    const template = compiler.getTemplateTypeChecker().getTemplate(classDecl);
    if (template === null) {
      return undefined;
    }

    return {nodes: template, declaration: classDecl};
  }

  if (resources.hostBindings !== null) {
    const start = expression.getStart();
    const end = expression.getEnd();

    for (const binding of resources.hostBindings) {
      if (
        !isExternalResource(binding) &&
        start >= binding.node.getStart() &&
        end <= binding.node.getEnd()
      ) {
        const hostElement = compiler.getTemplateTypeChecker().getHostElement(classDecl);

        if (hostElement !== null) {
          return {nodes: [hostElement], declaration: classDecl};
        }
      }
    }
  }

  return undefined;
}

/**
 * Retrieves the `ts.ClassDeclaration` at a location along with its template AST nodes.
 */
export function getTypeCheckInfoAtPosition(
  fileName: string,
  position: number,
  compiler: NgCompiler,
): TypeCheckInfo | undefined {
  if (isTypeScriptFile(fileName)) {
    const sf = compiler.getCurrentProgram().getSourceFile(fileName);
    if (sf === undefined) {
      return undefined;
    }

    return getInlineTypeCheckInfoAtPosition(sf, position, compiler);
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

export function getFirstComponentForTemplateFile(
  fileName: string,
  compiler: NgCompiler,
): TypeCheckInfo | undefined {
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
    return {nodes: template, declaration: component};
  }

  return undefined;
}

/**
 * Given an attribute node, converts it to string form for use as a CSS selector.
 */
function toAttributeCssSelector(
  attribute: TmplAstTextAttribute | TmplAstBoundAttribute | TmplAstBoundEvent,
): string {
  let selector: string;
  if (attribute instanceof TmplAstBoundEvent || attribute instanceof TmplAstBoundAttribute) {
    selector = `[${attribute.name}]`;
  } else {
    selector = `[${attribute.name}=${attribute.valueSpan?.toString() ?? ''}]`;
  }
  // Any dollar signs that appear in the attribute name and/or value need to be escaped because they
  // need to be taken as literal characters rather than special selector behavior of dollar signs in
  // CSS.
  return selector.replace(/\$/g, '\\$');
}

function getNodeName(node: TmplAstTemplate | TmplAstElement): string {
  return node instanceof TmplAstTemplate ? (node.tagName ?? 'ng-template') : node.name;
}

/**
 * Given a template or element node, returns all attributes on the node.
 */
function getAttributes(
  node: TmplAstTemplate | TmplAstElement,
): Array<TmplAstTextAttribute | TmplAstBoundAttribute | TmplAstBoundEvent> {
  const attributes: Array<TmplAstTextAttribute | TmplAstBoundAttribute | TmplAstBoundEvent> = [
    ...node.attributes,
    ...node.inputs,
    ...node.outputs,
  ];
  if (node instanceof TmplAstTemplate) {
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
export function getDirectiveMatchesForElementTag<T extends {selector: string | null}>(
  element: TmplAstTemplate | TmplAstElement,
  directives: T[],
): Set<T> {
  const attributes = getAttributes(element);
  const allAttrs = attributes.map(toAttributeCssSelector);
  const allDirectiveMatches = getDirectiveMatchesForSelector(
    directives,
    getNodeName(element) + allAttrs.join(''),
  );
  const matchesWithoutElement = getDirectiveMatchesForSelector(directives, allAttrs.join(''));
  return difference(allDirectiveMatches, matchesWithoutElement);
}

export function makeElementSelector(element: TmplAstElement | TmplAstTemplate): string {
  const attributes = getAttributes(element);
  const allAttrs = attributes.map(toAttributeCssSelector);
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
  name: string,
  hostNode: TmplAstTemplate | TmplAstElement,
  directives: DirectiveSymbol[],
): Set<DirectiveSymbol> {
  const attributes = getAttributes(hostNode);
  const allAttrs = attributes.map(toAttributeCssSelector);
  const allDirectiveMatches = getDirectiveMatchesForSelector(
    directives,
    getNodeName(hostNode) + allAttrs.join(''),
  );
  const attrsExcludingName = attributes.filter((a) => a.name !== name).map(toAttributeCssSelector);
  const matchesWithoutAttr = getDirectiveMatchesForSelector(
    directives,
    getNodeName(hostNode) + attrsExcludingName.join(''),
  );
  return difference(allDirectiveMatches, matchesWithoutAttr);
}

/**
 * Given a list of directives and a text to use as a selector, returns the directives which match
 * for the selector.
 */
function getDirectiveMatchesForSelector<T extends {selector: string | null}>(
  directives: T[],
  selector: string,
): Set<T> {
  try {
    const selectors = CssSelector.parse(selector);
    if (selectors.length === 0) {
      return new Set();
    }
    return new Set(
      directives.filter((dir: T) => {
        if (dir.selector === null) {
          return false;
        }

        const matcher = new SelectorMatcher();
        matcher.addSelectables(CssSelector.parse(dir.selector));

        return selectors.some((selector) => matcher.match(selector, null));
      }),
    );
  } catch {
    // An invalid selector may throw an error. There would be no directive matches for an invalid
    // selector.
    return new Set();
  }
}

/**
 * Returns a new `ts.SymbolDisplayPart` array which has the alias imports from the tcb filtered
 * out, i.e. `i0.NgForOf`.
 */
export function filterAliasImports(displayParts: ts.SymbolDisplayPart[]): ts.SymbolDisplayPart[] {
  const tcbAliasImportRegex = /i\d+/;
  function isImportAlias(part: {kind: string; text: string}) {
    return part.kind === ALIAS_NAME && tcbAliasImportRegex.test(part.text);
  }
  function isDotPunctuation(part: {kind: string; text: string}) {
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

export function isDollarEvent(n: TmplAstNode | AST): n is PropertyRead {
  return (
    n instanceof PropertyRead &&
    n.name === '$event' &&
    n.receiver instanceof ImplicitReceiver &&
    !(n.receiver instanceof ThisReceiver)
  );
}

export function isTypeScriptFile(fileName: string): boolean {
  return /\.[cm]?tsx?$/i.test(fileName);
}

export function isExternalTemplate(fileName: string): boolean {
  return !isTypeScriptFile(fileName);
}

export function isWithin(position: number, span: AbsoluteSourceSpan | ParseSourceSpan): boolean {
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
export function getTemplateLocationFromTcbLocation(
  templateTypeChecker: TemplateTypeChecker,
  tcbPath: AbsoluteFsPath,
  tcbIsShim: boolean,
  positionInFile: number,
): {templateUrl: AbsoluteFsPath; span: ParseSourceSpan} | null {
  const mapping = templateTypeChecker.getSourceMappingAtTcbLocation({
    tcbPath,
    isShimFile: tcbIsShim,
    positionInFile,
  });
  if (mapping === null) {
    return null;
  }
  const {sourceMapping, span} = mapping;

  let templateUrl: AbsoluteFsPath;
  if (sourceMapping.type === 'direct') {
    templateUrl = absoluteFromSourceFile(sourceMapping.node.getSourceFile());
  } else if (sourceMapping.type === 'external') {
    templateUrl = absoluteFrom(sourceMapping.templateUrl);
  } else {
    // This includes indirect mappings, which are difficult to map directly to the code
    // location. Diagnostics similarly return a synthetic template string for this case rather
    // than a real location.
    return null;
  }
  return {templateUrl, span};
}

export function isBoundEventWithSyntheticHandler(event: TmplAstBoundEvent): boolean {
  // An event binding with no value (e.g. `(event|)`) parses to a `BoundEvent` with a
  // `LiteralPrimitive` handler with value `'ERROR'`, as opposed to a property binding with no
  // value which has an `EmptyExpr` as its value. This is a synthetic node created by the binding
  // parser, and is not suitable to use for Language Service analysis. Skip it.
  //
  // TODO(alxhub): modify the parser to generate an `EmptyExpr` instead.
  let handler: AST = event.handler;
  if (handler instanceof ASTWithSource) {
    handler = handler.ast;
  }
  if (handler instanceof LiteralPrimitive && handler.value === 'ERROR') {
    return true;
  }
  return false;
}

/**
 * Construct a QuickInfo object taking into account its container and type.
 * @param name Name of the QuickInfo target
 * @param kind component, directive, pipe, etc.
 * @param textSpan span of the target
 * @param containerName either the Symbol's container or the NgModule that contains the directive
 * @param type user-friendly name of the type
 * @param documentation docstring or comment
 */
export function createQuickInfo(
  name: string,
  kind: DisplayInfoKind,
  textSpan: ts.TextSpan,
  containerName?: string,
  type?: string,
  documentation?: ts.SymbolDisplayPart[],
  tags?: ts.JSDocTagInfo[],
): ts.QuickInfo {
  const displayParts = createDisplayParts(name, kind, containerName, type);

  return {
    kind: unsafeCastDisplayInfoKindToScriptElementKind(kind),
    kindModifiers: ts.ScriptElementKindModifier.none,
    textSpan: textSpan,
    displayParts,
    documentation,
    tags,
  };
}
