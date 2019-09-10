/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgAnalyzedModules} from '@angular/compiler';
import {getTemplateExpressionDiagnostics} from '@angular/compiler-cli/src/language_services';
import * as path from 'path';
import * as ts from 'typescript';

import {AstResult} from './common';
import * as ng from './types';
import {TypeScriptServiceHost} from './typescript_host';
import {findPropertyValueOfType, findTightestNode, offsetSpan, spanOf} from './utils';

/**
 * Return diagnostic information for the parsed AST of the template.
 * @param ast contains HTML and template AST
 */
export function getTemplateDiagnostics(ast: AstResult): ng.Diagnostic[] {
  const results: ng.Diagnostic[] = [];
  const {parseErrors, templateAst, htmlAst, template} = ast;
  if (parseErrors) {
    results.push(...parseErrors.map(e => {
      return {
        kind: ng.DiagnosticKind.Error,
        span: offsetSpan(spanOf(e.span), template.span.start),
        message: e.msg,
      };
    }));
  }
  const expressionDiagnostics = getTemplateExpressionDiagnostics({
    templateAst: templateAst,
    htmlAst: htmlAst,
    offset: template.span.start,
    query: template.query,
    members: template.members,
  });
  results.push(...expressionDiagnostics);
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

/**
 * Creates an error for an impossible state with a certain message.
 */
function impossibleState(message: string): Error {
  return new Error(`Impossible state: ${message}`);
}

/**
 * Performs a variety diagnostics on directive declarations.
 *
 * @param declarations Angular directive declarations
 * @param modules NgModules in the project
 * @param host TypeScript service host used to perform TypeScript queries
 * @return diagnosed errors, if any
 */
export function getDeclarationDiagnostics(
    declarations: ng.Declaration[], modules: NgAnalyzedModules,
    host: Readonly<TypeScriptServiceHost>): ng.Diagnostic[] {
  const directives = new Set<ng.StaticSymbol>();
  for (const ngModule of modules.ngModules) {
    for (const directive of ngModule.declaredDirectives) {
      directives.add(directive.reference);
    }
  }

  const results: ng.Diagnostic[] = [];

  for (const declaration of declarations) {
    const {errors, metadata, type, declarationSpan} = declaration;

    const sf = host.getSourceFile(type.filePath);
    if (!sf) {
      throw impossibleState(`directive ${type.name} exists but has no source file`);
    }
    // TypeScript identifier of the directive declaration annotation (e.g. "Component" or
    // "Directive") on a directive class.
    const directiveIdentifier = findTightestNode(sf, declarationSpan.start);
    if (!directiveIdentifier) {
      throw impossibleState(`directive ${type.name} exists but has no identifier`);
    }

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
      } else if (templateUrl) {
        if (template) {
          results.push({
            kind: ng.DiagnosticKind.Error,
            message: `Component '${type.name}' must not have both template and templateUrl`,
            span: declarationSpan,
          });
        }

        // Find templateUrl value from the directive call expression, which is the parent of the
        // directive identifier.
        //
        // TODO: We should create an enum of the various properties a directive can have to use
        // instead of string literals. We can then perform a mass migration of all literal usages.
        const templateUrlNode = findPropertyValueOfType(
            directiveIdentifier.parent, 'templateUrl', ts.isStringLiteralLike);
        if (!templateUrlNode) {
          throw impossibleState(
              `templateUrl ${templateUrl} exists but its TypeScript node doesn't`);
        }

        results.push(...validateUrls([templateUrlNode], host.tsLsHost));
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
 * Checks that URLs on a directive point to a valid file.
 * Note that this diagnostic check may require a filesystem hit, and thus may be slower than other
 * checks.
 *
 * @param urls urls to check for validity
 * @param tsLsHost TS LS host used for querying filesystem information
 * @return diagnosed url errors, if any
 */
function validateUrls(
    urls: ts.StringLiteralLike[], tsLsHost: Readonly<ts.LanguageServiceHost>): ng.Diagnostic[] {
  if (!tsLsHost.fileExists) {
    return [];
  }

  const allErrors: ng.Diagnostic[] = [];
  // TODO(ayazhafiz): most of this logic can be unified with the logic in
  // definitions.ts#getUrlFromProperty. Create a utility function to be used by both.
  for (const urlNode of urls) {
    const curPath = urlNode.getSourceFile().fileName;
    const url = path.join(path.dirname(curPath), urlNode.text);
    if (tsLsHost.fileExists(url)) continue;

    allErrors.push({
      kind: ng.DiagnosticKind.Error,
      message: `URL does not point to a valid file`,
      // Exclude opening and closing quotes in the url span.
      span: {start: urlNode.getStart() + 1, end: urlNode.end - 1},
    });
  }
  return allErrors;
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
