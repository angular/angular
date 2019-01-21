/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileMetadataResolver, CompileNgModuleMetadata, CompilePipeSummary, CompilerConfig, DomElementSchemaRegistry, HtmlParser, I18NHtmlParser, Lexer, NgAnalyzedModules, Parser, TemplateParser} from '@angular/compiler';

import {AstResult, TemplateInfo} from './common';
import {getTemplateCompletions} from './completions';
import {getDefinition} from './definitions';
import {getDeclarationDiagnostics, getTemplateDiagnostics} from './diagnostics';
import {getHover} from './hover';
import {Completions, Definition, Diagnostic, DiagnosticKind, Diagnostics, Hover, LanguageService, LanguageServiceHost, Pipes, Span, TemplateSource} from './types';


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

  getDiagnostics(fileName: string): Diagnostics|undefined {
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

  getPipesAt(fileName: string, position: number): CompilePipeSummary[] {
    let templateInfo = this.getTemplateAstAtPosition(fileName, position);
    if (templateInfo) {
      return templateInfo.pipes;
    }
    return [];
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

  getHoverAt(fileName: string, position: number): Hover|undefined {
    let templateInfo = this.getTemplateAstAtPosition(fileName, position);
    if (templateInfo) {
      return getHover(templateInfo);
    }
  }

  private getTemplateAstAtPosition(fileName: string, position: number): TemplateInfo|undefined {
    let template = this.host.getTemplateAt(fileName, position);
    if (template) {
      let astResult = this.getTemplateAst(template, fileName);
      if (astResult && astResult.htmlAst && astResult.templateAst && astResult.directive &&
          astResult.directives && astResult.pipes && astResult.expressionParser)
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
    let result: AstResult|undefined = undefined;
    try {
      const resolvedMetadata =
          this.metadataResolver.getNonNormalizedDirectiveMetadata(template.type as any);
      const metadata = resolvedMetadata && resolvedMetadata.metadata;
      if (metadata) {
        const rawHtmlParser = new HtmlParser();
        const htmlParser = new I18NHtmlParser(rawHtmlParser);
        const expressionParser = new Parser(new Lexer());
        const config = new CompilerConfig();
        const parser = new TemplateParser(
            config, this.host.resolver.getReflector(), expressionParser,
            new DomElementSchemaRegistry(), htmlParser, null !, []);
        const htmlResult = htmlParser.parse(template.source, '', true);
        const analyzedModules = this.host.getAnalyzedModules();
        let errors: Diagnostic[]|undefined = undefined;
        let ngModule = analyzedModules.ngModuleByPipeOrDirective.get(template.type);
        if (!ngModule) {
          // Reported by the the declaration diagnostics.
          ngModule = findSuitableDefaultModule(analyzedModules);
        }
        if (ngModule) {
          const resolvedDirectives = ngModule.transitiveModule.directives.map(
              d => this.host.resolver.getNonNormalizedDirectiveMetadata(d.reference));
          const directives = removeMissing(resolvedDirectives).map(d => d.metadata.toSummary());
          const pipes = ngModule.transitiveModule.pipes.map(
              p => this.host.resolver.getOrLoadPipeMetadata(p.reference).toSummary());
          const schemas = ngModule.schemas;
          const parseResult = parser.tryParseHtml(htmlResult, metadata, directives, pipes, schemas);
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
    return result || {};
  }
}

function removeMissing<T>(values: (T | null | undefined)[]): T[] {
  return values.filter(e => !!e) as T[];
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

function findSuitableDefaultModule(modules: NgAnalyzedModules): CompileNgModuleMetadata|undefined {
  let result: CompileNgModuleMetadata|undefined = undefined;
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
