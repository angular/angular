/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileMetadataResolver, CompilePipeSummary} from '@angular/compiler';
import {DiagnosticTemplateInfo, getTemplateExpressionDiagnostics} from '@angular/compiler-cli/src/language_services';

import {getTemplateCompletions} from './completions';
import {getDefinition} from './definitions';
import {getDeclarationDiagnostics} from './diagnostics';
import {getHover} from './hover';
import {Completion, Diagnostic, DiagnosticKind, Diagnostics, Hover, LanguageService, LanguageServiceHost, Location, Span, TemplateSource} from './types';
import {offsetSpan, spanOf} from './utils';



/**
 * Create an instance of an Angular `LanguageService`.
 *
 * @publicApi
 */
export function createLanguageService(host: LanguageServiceHost): LanguageService {
  return new LanguageServiceImpl(host);
}

class LanguageServiceImpl implements LanguageService {
  constructor(private host: LanguageServiceHost) {}

  private get metadataResolver(): CompileMetadataResolver { return this.host.resolver; }

  getTemplateReferences(): string[] { return this.host.getTemplateReferences(); }

  getDiagnostics(fileName: string): Diagnostic[] {
    const results: Diagnostic[] = [];
    const templates = this.host.getTemplates(fileName);
    if (templates && templates.length) {
      results.push(...this.getTemplateDiagnostics(fileName, templates));
    }

    const declarations = this.host.getDeclarations(fileName);
    if (declarations && declarations.length) {
      const summary = this.host.getAnalyzedModules();
      results.push(...getDeclarationDiagnostics(declarations, summary));
    }

    return uniqueBySpan(results);
  }

  getPipesAt(fileName: string, position: number): CompilePipeSummary[] {
    let templateInfo = this.host.getTemplateAstAtPosition(fileName, position);
    if (templateInfo) {
      return templateInfo.pipes;
    }
    return [];
  }

  getCompletionsAt(fileName: string, position: number): Completion[]|undefined {
    let templateInfo = this.host.getTemplateAstAtPosition(fileName, position);
    if (templateInfo) {
      return getTemplateCompletions(templateInfo);
    }
  }

  getDefinitionAt(fileName: string, position: number): Location[]|undefined {
    let templateInfo = this.host.getTemplateAstAtPosition(fileName, position);
    if (templateInfo) {
      return getDefinition(templateInfo);
    }
  }

  getHoverAt(fileName: string, position: number): Hover|undefined {
    let templateInfo = this.host.getTemplateAstAtPosition(fileName, position);
    if (templateInfo) {
      return getHover(templateInfo);
    }
  }

  private getTemplateDiagnostics(fileName: string, templates: TemplateSource[]): Diagnostics {
    const results: Diagnostics = [];
    for (const template of templates) {
      const ast = this.host.getTemplateAst(template, fileName);
      if (ast) {
        if (ast.parseErrors && ast.parseErrors.length) {
          results.push(...ast.parseErrors.map<Diagnostic>(
              e => ({
                kind: DiagnosticKind.Error,
                span: offsetSpan(spanOf(e.span), template.span.start),
                message: e.msg
              })));
        } else if (ast.templateAst && ast.htmlAst) {
          const info: DiagnosticTemplateInfo = {
            templateAst: ast.templateAst,
            htmlAst: ast.htmlAst,
            offset: template.span.start,
            query: template.query,
            members: template.members
          };
          const expressionDiagnostics = getTemplateExpressionDiagnostics(info);
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
}

function uniqueBySpan<T extends{span: Span}>(elements: T[]): T[] {
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
