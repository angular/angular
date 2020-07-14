/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileMetadataResolver, CompilerConfig, CompileReflector, DirectiveNormalizer, DirectiveResolver, DomElementSchemaRegistry, ElementSchemaRegistry, HtmlParser, I18NHtmlParser, JitCompiler, JitEvaluator, JitSummaryResolver, Lexer, NgModuleCompiler, NgModuleResolver, Parser, PipeResolver, ProviderMeta, ResourceLoader, StaticSymbolCache, StyleCompiler, SummaryResolver, TemplateParser, UrlResolver, ViewCompiler} from '@angular/compiler';
import {Compiler, CompilerFactory, CompilerOptions, ComponentFactory, Inject, InjectionToken, Injector, isDevMode, MissingTranslationStrategy, ModuleWithComponentFactories, NgModuleFactory, Optional, PACKAGE_ROOT_URL, StaticProvider, TRANSLATIONS, TRANSLATIONS_FORMAT, Type, ViewEncapsulation, ɵConsole as Console} from '@angular/core';

import {JitReflector} from './compiler_reflector';

export const ERROR_COLLECTOR_TOKEN = new InjectionToken('ErrorCollector');

/**
 * A default provider for {@link PACKAGE_ROOT_URL} that maps to '/'.
 */
export const DEFAULT_PACKAGE_URL_PROVIDER = {
  provide: PACKAGE_ROOT_URL,
  useValue: '/'
};

const _NO_RESOURCE_LOADER: ResourceLoader = {
  get(url: string): Promise<string> {
    throw new Error(
        `No ResourceLoader implementation has been provided. Can't read the url "${url}"`);
  }
};

const baseHtmlParser = new InjectionToken('HtmlParser');

export class CompilerImpl implements Compiler {
  private _delegate: JitCompiler;
  public readonly injector: Injector;
  constructor(
      injector: Injector, private _metadataResolver: CompileMetadataResolver,
      templateParser: TemplateParser, styleCompiler: StyleCompiler, viewCompiler: ViewCompiler,
      ngModuleCompiler: NgModuleCompiler, summaryResolver: SummaryResolver<Type<any>>,
      compileReflector: CompileReflector, jitEvaluator: JitEvaluator,
      compilerConfig: CompilerConfig, console: Console) {
    this._delegate = new JitCompiler(
        _metadataResolver, templateParser, styleCompiler, viewCompiler, ngModuleCompiler,
        summaryResolver, compileReflector, jitEvaluator, compilerConfig, console,
        this.getExtraNgModuleProviders.bind(this));
    this.injector = injector;
  }

  private getExtraNgModuleProviders() {
    return [this._metadataResolver.getProviderMetadata(
        new ProviderMeta(Compiler, {useValue: this}))];
  }

  compileModuleSync<T>(moduleType: Type<T>): NgModuleFactory<T> {
    return this._delegate.compileModuleSync(moduleType) as NgModuleFactory<T>;
  }
  compileModuleAsync<T>(moduleType: Type<T>): Promise<NgModuleFactory<T>> {
    return this._delegate.compileModuleAsync(moduleType) as Promise<NgModuleFactory<T>>;
  }
  compileModuleAndAllComponentsSync<T>(moduleType: Type<T>): ModuleWithComponentFactories<T> {
    const result = this._delegate.compileModuleAndAllComponentsSync(moduleType);
    return {
      ngModuleFactory: result.ngModuleFactory as NgModuleFactory<T>,
      componentFactories: result.componentFactories as ComponentFactory<any>[],
    };
  }
  compileModuleAndAllComponentsAsync<T>(moduleType: Type<T>):
      Promise<ModuleWithComponentFactories<T>> {
    return this._delegate.compileModuleAndAllComponentsAsync(moduleType)
        .then((result) => ({
                ngModuleFactory: result.ngModuleFactory as NgModuleFactory<T>,
                componentFactories: result.componentFactories as ComponentFactory<any>[],
              }));
  }
  loadAotSummaries(summaries: () => any[]) {
    this._delegate.loadAotSummaries(summaries);
  }
  hasAotSummary(ref: Type<any>): boolean {
    return this._delegate.hasAotSummary(ref);
  }
  getComponentFactory<T>(component: Type<T>): ComponentFactory<T> {
    return this._delegate.getComponentFactory(component) as ComponentFactory<T>;
  }
  clearCache(): void {
    this._delegate.clearCache();
  }
  clearCacheFor(type: Type<any>) {
    this._delegate.clearCacheFor(type);
  }
  getModuleId(moduleType: Type<any>): string|undefined {
    const meta = this._metadataResolver.getNgModuleMetadata(moduleType);
    return meta && meta.id || undefined;
  }
}
/**
 * A set of providers that provide `JitCompiler` and its dependencies to use for
 * template compilation.
 */
const COMPILER_PROVIDERS__PRE_R3__ = <StaticProvider[]>[
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
    provide: I18NHtmlParser,
    useFactory:
        (parser: HtmlParser, translations: string|null, format: string, config: CompilerConfig,
         console: Console) => {
          translations = translations || '';
          const missingTranslation =
              translations ? config.missingTranslation! : MissingTranslationStrategy.Ignore;
          return new I18NHtmlParser(parser, translations, format, missingTranslation, console);
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
    useExisting: I18NHtmlParser,
  },
  {
    provide: TemplateParser,
    deps: [CompilerConfig, CompileReflector, Parser, ElementSchemaRegistry, I18NHtmlParser, Console]
  },
  {provide: JitEvaluator, useClass: JitEvaluator, deps: []},
  {provide: DirectiveNormalizer, deps: [ResourceLoader, UrlResolver, HtmlParser, CompilerConfig]},
  {
    provide: CompileMetadataResolver,
    deps: [
      CompilerConfig, HtmlParser, NgModuleResolver, DirectiveResolver, PipeResolver,
      SummaryResolver, ElementSchemaRegistry, DirectiveNormalizer, Console,
      [Optional, StaticSymbolCache], CompileReflector, [Optional, ERROR_COLLECTOR_TOKEN]
    ]
  },
  DEFAULT_PACKAGE_URL_PROVIDER,
  {provide: StyleCompiler, deps: [UrlResolver]},
  {provide: ViewCompiler, deps: [CompileReflector]},
  {provide: NgModuleCompiler, deps: [CompileReflector]},
  {provide: CompilerConfig, useValue: new CompilerConfig()},
  {
    provide: Compiler,
    useClass: CompilerImpl,
    deps: [
      Injector, CompileMetadataResolver, TemplateParser, StyleCompiler, ViewCompiler,
      NgModuleCompiler, SummaryResolver, CompileReflector, JitEvaluator, CompilerConfig, Console
    ]
  },
  {provide: DomElementSchemaRegistry, deps: []},
  {provide: ElementSchemaRegistry, useExisting: DomElementSchemaRegistry},
  {provide: UrlResolver, deps: [PACKAGE_ROOT_URL]},
  {provide: DirectiveResolver, deps: [CompileReflector]},
  {provide: PipeResolver, deps: [CompileReflector]},
  {provide: NgModuleResolver, deps: [CompileReflector]},
];

export const COMPILER_PROVIDERS__POST_R3__ =
    <StaticProvider[]>[{provide: Compiler, useFactory: () => new Compiler()}];
export const COMPILER_PROVIDERS = COMPILER_PROVIDERS__PRE_R3__;
/**
 * @publicApi
 */
export class JitCompilerFactory implements CompilerFactory {
  private _defaultOptions: CompilerOptions[];

  /* @internal */
  constructor(defaultOptions: CompilerOptions[]) {
    const compilerOptions: CompilerOptions = {
      useJit: true,
      defaultEncapsulation: ViewEncapsulation.Emulated,
      missingTranslation: MissingTranslationStrategy.Warning,
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
            jitDevMode: isDevMode(),
            // let explicit values from the compiler options overwrite options
            // from the app providers
            defaultEncapsulation: opts.defaultEncapsulation,
            missingTranslation: opts.missingTranslation,
            preserveWhitespaces: opts.preserveWhitespaces,
          });
        },
        deps: []
      },
      opts.providers!
    ]);
    return injector.get(Compiler);
  }
}

function _mergeOptions(optionsArr: CompilerOptions[]): CompilerOptions {
  return {
    useJit: _lastDefined(optionsArr.map(options => options.useJit)),
    defaultEncapsulation: _lastDefined(optionsArr.map(options => options.defaultEncapsulation)),
    providers: _mergeArrays(optionsArr.map(options => options.providers!)),
    missingTranslation: _lastDefined(optionsArr.map(options => options.missingTranslation)),
    preserveWhitespaces: _lastDefined(optionsArr.map(options => options.preserveWhitespaces)),
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
