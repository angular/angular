/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
  CssSelector,
  SelectorMatcher,
  TmplAstTemplate,
  TmplAstElement,
  TmplAstTextAttribute,
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
  PropertyRead,
  BindingPipe,
  LiteralPrimitive,
  AST,
  ASTWithSource,
  EmptyExpr,
  TmplAstNode,
  ParseSourceSpan,
} from '@angular/compiler';

function toAttributeCssSelector(
  attribute: TmplAstTextAttribute | TmplAstBoundAttribute | TmplAstBoundEvent,
): string {
  let selector: string;
  if (attribute instanceof TmplAstBoundEvent || attribute instanceof TmplAstBoundAttribute) {
    selector = `[${attribute.name}]`;
  } else if (attribute.valueSpan !== undefined) {
    selector = `[${attribute.name}=${attribute.valueSpan.toString()}]`;
  } else {
    selector = `[${attribute.name}]`;
  }
  return selector.replace(/\$/g, '\\$');
}

function getNodeName(node: TmplAstTemplate | TmplAstElement): string {
  return node instanceof TmplAstTemplate ? (node.tagName ?? 'ng-template') : node.name;
}

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

function difference<T>(left: Set<T>, right: Set<T>): Set<T> {
  const result = new Set<T>();
  for (const dir of left) {
    if (!right.has(dir)) {
      result.add(dir);
    }
  }
  return result;
}

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
    return new Set();
  }
}

export function getDirectiveMatchesForAttribute(
  name: string,
  hostNode: TmplAstTemplate | TmplAstElement,
  directives: Array<{selector: string | null; tcbLocation?: {positionInFile: number}}>,
): Set<{selector: string | null; tcbLocation?: {positionInFile: number}}> {
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

interface NodeWithKeyAndValue extends TmplAstNode {
  keySpan: ParseSourceSpan;
  valueSpan?: ParseSourceSpan;
}

export function isTemplateNode(node: TmplAstNode | AST): node is TmplAstNode {
  // Template node implements the Node interface so we cannot use instanceof.
  return (node as any).sourceSpan instanceof ParseSourceSpan;
}

export function isTemplateNodeWithKeyAndValue(
  node: TmplAstNode | AST,
): node is NodeWithKeyAndValue {
  return isTemplateNode(node) && Object.hasOwn(node, 'keySpan');
}

// Note: This is based on Angular's `getTextSpanOfNode` in `packages/language-service/src/utils/index.ts`.
export function getTextSpanOfNode(
  node: TmplAstNode | AST,
): {start: number; length: number} | undefined {
  let span: any;
  if (isTemplateNodeWithKeyAndValue(node)) {
    span = node.keySpan;
  } else if (node instanceof PropertyRead || node instanceof BindingPipe) {
    span = node.nameSpan;
  } else {
    span = (node as any).sourceSpan;
  }

  if (!span) return undefined;

  let start: number, end: number;
  if ('start' in span && typeof span.start === 'number') {
    start = span.start;
    end = span.end;
  } else if ('start' in span && typeof span.start === 'object' && 'offset' in span.start) {
    start = span.start.offset;
    end = span.end.offset;
  } else {
    return undefined;
  }

  return {
    start,
    length: end - start,
  };
}

export interface ClassMetadata {
  hostBindings?: Array<{
    decoratorSpan?: {start: number; end: number};
  }>;
  hostListeners?: Array<{
    decoratorSpan?: {start: number; end: number};
  }>;
  component?: {
    hostProperties?: Array<{
      key: {sourceSpan?: {start: number; end: number}};
      value: {sourceSpan?: {start: number; end: number}};
    }>;
  };
  directive?: {
    hostProperties?: Array<{
      key: {sourceSpan?: {start: number; end: number}};
      value: {sourceSpan?: {start: number; end: number}};
    }>;
  };
}

export function isPositionInHostBinding(c: ClassMetadata, offset: number): boolean {
  for (const hb of c.hostBindings ?? []) {
    if (hb.decoratorSpan && offset >= hb.decoratorSpan.start && offset <= hb.decoratorSpan.end) {
      return true;
    }
  }

  for (const hl of c.hostListeners ?? []) {
    if (hl.decoratorSpan && offset >= hl.decoratorSpan.start && offset <= hl.decoratorSpan.end) {
      return true;
    }
  }

  // TODO: In reference Angular, components are a superset of directives and metadata is unified.
  // Our extracted metadata separates them, which forces us to check both here. This could be cleaned up.
  const hostProps = c.component?.hostProperties || c.directive?.hostProperties || [];
  for (const hp of hostProps) {
    if (hp.key.sourceSpan && offset >= hp.key.sourceSpan.start && offset <= hp.key.sourceSpan.end) {
      return true;
    }
    if (
      hp.value.sourceSpan &&
      offset >= hp.value.sourceSpan.start &&
      offset <= hp.value.sourceSpan.end
    ) {
      return true;
    }
  }

  return false;
}

export async function canonicalizePath(filePath: string): Promise<string> {
  try {
    const p = filePath.replace(/\\/g, '/');
    try {
      return (await fs.realpath(p)).replace(/\\/g, '/');
    } catch {
      const dir = path.dirname(p);
      try {
        const realDir = (await fs.realpath(dir)).replace(/\\/g, '/');
        return path.join(realDir, path.basename(p)).replace(/\\/g, '/');
      } catch {
        return p;
      }
    }
  } catch {
    return filePath;
  }
}

export function makeElementSelector(element: TmplAstElement | TmplAstTemplate): string {
  let elementSelector = getNodeName(element);
  const attributes = getAttributes(element);
  for (const attr of attributes) {
    elementSelector += toAttributeCssSelector(attr);
  }
  return elementSelector;
}

export function isWithin(
  position: number,
  span: ParseSourceSpan | {start: number | {offset: number}; end: number | {offset: number}},
): boolean {
  const start = typeof span.start === 'number' ? span.start : span.start.offset;
  const end = typeof span.end === 'number' ? span.end : span.end.offset;
  return start <= position && position < end;
}

export function isBoundEventWithSyntheticHandler(event: TmplAstBoundEvent): boolean {
  let handler: AST = event.handler;
  if (handler instanceof ASTWithSource) {
    handler = handler.ast;
  }
  if (handler instanceof LiteralPrimitive && handler.value === 'ERROR') {
    return true;
  }
  if (handler instanceof EmptyExpr) {
    return true;
  }
  return false;
}
