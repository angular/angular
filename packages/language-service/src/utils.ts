/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AstPath, CompileDirectiveSummary, CompileTypeMetadata, CssSelector, DirectiveAst, ElementAst, EmbeddedTemplateAst, HtmlAstPath, Node as HtmlNode, ParseSourceSpan, RecursiveTemplateAstVisitor, RecursiveVisitor, TemplateAst, TemplateAstPath, identifierName, templateVisitAll, visitAll} from '@angular/compiler';
import {DiagnosticTemplateInfo} from '@angular/compiler-cli';
import * as ts from 'typescript';

import {SelectorInfo, TemplateInfo} from './common';
import {Span} from './types';

export interface SpanHolder {
  sourceSpan: ParseSourceSpan;
  endSourceSpan?: ParseSourceSpan|null;
  children?: SpanHolder[];
}

export function isParseSourceSpan(value: any): value is ParseSourceSpan {
  return value && !!value.start;
}

export function spanOf(span: SpanHolder): Span;
export function spanOf(span: ParseSourceSpan): Span;
export function spanOf(span: SpanHolder | ParseSourceSpan | undefined): Span|undefined;
export function spanOf(span?: SpanHolder | ParseSourceSpan): Span|undefined {
  if (!span) return undefined;
  if (isParseSourceSpan(span)) {
    return {start: span.start.offset, end: span.end.offset};
  } else {
    if (span.endSourceSpan) {
      return {start: span.sourceSpan.start.offset, end: span.endSourceSpan.end.offset};
    } else if (span.children && span.children.length) {
      return {
        start: span.sourceSpan.start.offset,
        end: spanOf(span.children[span.children.length - 1]) !.end
      };
    }
    return {start: span.sourceSpan.start.offset, end: span.sourceSpan.end.offset};
  }
}

export function inSpan(position: number, span?: Span, exclusive?: boolean): boolean {
  return span != null && (exclusive ? position >= span.start && position < span.end :
                                      position >= span.start && position <= span.end);
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
      if (diDep.token && diDep.token.identifier &&
          identifierName(diDep.token !.identifier !) == 'TemplateRef')
        return true;
    }
  }
  return false;
}

export function getSelectors(info: TemplateInfo): SelectorInfo {
  const map = new Map<CssSelector, CompileDirectiveSummary>();
  const selectors: CssSelector[] = flatten(info.directives.map(directive => {
    const selectors: CssSelector[] = CssSelector.parse(directive.selector !);
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

export function isTypescriptVersion(low: string, high?: string) {
  const version = ts.version;

  if (version.substring(0, low.length) < low) return false;

  if (high && (version.substring(0, high.length) > high)) return false;

  return true;
}

export function diagnosticInfoFromTemplateInfo(info: TemplateInfo): DiagnosticTemplateInfo {
  return {
    fileName: info.fileName,
    offset: info.template.span.start,
    query: info.template.query,
    members: info.template.members,
    htmlAst: info.htmlAst,
    templateAst: info.templateAst
  };
}

export function findTemplateAstAt(
    ast: TemplateAst[], position: number, allowWidening: boolean = false): TemplateAstPath {
  const path: TemplateAst[] = [];
  const visitor = new class extends RecursiveTemplateAstVisitor {
    visit(ast: TemplateAst, context: any): any {
      let span = spanOf(ast);
      if (inSpan(position, span)) {
        const len = path.length;
        if (!len || allowWidening || isNarrower(span, spanOf(path[len - 1]))) {
          path.push(ast);
        }
      } else {
        // Returning a value here will result in the children being skipped.
        return true;
      }
    }

    visitEmbeddedTemplate(ast: EmbeddedTemplateAst, context: any): any {
      return this.visitChildren(context, visit => {
        // Ignore reference, variable and providers
        visit(ast.attrs);
        visit(ast.directives);
        visit(ast.children);
      });
    }

    visitElement(ast: ElementAst, context: any): any {
      return this.visitChildren(context, visit => {
        // Ingnore providers
        visit(ast.attrs);
        visit(ast.inputs);
        visit(ast.outputs);
        visit(ast.references);
        visit(ast.directives);
        visit(ast.children);
      });
    }

    visitDirective(ast: DirectiveAst, context: any): any {
      // Ignore the host properties of a directive
      const result = this.visitChildren(context, visit => { visit(ast.inputs); });
      // We never care about the diretive itself, just its inputs.
      if (path[path.length - 1] == ast) {
        path.pop();
      }
      return result;
    }
  };

  templateVisitAll(visitor, ast);

  return new AstPath<TemplateAst>(path, position);
}
