/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileDirectiveSummary, CompileTypeMetadata, identifierName} from '@angular/compiler';
import {ParseSourceSpan} from '@angular/compiler/src/parse_util';
import {CssSelector, SelectorMatcher} from '@angular/compiler/src/selector';

import {SelectorInfo, TemplateInfo} from './common';
import {Span} from './types';

export interface SpanHolder {
  sourceSpan: ParseSourceSpan;
  endSourceSpan?: ParseSourceSpan;
  children?: SpanHolder[];
}

export function isParseSourceSpan(value: any): value is ParseSourceSpan {
  return value && !!value.start;
}

export function spanOf(span?: SpanHolder | ParseSourceSpan): Span {
  if (!span) return undefined;
  if (isParseSourceSpan(span)) {
    return {start: span.start.offset, end: span.end.offset};
  } else {
    if (span.endSourceSpan) {
      return {start: span.sourceSpan.start.offset, end: span.endSourceSpan.end.offset};
    } else if (span.children && span.children.length) {
      return {
        start: span.sourceSpan.start.offset,
        end: spanOf(span.children[span.children.length - 1]).end
      };
    }
    return {start: span.sourceSpan.start.offset, end: span.sourceSpan.end.offset};
  }
}

export function inSpan(position: number, span?: Span, exclusive?: boolean): boolean {
  return span && exclusive ? position >= span.start && position < span.end :
                             position >= span.start && position <= span.end;
}

export function offsetSpan(span: Span, amount: number): Span {
  return {start: span.start + amount, end: span.end + amount};
}

export function isNarrower(spanA: Span, spanB: Span): boolean {
  return spanA.start >= spanB.start && spanA.end <= spanB.end;
}

export function hasTemplateReference(type: CompileTypeMetadata): boolean {
  if (type.diDeps) {
    for (let diDep of type.diDeps) {
      if (diDep.token.identifier && identifierName(diDep.token.identifier) == 'TemplateRef')
        return true;
    }
  }
  return false;
}

export function getSelectors(info: TemplateInfo): SelectorInfo {
  const map = new Map<CssSelector, CompileDirectiveSummary>();
  const selectors = flatten(info.directives.map(directive => {
    const selectors = CssSelector.parse(directive.selector);
    selectors.forEach(selector => map.set(selector, directive));
    return selectors;
  }));
  return {selectors, map};
}

export function flatten<T>(a: T[][]) {
  return (<T[]>[]).concat(...a);
}

export function removeSuffix(value: string, suffix: string) {
  if (value.endsWith(suffix)) return value.substring(0, value.length - suffix.length);
  return value;
}

export function uniqueByName < T extends {
  name: string;
}
> (elements: T[] | undefined): T[]|undefined {
  if (elements) {
    const result: T[] = [];
    const set = new Set<string>();
    for (const element of elements) {
      if (!set.has(element.name)) {
        set.add(element.name);
        result.push(element);
      }
    }
    return result;
  }
}
