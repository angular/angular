/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgAnalyzedModules, StaticSymbol} from '@angular/compiler';
import {AstResult} from './common';
import {Declarations, Diagnostic, DiagnosticKind, DiagnosticMessageChain, Diagnostics, Span, TemplateSource} from './types';

export interface AstProvider {
  getTemplateAst(template: TemplateSource, fileName: string): AstResult;
}

export function getDeclarationDiagnostics(
    declarations: Declarations, modules: NgAnalyzedModules): Diagnostics {
  const results: Diagnostics = [];

  let directives: Set<StaticSymbol>|undefined = undefined;
  for (const declaration of declarations) {
    const report = (message: string | DiagnosticMessageChain, span?: Span) => {
      results.push(<Diagnostic>{
        kind: DiagnosticKind.Error,
        span: span || declaration.declarationSpan, message
      });
    };
    for (const error of declaration.errors) {
      report(error.message, error.span);
    }
    if (declaration.metadata) {
      if (declaration.metadata.isComponent) {
        if (!modules.ngModuleByPipeOrDirective.has(declaration.type)) {
          report(
              `Component '${declaration.type.name}' is not included in a module and will not be available inside a template. Consider adding it to a NgModule declaration`);
        }
        const {template, templateUrl} = declaration.metadata.template !;
        if (template === null && !templateUrl) {
          report(`Component '${declaration.type.name}' must have a template or templateUrl`);
        } else if (template && templateUrl) {
          report(
              `Component '${declaration.type.name}' must not have both template and templateUrl`);
        }
      } else {
        if (!directives) {
          directives = new Set();
          modules.ngModules.forEach(module => {
            module.declaredDirectives.forEach(
                directive => { directives !.add(directive.reference); });
          });
        }
        if (!directives.has(declaration.type)) {
          report(
              `Directive '${declaration.type.name}' is not included in a module and will not be available inside a template. Consider adding it to a NgModule declaration`);
        }
      }
    }
  }

  return results;
}
