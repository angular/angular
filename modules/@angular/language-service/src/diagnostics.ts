/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileDirectiveMetadata, CompileDirectiveSummary, StaticSymbol} from '@angular/compiler';
import {NgAnalyzedModules} from '@angular/compiler/src/aot/compiler';
import {AST} from '@angular/compiler/src/expression_parser/ast';
import {Attribute} from '@angular/compiler/src/ml_parser/ast';
import {AttrAst, BoundDirectivePropertyAst, BoundElementPropertyAst, BoundEventAst, BoundTextAst, DirectiveAst, ElementAst, EmbeddedTemplateAst, NgContentAst, ReferenceAst, TemplateAst, TemplateAstVisitor, TextAst, VariableAst, templateVisitAll} from '@angular/compiler/src/template_parser/template_ast';

import {AstResult, SelectorInfo, TemplateInfo} from './common';
import {getExpressionDiagnostics, getExpressionScope} from './expressions';
import {HtmlAstPath} from './html_path';
import {NullTemplateVisitor, TemplateAstChildVisitor, TemplateAstPath} from './template_path';
import {Declaration, Declarations, Diagnostic, DiagnosticKind, Diagnostics, Span, SymbolTable, TemplateSource} from './types';
import {getSelectors, hasTemplateReference, offsetSpan, spanOf} from './utils';

export interface AstProvider {
  getTemplateAst(template: TemplateSource, fileName: string): AstResult;
}

export function getTemplateDiagnostics(
    fileName: string, astProvider: AstProvider, templates: TemplateSource[]): Diagnostics {
  const results: Diagnostics = [];
  for (const template of templates) {
    const ast = astProvider.getTemplateAst(template, fileName);
    if (ast) {
      if (ast.parseErrors && ast.parseErrors.length) {
        results.push(...ast.parseErrors.map<Diagnostic>(
            e => ({
              kind: DiagnosticKind.Error,
              span: offsetSpan(spanOf(e.span), template.span.start),
              message: e.msg
            })));
      } else if (ast.templateAst) {
        const expressionDiagnostics = getTemplateExpressionDiagnostics(template, ast);
        results.push(...expressionDiagnostics);
      }
      if (ast.errors) {
        results.push(...ast.errors.map<Diagnostic>(
            e => ({kind: e.kind, span: e.span || template.span, message: e.message})));
      }
    }
  }
  return results;
}

export function getDeclarationDiagnostics(
    declarations: Declarations, modules: NgAnalyzedModules): Diagnostics {
  const results: Diagnostics = [];

  let directives: Set<StaticSymbol>|undefined = undefined;
  for (const declaration of declarations) {
    const report = (message: string, span?: Span) => {
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
        if (declaration.metadata.template.template == null &&
            !declaration.metadata.template.templateUrl) {
          report(`Component ${declaration.type.name} must have a template or templateUrl`);
        }
      } else {
        if (!directives) {
          directives = new Set();
          modules.ngModules.forEach(module => {
            module.declaredDirectives.forEach(
                directive => { directives.add(directive.reference); });
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

function getTemplateExpressionDiagnostics(
    template: TemplateSource, astResult: AstResult): Diagnostics {
  const info: TemplateInfo = {
    template,
    htmlAst: astResult.htmlAst,
    directive: astResult.directive,
    directives: astResult.directives,
    pipes: astResult.pipes,
    templateAst: astResult.templateAst,
    expressionParser: astResult.expressionParser
  };
  const visitor = new ExpressionDiagnosticsVisitor(
      info, (path: TemplateAstPath, includeEvent: boolean) =>
                getExpressionScope(info, path, includeEvent));
  templateVisitAll(visitor, astResult.templateAst);
  return visitor.diagnostics;
}

class ExpressionDiagnosticsVisitor extends TemplateAstChildVisitor {
  private path: TemplateAstPath;
  private directiveSummary: CompileDirectiveSummary;

  diagnostics: Diagnostics = [];

  constructor(
      private info: TemplateInfo,
      private getExpressionScope: (path: TemplateAstPath, includeEvent: boolean) => SymbolTable) {
    super();
    this.path = new TemplateAstPath([], 0);
  }

  visitDirective(ast: DirectiveAst, context: any): any {
    // Override the default child visitor to ignore the host properties of a directive.
    if (ast.inputs && ast.inputs.length) {
      templateVisitAll(this, ast.inputs, context);
    }
  }

  visitBoundText(ast: BoundTextAst): void {
    this.push(ast);
    this.diagnoseExpression(ast.value, ast.sourceSpan.start.offset, false);
    this.pop();
  }

  visitDirectiveProperty(ast: BoundDirectivePropertyAst): void {
    this.push(ast);
    this.diagnoseExpression(ast.value, this.attributeValueLocation(ast), false);
    this.pop();
  }

  visitElementProperty(ast: BoundElementPropertyAst): void {
    this.push(ast);
    this.diagnoseExpression(ast.value, this.attributeValueLocation(ast), false);
    this.pop();
  }

  visitEvent(ast: BoundEventAst): void {
    this.push(ast);
    this.diagnoseExpression(ast.handler, this.attributeValueLocation(ast), true);
    this.pop();
  }

  visitVariable(ast: VariableAst): void {
    const directive = this.directiveSummary;
    if (directive && ast.value) {
      const context = this.info.template.query.getTemplateContext(directive.type.reference);
      if (!context.has(ast.value)) {
        if (ast.value === '$implicit') {
          this.reportError(
              'The template context does not have an implicit value', spanOf(ast.sourceSpan));
        } else {
          this.reportError(
              `The template context does not defined a member called '${ast.value}'`,
              spanOf(ast.sourceSpan));
        }
      }
    }
  }

  visitElement(ast: ElementAst, context: any): void {
    this.push(ast);
    super.visitElement(ast, context);
    this.pop();
  }

  visitEmbeddedTemplate(ast: EmbeddedTemplateAst, context: any): any {
    const previousDirectiveSummary = this.directiveSummary;

    this.push(ast);

    // Find directive that refernces this template
    this.directiveSummary =
        ast.directives.map(d => d.directive).find(d => hasTemplateReference(d.type));

    // Process children
    super.visitEmbeddedTemplate(ast, context);

    this.pop();

    this.directiveSummary = previousDirectiveSummary;
  }

  private attributeValueLocation(ast: TemplateAst) {
    const path = new HtmlAstPath(this.info.htmlAst, ast.sourceSpan.start.offset);
    const last = path.tail;
    if (last instanceof Attribute && last.valueSpan) {
      // Add 1 for the quote.
      return last.valueSpan.start.offset + 1;
    }
    return ast.sourceSpan.start.offset;
  }

  private diagnoseExpression(ast: AST, offset: number, includeEvent: boolean) {
    const scope = this.getExpressionScope(this.path, includeEvent);
    this.diagnostics.push(
        ...getExpressionDiagnostics(scope, ast, this.info.template.query, {
          event: includeEvent
        }).map(d => ({
                 span: offsetSpan(d.ast.span, offset + this.info.template.span.start),
                 kind: d.kind,
                 message: d.message
               })));
  }

  private push(ast: TemplateAst) { this.path.push(ast); }

  private pop() { this.path.pop(); }

  private _selectors: SelectorInfo;
  private selectors(): SelectorInfo {
    let result = this._selectors;
    if (!result) {
      this._selectors = result = getSelectors(this.info);
    }
    return result;
  }

  private findElement(position: number): Element {
    const htmlPath = new HtmlAstPath(this.info.htmlAst, position);
    if (htmlPath.tail instanceof Element) {
      return htmlPath.tail;
    }
  }

  private reportError(message: string, span: Span) {
    this.diagnostics.push({
      span: offsetSpan(span, this.info.template.span.start),
      kind: DiagnosticKind.Error, message
    });
  }

  private reportWarning(message: string, span: Span) {
    this.diagnostics.push({
      span: offsetSpan(span, this.info.template.span.start),
      kind: DiagnosticKind.Warning, message
    });
  }
}
