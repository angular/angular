/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CompilerConfig} from '@angular/compiler';
import {
  Compiler,
  CompilerFactory,
  CompilerOptions,
  Injector,
  StaticProvider,
  ViewEncapsulation,
} from '@angular/core';

export const COMPILER_PROVIDERS = <StaticProvider[]>[
  {provide: Compiler, useFactory: () => new Compiler()},
];
/**
 * @publicApi
 *
 * @deprecated
 * Ivy JIT mode doesn't require accessing this symbol.
 */
export class JitCompilerFactory implements CompilerFactory {
  private _defaultOptions: CompilerOptions[];

  /** @internal */
  constructor(defaultOptions: CompilerOptions[]) {
    const compilerOptions: CompilerOptions = {
      defaultEncapsulation: ViewEncapsulation.Emulated,
    };

    this._defaultOptions = [compilerOptions, ...defaultOptions];
  }

  createCompiler(options: CompilerOptions[] = []): Compiler {
    const opts = _mergeOptions(this._defaultOptions.concat(options));
    const injector = Injector.create({
      providers: [
        COMPILER_PROVIDERS,
        {
          provide: CompilerConfig,
          useFactory: () => {
            return new CompilerConfig({
              defaultEncapsulation: opts.defaultEncapsulation,
              preserveWhitespaces: opts.preserveWhitespaces,
            });
          },
          deps: [],
        },
        opts.providers!,
      ],
    });
    return injector.get(Compiler);
  }
}

function _mergeOptions(optionsArr: CompilerOptions[]): CompilerOptions {
  return {
    defaultEncapsulation: _lastDefined(optionsArr.map((options) => options.defaultEncapsulation)),
    providers: _mergeArrays(optionsArr.map((options) => options.providers!)),
    preserveWhitespaces: _lastDefined(optionsArr.map((options) => options.preserveWhitespaces)),
  };
}

function _lastDefined<T>(args: T[]): T | undefined {
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
