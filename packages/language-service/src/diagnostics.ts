/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgAnalyzedModules} from '@angular/compiler';
import {getTemplateExpressionDiagnostics} from '@angular/compiler-cli/src/language_services';
import * as ts from 'typescript';

import {AstResult} from './common';
import * as ng from './types';
import {offsetSpan, spanOf} from './utils';

/**
 * Return diagnostic information for the parsed AST of the template.
 * @param template source of the template and class information
 * @param ast contains HTML and template AST
 */
export function getTemplateDiagnostics(
    template: ng.TemplateSource, ast: AstResult): ng.Diagnostic[] {
  const results: ng.Diagnostic[] = [];

  if (ast.parseErrors && ast.parseErrors.length) {
    results.push(...ast.parseErrors.map(e => {
      return {
        kind: ng.DiagnosticKind.Error,
        span: offsetSpan(spanOf(e.span), template.span.start),
        message: e.msg,
      };
    }));
  } else if (ast.templateAst && ast.htmlAst) {
    const expressionDiagnostics = getTemplateExpressionDiagnostics({
      templateAst: ast.templateAst,
      htmlAst: ast.htmlAst,
      offset: template.span.start,
      query: template.query,
      members: template.members,
    });
    results.push(...expressionDiagnostics);
  }
  if (ast.errors) {
    results.push(...ast.errors.map(e => {
      return {
        kind: e.kind,
        span: e.span || template.span,
        message: e.message,
      };
    }));
  }

  return results;
}

/**
 * Generate an error message that indicates a directive is not part of any
 * NgModule.
 * @param name class name
 * @param isComponent true if directive is an Angular Component
 */
function missingDirective(name: string, isComponent: boolean) {
  const type = isComponent ? 'Component' : 'Directive';
  return `${type} '${name}' is not included in a module and will not be ` +
      'available inside a template. Consider adding it to a NgModule declaration.';
}

export function getDeclarationDiagnostics(
    declarations: ng.Declaration[], modules: NgAnalyzedModules): ng.Diagnostic[] {
  const directives = new Set<ng.StaticSymbol>();
  for (const ngModule of modules.ngModules) {
    for (const directive of ngModule.declaredDirectives) {
      directives.add(directive.reference);
    }
  }

  const results: ng.Diagnostic[] = [];

  for (const declaration of declarations) {
    const {errors, metadata, type, declarationSpan} = declaration;
    for (const error of errors) {
      results.push({
        kind: ng.DiagnosticKind.Error,
        message: error.message,
        span: error.span,
      });
    }
    if (!metadata) {
      continue;  // declaration is not an Angular directive
    }
    if (metadata.isComponent) {
      if (!modules.ngModuleByPipeOrDirective.has(declaration.type)) {
        results.push({
          kind: ng.DiagnosticKind.Error,
          message: missingDirective(type.name, metadata.isComponent),
          span: declarationSpan,
        });
      }
      const {template, templateUrl} = metadata.template !;
      if (template === null && !templateUrl) {
        results.push({
          kind: ng.DiagnosticKind.Error,
          message: `Component '${type.name}' must have a template or templateUrl`,
          span: declarationSpan,
        });
      } else if (template && templateUrl) {
        results.push({
          kind: ng.DiagnosticKind.Error,
          message: `Component '${type.name}' must not have both template and templateUrl`,
          span: declarationSpan,
        });
      }
    } else if (!directives.has(declaration.type)) {
      results.push({
        kind: ng.DiagnosticKind.Error,
        message: missingDirective(type.name, metadata.isComponent),
        span: declarationSpan,
      });
    }
  }

  return results;
}

/**
 * Return a recursive data structure that chains diagnostic messages.
 * @param chain
 */
function chainDiagnostics(chain: ng.DiagnosticMessageChain): ts.DiagnosticMessageChain {
  return {
    messageText: chain.message,
    category: ts.DiagnosticCategory.Error,
    code: 0,
    next: chain.next ? chainDiagnostics(chain.next) : undefined
  };
}

/**
 * Convert ng.Diagnostic to ts.Diagnostic.
 * @param d diagnostic
 * @param file
 */
export function ngDiagnosticToTsDiagnostic(
    d: ng.Diagnostic, file: ts.SourceFile | undefined): ts.Diagnostic {
  return {
    file,
    start: d.span.start,
    length: d.span.end - d.span.start,
    messageText: typeof d.message === 'string' ? d.message : chainDiagnostics(d.message),
    category: ts.DiagnosticCategory.Error,
    code: 0,
    source: 'ng',
  };
}

/**
 * Return elements filtered by unique span.
 * @param elements
 */
export function uniqueBySpan<T extends{span: ng.Span}>(elements: T[]): T[] {
  const result: T[] = [];
  const map = new Map<number, Set<number>>();
  for (const element of elements) {
    const {span} = element;
    let set = map.get(span.start);
    if (!set) {
      set = new Set();
      map.set(span.start, set);
    }
    if (!set.has(span.end)) {
      set.add(span.end);
      result.push(element);
    }
  }
  return result;
}
