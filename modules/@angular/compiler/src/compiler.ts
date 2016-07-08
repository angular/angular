/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Compiler, CompilerFactory, CompilerOptions, ComponentResolver, Injectable, PLATFORM_DIRECTIVES, PLATFORM_PIPES, ReflectiveInjector, Type, ViewEncapsulation, isDevMode} from '@angular/core';

export * from './template_ast';
export {TEMPLATE_TRANSFORMS} from './template_parser';
export {CompilerConfig, RenderTypes} from './config';
export * from './compile_metadata';
export * from './offline_compiler';
export {RuntimeCompiler} from './runtime_compiler';
export * from './url_resolver';
export * from './xhr';

export {ViewResolver} from './view_resolver';
export {DirectiveResolver} from './directive_resolver';
export {PipeResolver} from './pipe_resolver';

import {TemplateParser} from './template_parser';
import {HtmlParser} from './html_parser';
import {DirectiveNormalizer} from './directive_normalizer';
import {CompileMetadataResolver} from './metadata_resolver';
import {StyleCompiler} from './style_compiler';
import {ViewCompiler} from './view_compiler/view_compiler';
import {AppModuleCompiler} from './app_module_compiler';
import {CompilerConfig} from './config';
import {RuntimeCompiler} from './runtime_compiler';
import {ElementSchemaRegistry} from './schema/element_schema_registry';
import {DomElementSchemaRegistry} from './schema/dom_element_schema_registry';
import {UrlResolver, DEFAULT_PACKAGE_URL_PROVIDER} from './url_resolver';
import {Parser} from './expression_parser/parser';
import {Lexer} from './expression_parser/lexer';
import {ViewResolver} from './view_resolver';
import {DirectiveResolver} from './directive_resolver';
import {PipeResolver} from './pipe_resolver';
import {Console, Reflector, reflector, ReflectorReader} from '../core_private';
import {XHR} from './xhr';

/**
 * A set of providers that provide `RuntimeCompiler` and its dependencies to use for
 * template compilation.
 */
export const COMPILER_PROVIDERS: Array<any|Type|{[k: string]: any}|any[]> =
    /*@ts2dart_const*/[
      {provide: PLATFORM_DIRECTIVES, useValue: [], multi: true},
      {provide: PLATFORM_PIPES, useValue: [], multi: true},
      {provide: Reflector, useValue: reflector},
      {provide: ReflectorReader, useExisting: Reflector},
      Console,
      Lexer,
      Parser,
      HtmlParser,
      TemplateParser,
      DirectiveNormalizer,
      CompileMetadataResolver,
      DEFAULT_PACKAGE_URL_PROVIDER,
      StyleCompiler,
      ViewCompiler,
      AppModuleCompiler,
      /*@ts2dart_Provider*/ {provide: CompilerConfig, useValue: new CompilerConfig()},
      RuntimeCompiler,
      /*@ts2dart_Provider*/ {provide: ComponentResolver, useExisting: RuntimeCompiler},
      /*@ts2dart_Provider*/ {provide: Compiler, useExisting: RuntimeCompiler},
      DomElementSchemaRegistry,
      /*@ts2dart_Provider*/ {provide: ElementSchemaRegistry, useExisting: DomElementSchemaRegistry},
      UrlResolver,
      ViewResolver,
      DirectiveResolver,
      PipeResolver
    ];

@Injectable()
export class _RuntimeCompilerFactory extends CompilerFactory {
  createCompiler(options: CompilerOptions): Compiler {
    const deprecationMessages: string[] = [];
    let platformDirectivesFromAppProviders: any[] = [];
    let platformPipesFromAppProviders: any[] = [];
    let compilerProvidersFromAppProviders: any[] = [];
    let useDebugFromAppProviders: boolean;
    let useJitFromAppProviders: boolean;
    let defaultEncapsulationFromAppProviders: ViewEncapsulation;

    if (options.deprecatedAppProviders && options.deprecatedAppProviders.length > 0) {
      // Note: This is a hack to still support the old way
      // of configuring platform directives / pipes and the compiler xhr.
      // This will soon be deprecated!
      const inj = ReflectiveInjector.resolveAndCreate(options.deprecatedAppProviders);
      const compilerConfig: CompilerConfig = inj.get(CompilerConfig, null);
      if (compilerConfig) {
        platformDirectivesFromAppProviders = compilerConfig.platformDirectives;
        platformPipesFromAppProviders = compilerConfig.platformPipes;
        useJitFromAppProviders = compilerConfig.useJit;
        useDebugFromAppProviders = compilerConfig.genDebugInfo;
        defaultEncapsulationFromAppProviders = compilerConfig.defaultEncapsulation;
        deprecationMessages.push(
            `Passing a CompilerConfig to "bootstrap()" as provider is deprecated. Pass the provider via the new parameter "compilerOptions" of "bootstrap()" instead.`);
      } else {
        // If nobody provided a CompilerConfig, use the
        // PLATFORM_DIRECTIVES / PLATFORM_PIPES values directly if existing
        platformDirectivesFromAppProviders = inj.get(PLATFORM_DIRECTIVES, []);
        if (platformDirectivesFromAppProviders.length > 0) {
          deprecationMessages.push(
              `Passing PLATFORM_DIRECTIVES to "bootstrap()" as provider is deprecated. Use the new parameter "directives" of "bootstrap()" instead.`);
        }
        platformPipesFromAppProviders = inj.get(PLATFORM_PIPES, []);
        if (platformPipesFromAppProviders.length > 0) {
          deprecationMessages.push(
              `Passing PLATFORM_PIPES to "bootstrap()" as provider is deprecated. Use the new parameter "pipes" of "bootstrap()" instead.`);
        }
      }
      const xhr = inj.get(XHR, null);
      if (xhr) {
        compilerProvidersFromAppProviders.push([{provide: XHR, useValue: xhr}]);
        deprecationMessages.push(
            `Passing an instance of XHR to "bootstrap()" as provider is deprecated. Pass the provider via the new parameter "compilerOptions" of "bootstrap()" instead.`);
      }
      // Need to copy console from deprecatedAppProviders to compiler providers
      // as well so that we can test the above deprecation messages in old style bootstrap
      // where we only have app providers!
      const console = inj.get(Console, null);
      if (console) {
        compilerProvidersFromAppProviders.push([{provide: Console, useValue: console}]);
      }
    }

    const injector = ReflectiveInjector.resolveAndCreate([
      COMPILER_PROVIDERS, {
        provide: CompilerConfig,
        useFactory: (platformDirectives: any[], platformPipes: any[]) => {
          return new CompilerConfig({
            platformDirectives:
                _mergeArrays(platformDirectivesFromAppProviders, platformDirectives),
            platformPipes: _mergeArrays(platformPipesFromAppProviders, platformPipes),
            // let explicit values from the compiler options overwrite options
            // from the app providers. E.g. important for the testing platform.
            genDebugInfo: _firstDefined(options.useDebug, useDebugFromAppProviders, isDevMode()),
            // let explicit values from the compiler options overwrite options
            // from the app providers
            useJit: _firstDefined(options.useJit, useJitFromAppProviders, true),
            // let explicit values from the compiler options overwrite options
            // from the app providers
            defaultEncapsulation: _firstDefined(
                options.defaultEncapsulation, defaultEncapsulationFromAppProviders,
                ViewEncapsulation.Emulated)
          });
        },
        deps: [PLATFORM_DIRECTIVES, PLATFORM_PIPES]
      },
      // options.providers will always contain a provider for XHR as well
      // (added by platforms). So allow compilerProvidersFromAppProviders to overwrite this
      _mergeArrays(options.providers, compilerProvidersFromAppProviders)
    ]);
    const console: Console = injector.get(Console);
    deprecationMessages.forEach((msg) => { console.warn(msg); });

    return injector.get(Compiler);
  }
}


export const RUNTIME_COMPILER_FACTORY = new _RuntimeCompilerFactory();

function _firstDefined<T>(...args: T[]): T {
  for (var i = 0; i < args.length; i++) {
    if (args[i] !== undefined) {
      return args[i];
    }
  }
  return undefined;
}

function _mergeArrays(...parts: any[][]): any[] {
  let result: any[] = [];
  parts.forEach((part) => result.push(...part));
  return result;
}
