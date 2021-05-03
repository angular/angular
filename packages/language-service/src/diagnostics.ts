/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgAnalyzedModules} from '@angular/compiler';
import * as ts from 'typescript';

import {createDiagnostic, Diagnostic} from './diagnostic_messages';
import {getTemplateExpressionDiagnostics} from './expression_diagnostics';
import {findPropertyValueOfType, findTightestNode} from './ts_utils';
import * as ng from './types';
import {TypeScriptServiceHost} from './typescript_host';
import {extractAbsoluteFilePath, offsetSpan, spanOf} from './utils';

/**
 * Return diagnostic information for the parsed AST of the template.
 * @param ast contains HTML and template AST
 */
export function getTemplateDiagnostics(ast: ng.AstResult): ng.Diagnostic[] {
  const {parseErrors, templateAst, htmlAst, template} = ast;
  if (parseErrors && parseErrors.length) {
    return parseErrors.map(e => {
      return {
        kind: ts.DiagnosticCategory.Error,
        span: offsetSpan(spanOf(e.span), template.span.start),
        message: e.msg,
      };
    });
  }
  return getTemplateExpressionDiagnostics({
    templateAst: templateAst,
    htmlAst: htmlAst,
    offset: template.span.start,
    query: template.query,
    members: template.members,
    source: ast.template.source,
  });
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
      host.error(`directive ${type.name} exists but has no source file`);
      return [];
    }
    // TypeScript identifier of the directive declaration annotation (e.g. "Component" or
    // "Directive") on a directive class.
    const directiveIdentifier = findTightestNode(sf, declarationSpan.start);
    if (!directiveIdentifier) {
      host.error(`directive ${type.name} exists but has no identifier`);
      return [];
    }

    for (const error of errors) {
      results.push({
        kind: ts.DiagnosticCategory.Error,
        message: error.message,
        span: error.span,
      });
    }

    if (!modules.ngModuleByPipeOrDirective.has(declaration.type)) {
      results.push(createDiagnostic(
          declarationSpan, Diagnostic.directive_not_in_module,
          metadata.isComponent ? 'Component' : 'Directive', type.name));
    }

    if (metadata.isComponent) {
      const {template, templateUrl, styleUrls} = metadata.template !;
      if (template === null && !templateUrl) {
        results.push(createDiagnostic(
            declarationSpan, Diagnostic.missing_template_and_templateurl, type.name));
      } else if (templateUrl) {
        if (template) {
          results.push(createDiagnostic(
              declarationSpan, Diagnostic.both_template_and_templateurl, type.name));
        }

        // Find templateUrl value from the directive call expression, which is the parent of the
        // directive identifier.
        //
        // TODO: We should create an enum of the various properties a directive can have to use
        // instead of string literals. We can then perform a mass migration of all literal usages.
        const templateUrlNode = findPropertyValueOfType(
            directiveIdentifier.parent, 'templateUrl', ts.isLiteralExpression);
        if (!templateUrlNode) {
          host.error(`templateUrl ${templateUrl} exists but its TypeScript node doesn't`);
          return [];
        }

        results.push(...validateUrls([templateUrlNode], host.tsLsHost));
      }

      if (styleUrls.length > 0) {
        // Find styleUrls value from the directive call expression, which is the parent of the
        // directive identifier.
        const styleUrlsNode = findPropertyValueOfType(
            directiveIdentifier.parent, 'styleUrls', ts.isArrayLiteralExpression);
        if (!styleUrlsNode) {
          host.error(`styleUrls property exists but its TypeScript node doesn't'`);
          return [];
        }

        results.push(...validateUrls(styleUrlsNode.elements, host.tsLsHost));
      }
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
    urls: ArrayLike<ts.Expression>, tsLsHost: Readonly<ts.LanguageServiceHost>): ng.Diagnostic[] {
  if (!tsLsHost.fileExists) {
    return [];
  }

  const allErrors: ng.Diagnostic[] = [];
  // TODO(ayazhafiz): most of this logic can be unified with the logic in
  // definitions.ts#getUrlFromProperty. Create a utility function to be used by both.
  for (let i = 0; i < urls.length; ++i) {
    const urlNode = urls[i];
    if (!ts.isStringLiteralLike(urlNode)) {
      // If a non-string value is assigned to a URL node (like `templateUrl`), a type error will be
      // picked up by the TS Language Server.
      continue;
    }

    const url = extractAbsoluteFilePath(urlNode);
    if (tsLsHost.fileExists(url)) continue;

    // Exclude opening and closing quotes in the url span.
    const urlSpan = {start: urlNode.getStart() + 1, end: urlNode.end - 1};
    allErrors.push(createDiagnostic(urlSpan, Diagnostic.invalid_templateurl));
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
    next: chain.next ? chain.next.map(chainDiagnostics) : undefined
  };
}

/**
 * Convert ng.Diagnostic to ts.Diagnostic.
 * @param d diagnostic
 * @param file
 */
export function ngDiagnosticToTsDiagnostic(
    d: ng.Diagnostic, file: ts.SourceFile|undefined): ts.Diagnostic {
  return {
    file,
    start: d.span.start,
    length: d.span.end - d.span.start,
    messageText: typeof d.message === 'string' ? d.message : chainDiagnostics(d.message),
    category: d.kind,
    code: 0,
    source: 'ng',
  };
}
