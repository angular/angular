/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {COMPILER_OPTIONS, Compiler, CompilerFactory, CompilerOptions, Inject, InjectionToken, Injector, MissingTranslationStrategy, Optional, PACKAGE_ROOT_URL, PlatformRef, StaticProvider, TRANSLATIONS, TRANSLATIONS_FORMAT, Type, ViewEncapsulation, createPlatformFactory, isDevMode, platformCore, ɵConsole as Console} from '@angular/core';

import {StaticSymbolCache} from '../aot/static_symbol';
import {CompileReflector} from '../compile_reflector';
import {CompilerConfig} from '../config';
import {DirectiveNormalizer} from '../directive_normalizer';
import {DirectiveResolver} from '../directive_resolver';
import {Lexer} from '../expression_parser/lexer';
import {Parser} from '../expression_parser/parser';
import * as i18n from '../i18n/index';
import {CompilerInjectable} from '../injectable';
import {CompileMetadataResolver, ERROR_COLLECTOR_TOKEN} from '../metadata_resolver';
import {HtmlParser} from '../ml_parser/html_parser';
import {NgModuleCompiler} from '../ng_module_compiler';
import {NgModuleResolver} from '../ng_module_resolver';
import {PipeResolver} from '../pipe_resolver';
import {ResourceLoader} from '../resource_loader';
import {DomElementSchemaRegistry} from '../schema/dom_element_schema_registry';
import {ElementSchemaRegistry} from '../schema/element_schema_registry';
import {StyleCompiler} from '../style_compiler';
import {JitSummaryResolver, SummaryResolver} from '../summary_resolver';
import {TEMPLATE_TRANSFORMS, TemplateParser} from '../template_parser/template_parser';
import {DEFAULT_PACKAGE_URL_PROVIDER, UrlResolver} from '../url_resolver';
import {ViewCompiler} from '../view_compiler/view_compiler';

import {JitCompiler} from './compiler';
import {JitReflector} from './jit_reflector';

const _NO_RESOURCE_LOADER: ResourceLoader = {
  get(url: string): Promise<string>{
      throw new Error(
          `No ResourceLoader implementation has been provided. Can't read the url "${url}"`);}
};

const baseHtmlParser = new InjectionToken('HtmlParser');

/**
 * A set of providers that provide `JitCompiler` and its dependencies to use for
 * template compilation.
 */
export const COMPILER_PROVIDERS = <StaticProvider[]>[
  {provide: CompileReflector, useValue: new JitReflector()},
  {provide: ResourceLoader, useValue: _NO_RESOURCE_LOADER},
  {provide: JitSummaryResolver, deps: []},
  {provide: SummaryResolver, useExisting: JitSummaryResolver},
  {provide: Console, deps: []},
  {provide: Lexer, deps: []},
  {provide: Parser, deps: [Lexer]},
  {
    provide: baseHtmlParser,
    useClass: HtmlParser,
    deps: [],
  },
  {
    provide: i18n.I18NHtmlParser,
    useFactory: (parser: HtmlParser, translations: string | null, format: string,
                 config: CompilerConfig, console: Console) => {
      translations = translations || '';
      const missingTranslation =
          translations ? config.missingTranslation ! : MissingTranslationStrategy.Ignore;
      return new i18n.I18NHtmlParser(parser, translations, format, missingTranslation, console);
    },
    deps: [
      baseHtmlParser,
      [new Optional(), new Inject(TRANSLATIONS)],
      [new Optional(), new Inject(TRANSLATIONS_FORMAT)],
      [CompilerConfig],
      [Console],
    ]
  },
  {
    provide: HtmlParser,
    useExisting: i18n.I18NHtmlParser,
  },
  {
    provide: TemplateParser, deps: [CompilerConfig, CompileReflector,
    Parser, ElementSchemaRegistry,
    i18n.I18NHtmlParser, Console, [Optional, TEMPLATE_TRANSFORMS]]
  },
  { provide: DirectiveNormalizer, deps: [ResourceLoader, UrlResolver, HtmlParser, CompilerConfig]},
  { provide: CompileMetadataResolver, deps: [CompilerConfig, NgModuleResolver,
                      DirectiveResolver, PipeResolver,
                      SummaryResolver,
                      ElementSchemaRegistry,
                      DirectiveNormalizer, Console,
                      [Optional, StaticSymbolCache],
                      CompileReflector,
                      [Optional, ERROR_COLLECTOR_TOKEN]]},
  DEFAULT_PACKAGE_URL_PROVIDER,
  { provide: StyleCompiler, deps: [UrlResolver]},
  { provide: ViewCompiler, deps: [CompilerConfig, CompileReflector, ElementSchemaRegistry]},
  { provide: NgModuleCompiler, deps: [CompileReflector] },
  { provide: CompilerConfig, useValue: new CompilerConfig()},
  { provide: JitCompiler, deps: [Injector, CompileMetadataResolver,
                                TemplateParser, StyleCompiler,
                                ViewCompiler, NgModuleCompiler,
                                SummaryResolver,  CompilerConfig,
                                Console]},
  { provide: Compiler, useExisting: JitCompiler},
  { provide: DomElementSchemaRegistry, deps: []},
  { provide: ElementSchemaRegistry, useExisting: DomElementSchemaRegistry},
  { provide: UrlResolver, deps: [PACKAGE_ROOT_URL]},
  { provide: DirectiveResolver, deps: [CompileReflector]},
  { provide: PipeResolver, deps: [CompileReflector]},
  { provide: NgModuleResolver, deps: [CompileReflector]},
];

@CompilerInjectable()
export class JitCompilerFactory implements CompilerFactory {
  private _defaultOptions: CompilerOptions[];
  constructor(@Inject(COMPILER_OPTIONS) defaultOptions: CompilerOptions[]) {
    const compilerOptions: CompilerOptions = {
      useDebug: isDevMode(),
      useJit: true,
      defaultEncapsulation: ViewEncapsulation.Emulated,
      missingTranslation: MissingTranslationStrategy.Warning,
      enableLegacyTemplate: true,
    };

    this._defaultOptions = [compilerOptions, ...defaultOptions];
  }
  createCompiler(options: CompilerOptions[] = []): Compiler {
    const opts = _mergeOptions(this._defaultOptions.concat(options));
    const injector = Injector.create([
      COMPILER_PROVIDERS, {
        provide: CompilerConfig,
        useFactory: () => {
          return new CompilerConfig({
            // let explicit values from the compiler options overwrite options
            // from the app providers
            useJit: opts.useJit,
            // let explicit values from the compiler options overwrite options
            // from the app providers
            defaultEncapsulation: opts.defaultEncapsulation,
            missingTranslation: opts.missingTranslation,
            enableLegacyTemplate: opts.enableLegacyTemplate,
          });
        },
        deps: []
      },
      opts.providers !
    ]);
    return injector.get(Compiler);
  }
}

/**
 * A platform that included corePlatform and the compiler.
 *
 * @experimental
 */
export const platformCoreDynamic = createPlatformFactory(platformCore, 'coreDynamic', [
  {provide: COMPILER_OPTIONS, useValue: {}, multi: true},
  {provide: CompilerFactory, useClass: JitCompilerFactory, deps: [COMPILER_OPTIONS]},
]);

function _mergeOptions(optionsArr: CompilerOptions[]): CompilerOptions {
  return {
    useJit: _lastDefined(optionsArr.map(options => options.useJit)),
    defaultEncapsulation: _lastDefined(optionsArr.map(options => options.defaultEncapsulation)),
    providers: _mergeArrays(optionsArr.map(options => options.providers !)),
    missingTranslation: _lastDefined(optionsArr.map(options => options.missingTranslation)),
    enableLegacyTemplate: _lastDefined(optionsArr.map(options => options.enableLegacyTemplate)),
  };
}

function _lastDefined<T>(args: T[]): T|undefined {
  for (let i = args.length - 1; i >= 0; i--) {
    if (args[i] !== undefined) {
      return args[i];
    }
  }
  return undefined;
}

function _mergeArrays(parts: any[][]): any[] {
  const result: any[] = [];
  parts.forEach((part) => part && result.push(...part));
  return result;
}
