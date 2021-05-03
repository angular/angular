/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompilerConfig} from '../config';
import {ViewEncapsulation} from '../core';
import {DirectiveNormalizer} from '../directive_normalizer';
import {DirectiveResolver} from '../directive_resolver';
import {Lexer} from '../expression_parser/lexer';
import {Parser} from '../expression_parser/parser';
import {I18NHtmlParser} from '../i18n/i18n_html_parser';
import {InjectableCompiler} from '../injectable_compiler';
import {CompileMetadataResolver} from '../metadata_resolver';
import {HtmlParser} from '../ml_parser/html_parser';
import {NgModuleCompiler} from '../ng_module_compiler';
import {NgModuleResolver} from '../ng_module_resolver';
import {TypeScriptEmitter} from '../output/ts_emitter';
import {PipeResolver} from '../pipe_resolver';
import {DomElementSchemaRegistry} from '../schema/dom_element_schema_registry';
import {StyleCompiler} from '../style_compiler';
import {TemplateParser} from '../template_parser/template_parser';
import {UrlResolver} from '../url_resolver';
import {syntaxError} from '../util';
import {TypeCheckCompiler} from '../view_compiler/type_check_compiler';
import {ViewCompiler} from '../view_compiler/view_compiler';

import {AotCompiler} from './compiler';
import {AotCompilerHost} from './compiler_host';
import {AotCompilerOptions} from './compiler_options';
import {StaticReflector} from './static_reflector';
import {StaticSymbolCache} from './static_symbol';
import {StaticSymbolResolver} from './static_symbol_resolver';
import {AotSummaryResolver} from './summary_resolver';

export function createAotUrlResolver(
    host: {resourceNameToFileName(resourceName: string, containingFileName: string): string|null;}):
    UrlResolver {
  return {
    resolve: (basePath: string, url: string) => {
      const filePath = host.resourceNameToFileName(url, basePath);
      if (!filePath) {
        throw syntaxError(`Couldn't resolve resource ${url} from ${basePath}`);
      }
      return filePath;
    }
  };
}

/**
 * Creates a new AotCompiler based on options and a host.
 */
export function createAotCompiler(
    compilerHost: AotCompilerHost, options: AotCompilerOptions,
    errorCollector?: (error: any, type?: any) =>
        void): {compiler: AotCompiler, reflector: StaticReflector} {
  let translations: string = options.translations || '';

  const urlResolver = createAotUrlResolver(compilerHost);
  const symbolCache = new StaticSymbolCache();
  const summaryResolver = new AotSummaryResolver(compilerHost, symbolCache);
  const symbolResolver = new StaticSymbolResolver(compilerHost, symbolCache, summaryResolver);
  const staticReflector =
      new StaticReflector(summaryResolver, symbolResolver, [], [], errorCollector);
  let htmlParser: I18NHtmlParser;
  if (!!options.enableIvy) {
    // Ivy handles i18n at the compiler level so we must use a regular parser
    htmlParser = new HtmlParser() as I18NHtmlParser;
  } else {
    htmlParser = new I18NHtmlParser(
        new HtmlParser(), translations, options.i18nFormat, options.missingTranslation, console);
  }
  const config = new CompilerConfig({
    defaultEncapsulation: ViewEncapsulation.Emulated,
    useJit: false,
    missingTranslation: options.missingTranslation,
    preserveWhitespaces: options.preserveWhitespaces,
    strictInjectionParameters: options.strictInjectionParameters,
  });
  const normalizer = new DirectiveNormalizer(
      {get: (url: string) => compilerHost.loadResource(url)}, urlResolver, htmlParser, config);
  const expressionParser = new Parser(new Lexer());
  const elementSchemaRegistry = new DomElementSchemaRegistry();
  const tmplParser = new TemplateParser(
      config, staticReflector, expressionParser, elementSchemaRegistry, htmlParser, console, []);
  const resolver = new CompileMetadataResolver(
      config, htmlParser, new NgModuleResolver(staticReflector),
      new DirectiveResolver(staticReflector), new PipeResolver(staticReflector), summaryResolver,
      elementSchemaRegistry, normalizer, console, symbolCache, staticReflector, errorCollector);
  // TODO(vicb): do not pass options.i18nFormat here
  const viewCompiler = new ViewCompiler(staticReflector);
  const typeCheckCompiler = new TypeCheckCompiler(options, staticReflector);
  const compiler = new AotCompiler(
      config, options, compilerHost, staticReflector, resolver, tmplParser,
      new StyleCompiler(urlResolver), viewCompiler, typeCheckCompiler,
      new NgModuleCompiler(staticReflector),
      new InjectableCompiler(staticReflector, !!options.enableIvy), new TypeScriptEmitter(),
      summaryResolver, symbolResolver);
  return {compiler, reflector: staticReflector};
}
