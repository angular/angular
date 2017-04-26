/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MissingTranslationStrategy, ViewEncapsulation, ɵConsole as Console} from '@angular/core';
import {CompilerConfig} from '../config';
import {DirectiveNormalizer} from '../directive_normalizer';
import {DirectiveResolver} from '../directive_resolver';
import {Lexer} from '../expression_parser/lexer';
import {Parser} from '../expression_parser/parser';
import {I18NHtmlParser} from '../i18n/i18n_html_parser';
import {CompileMetadataResolver} from '../metadata_resolver';
import {HtmlParser} from '../ml_parser/html_parser';
import {NgModuleCompiler} from '../ng_module_compiler';
import {NgModuleResolver} from '../ng_module_resolver';
import {TypeScriptEmitter} from '../output/ts_emitter';
import {PipeResolver} from '../pipe_resolver';
import {DomElementSchemaRegistry} from '../schema/dom_element_schema_registry';
import {StyleCompiler} from '../style_compiler';
import {TemplateParser} from '../template_parser/template_parser';
import {createOfflineCompileUrlResolver} from '../url_resolver';
import {ViewCompiler} from '../view_compiler/view_compiler';

import {AotCompiler} from './compiler';
import {AotCompilerHost} from './compiler_host';
import {AotCompilerOptions} from './compiler_options';
import {StaticAndDynamicReflectionCapabilities} from './static_reflection_capabilities';
import {StaticReflector} from './static_reflector';
import {StaticSymbol, StaticSymbolCache} from './static_symbol';
import {StaticSymbolResolver} from './static_symbol_resolver';
import {AotSummaryResolver} from './summary_resolver';


/**
 * Creates a new AotCompiler based on options and a host.
 */
export function createAotCompiler(compilerHost: AotCompilerHost, options: AotCompilerOptions):
    {compiler: AotCompiler, reflector: StaticReflector} {
  let translations: string = options.translations || '';

  const urlResolver = createOfflineCompileUrlResolver();
  const symbolCache = new StaticSymbolCache();
  const summaryResolver = new AotSummaryResolver(compilerHost, symbolCache);
  const symbolResolver = new StaticSymbolResolver(compilerHost, symbolCache, summaryResolver);
  const staticReflector = new StaticReflector(summaryResolver, symbolResolver);
  StaticAndDynamicReflectionCapabilities.install(staticReflector);
  const console = new Console();
  const htmlParser = new I18NHtmlParser(
      new HtmlParser(), translations, options.i18nFormat, options.missingTranslation, console);
  const config = new CompilerConfig({
    defaultEncapsulation: ViewEncapsulation.Emulated,
    useJit: false,
    enableLegacyTemplate: options.enableLegacyTemplate !== false,
    missingTranslation: options.missingTranslation,
  });
  const normalizer = new DirectiveNormalizer(
      {get: (url: string) => compilerHost.loadResource(url)}, urlResolver, htmlParser, config);
  const expressionParser = new Parser(new Lexer());
  const elementSchemaRegistry = new DomElementSchemaRegistry();
  const tmplParser =
      new TemplateParser(config, expressionParser, elementSchemaRegistry, htmlParser, console, []);
  const resolver = new CompileMetadataResolver(
      config, new NgModuleResolver(staticReflector), new DirectiveResolver(staticReflector),
      new PipeResolver(staticReflector), summaryResolver, elementSchemaRegistry, normalizer,
      console, symbolCache, staticReflector);
  // TODO(vicb): do not pass options.i18nFormat here
  const viewCompiler = new ViewCompiler(config, elementSchemaRegistry);
  const compiler = new AotCompiler(
      config, compilerHost, resolver, tmplParser, new StyleCompiler(urlResolver), viewCompiler,
      new NgModuleCompiler(), new TypeScriptEmitter(symbolResolver), summaryResolver,
      options.locale || null, options.i18nFormat || null, options.genFilePreamble || null,
      symbolResolver);
  return {compiler, reflector: staticReflector};
}
