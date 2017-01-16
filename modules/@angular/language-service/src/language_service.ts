/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgAnalyzedModules} from '@angular/compiler/src/aot/compiler';
import {CompileNgModuleMetadata} from '@angular/compiler/src/compile_metadata';
import {Lexer} from '@angular/compiler/src/expression_parser/lexer';
import {Parser} from '@angular/compiler/src/expression_parser/parser';
import {I18NHtmlParser} from '@angular/compiler/src/i18n/i18n_html_parser';
import {CompileMetadataResolver} from '@angular/compiler/src/metadata_resolver';
import {HtmlParser} from '@angular/compiler/src/ml_parser/html_parser';
import {DomElementSchemaRegistry} from '@angular/compiler/src/schema/dom_element_schema_registry';
import {TemplateParser} from '@angular/compiler/src/template_parser/template_parser';

import {AstResult, AttrInfo, TemplateInfo} from './common';
import {getTemplateCompletions} from './completions';
import {getDefinition} from './definitions';
import {getDeclarationDiagnostics, getTemplateDiagnostics} from './diagnostics';
import {getHover} from './hover';
import {Completion, CompletionKind, Completions, Declaration, Declarations, Definition, Diagnostic, DiagnosticKind, Diagnostics, Hover, LanguageService, LanguageServiceHost, Location, PipeInfo, Pipes, Signature, Span, Symbol, SymbolDeclaration, SymbolQuery, SymbolTable, TemplateSource, TemplateSources} from './types';

/**
 * Create an instance of an Angular `LanguageService`.
 *
 * @experimental
 */
export function createLanguageService(host: LanguageServiceHost): LanguageService {
  return new LanguageServiceImpl(host);
}

class LanguageServiceImpl implements LanguageService {
  constructor(private host: LanguageServiceHost) {}

  private get metadataResolver(): CompileMetadataResolver { return this.host.resolver; }

  getTemplateReferences(): string[] { return this.host.getTemplateReferences(); }

  getDiagnostics(fileName: string): Diagnostics {
    let results: Diagnostics = [];
    let templates = this.host.getTemplates(fileName);
    if (templates && templates.length) {
      results.push(...getTemplateDiagnostics(fileName, this, templates));
    }

    let declarations = this.host.getDeclarations(fileName);
    if (declarations && declarations.length) {
      const summary = this.host.getAnalyzedModules();
      results.push(...getDeclarationDiagnostics(declarations, summary));
    }

    return uniqueBySpan(results);
  }

  getPipesAt(fileName: string, position: number): Pipes {
    let templateInfo = this.getTemplateAstAtPosition(fileName, position);
    if (templateInfo) {
      return templateInfo.pipes.map(
          pipeInfo => ({name: pipeInfo.name, symbol: pipeInfo.type.reference}));
    }
  }

  getCompletionsAt(fileName: string, position: number): Completions {
    let templateInfo = this.getTemplateAstAtPosition(fileName, position);
    if (templateInfo) {
      return getTemplateCompletions(templateInfo);
    }
  }

  getDefinitionAt(fileName: string, position: number): Definition {
    let templateInfo = this.getTemplateAstAtPosition(fileName, position);
    if (templateInfo) {
      return getDefinition(templateInfo);
    }
  }

  getHoverAt(fileName: string, position: number): Hover {
    let templateInfo = this.getTemplateAstAtPosition(fileName, position);
    if (templateInfo) {
      return getHover(templateInfo);
    }
  }

  private getTemplateAstAtPosition(fileName: string, position: number): TemplateInfo {
    let template = this.host.getTemplateAt(fileName, position);
    if (template) {
      let astResult = this.getTemplateAst(template, fileName);
      if (astResult && astResult.htmlAst && astResult.templateAst)
        return {
          position,
          fileName,
          template,
          htmlAst: astResult.htmlAst,
          directive: astResult.directive,
          directives: astResult.directives,
          pipes: astResult.pipes,
          templateAst: astResult.templateAst,
          expressionParser: astResult.expressionParser
        };
    }
    return undefined;
  }

  getTemplateAst(template: TemplateSource, contextFile: string): AstResult {
    let result: AstResult;
    try {
      const resolvedMetadata =
          this.metadataResolver.getNonNormalizedDirectiveMetadata(template.type as any);
      const metadata = resolvedMetadata && resolvedMetadata.metadata;
      if (metadata) {
        const rawHtmlParser = new HtmlParser();
        const htmlParser = new I18NHtmlParser(rawHtmlParser);
        const expressionParser = new Parser(new Lexer());
        const parser = new TemplateParser(
            expressionParser, new DomElementSchemaRegistry(), htmlParser, null, []);
        const htmlResult = htmlParser.parse(template.source, '');
        const analyzedModules = this.host.getAnalyzedModules();
        let errors: Diagnostic[] = undefined;
        let ngModule = analyzedModules.ngModuleByPipeOrDirective.get(template.type);
        if (!ngModule) {
          // Reported by the the declaration diagnostics.
          ngModule = findSuitableDefaultModule(analyzedModules);
        }
        if (ngModule) {
          const resolvedDirectives = ngModule.transitiveModule.directives.map(
              d => this.host.resolver.getNonNormalizedDirectiveMetadata(d.reference));
          const directives =
              resolvedDirectives.filter(d => d !== null).map(d => d.metadata.toSummary());
          const pipes = ngModule.transitiveModule.pipes.map(
              p => this.host.resolver.getOrLoadPipeMetadata(p.reference).toSummary());
          const schemas = ngModule.schemas;
          const parseResult = parser.tryParseHtml(
              htmlResult, metadata, template.source, directives, pipes, schemas, '');
          result = {
            htmlAst: htmlResult.rootNodes,
            templateAst: parseResult.templateAst,
            directive: metadata, directives, pipes,
            parseErrors: parseResult.errors, expressionParser, errors
          };
        }
      }
    } catch (e) {
      let span = template.span;
      if (e.fileName == contextFile) {
        span = template.query.getSpanAt(e.line, e.column) || span;
      }
      result = {errors: [{kind: DiagnosticKind.Error, message: e.message, span}]};
    }
    return result;
  }
}

function uniqueBySpan < T extends {
  span: Span;
}
> (elements: T[] | undefined): T[]|undefined {
  if (elements) {
    const result: T[] = [];
    const map = new Map<number, Set<number>>();
    for (const element of elements) {
      let span = element.span;
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
}

function findSuitableDefaultModule(modules: NgAnalyzedModules): CompileNgModuleMetadata {
  let result: CompileNgModuleMetadata;
  let resultSize = 0;
  for (const module of modules.ngModules) {
    const moduleSize = module.transitiveModule.directives.length;
    if (moduleSize > resultSize) {
      result = module;
      resultSize = moduleSize;
    }
  }
  return result;
}