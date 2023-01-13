/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompilerConfig} from '@angular/compiler';
import {Compiler, CompilerFactory, CompilerOptions, InjectionToken, Injector, MissingTranslationStrategy, PACKAGE_ROOT_URL, StaticProvider, ViewEncapsulation} from '@angular/core';

export const ERROR_COLLECTOR_TOKEN = new InjectionToken('ErrorCollector');

/**
 * A default provider for {@link PACKAGE_ROOT_URL} that maps to '/'.
 */
export const DEFAULT_PACKAGE_URL_PROVIDER = {
  provide: PACKAGE_ROOT_URL,
  useValue: '/'
};

export const COMPILER_PROVIDERS =
    <StaticProvider[]>[{provide: Compiler, useFactory: () => new Compiler()}];
/**
 * @publicApi
 *
 * @deprecated
 * Ivy JIT mode doesn't require accessing this symbol.
 * See [JIT API changes due to ViewEngine deprecation](guide/deprecations#jit-api-changes) for
 * additional context.
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
    const injector = Injector.create({
      providers: [
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
              preserveWhitespaces: opts.preserveWhitespaces,
            });
          },
          deps: []
        },
        opts.providers!
      ]
    });
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
