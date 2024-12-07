/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {getCompilerFacade, JitCompilerUsage} from '../compiler/compiler_facade';
import {Injector} from '../di/injector';
import {Type} from '../interface/type';
import {COMPILER_OPTIONS, CompilerOptions} from '../linker/compiler';
import {NgModuleFactory} from '../linker/ng_module_factory';
import {
  isComponentResourceResolutionQueueEmpty,
  resolveComponentResources,
} from '../metadata/resource_loading';
import {assertNgModuleType} from '../render3/assert';
import {setJitOptions} from '../render3/jit/jit_options';
import {NgModuleFactory as R3NgModuleFactory} from '../render3/ng_module_ref';

export function compileNgModuleFactory<M>(
  injector: Injector,
  options: CompilerOptions,
  moduleType: Type<M>,
): Promise<NgModuleFactory<M>> {
  ngDevMode && assertNgModuleType(moduleType);

  const moduleFactory = new R3NgModuleFactory(moduleType);

  // All of the logic below is irrelevant for AOT-compiled code.
  if (typeof ngJitMode !== 'undefined' && !ngJitMode) {
    return Promise.resolve(moduleFactory);
  }

  const compilerOptions = injector.get(COMPILER_OPTIONS, []).concat(options);

  // Configure the compiler to use the provided options. This call may fail when multiple modules
  // are bootstrapped with incompatible options, as a component can only be compiled according to
  // a single set of options.
  setJitOptions({
    defaultEncapsulation: _lastDefined(compilerOptions.map((opts) => opts.defaultEncapsulation)),
    preserveWhitespaces: _lastDefined(compilerOptions.map((opts) => opts.preserveWhitespaces)),
  });

  if (isComponentResourceResolutionQueueEmpty()) {
    return Promise.resolve(moduleFactory);
  }

  const compilerProviders = compilerOptions.flatMap((option) => option.providers ?? []);

  // In case there are no compiler providers, we just return the module factory as
  // there won't be any resource loader. This can happen with Ivy, because AOT compiled
  // modules can be still passed through "bootstrapModule". In that case we shouldn't
  // unnecessarily require the JIT compiler.
  if (compilerProviders.length === 0) {
    return Promise.resolve(moduleFactory);
  }

  const compiler = getCompilerFacade({
    usage: JitCompilerUsage.Decorator,
    kind: 'NgModule',
    type: moduleType,
  });
  const compilerInjector = Injector.create({providers: compilerProviders});
  const resourceLoader = compilerInjector.get(compiler.ResourceLoader);
  // The resource loader can also return a string while the "resolveComponentResources"
  // always expects a promise. Therefore we need to wrap the returned value in a promise.
  return resolveComponentResources((url) => Promise.resolve(resourceLoader.get(url))).then(
    () => moduleFactory,
  );
}

function _lastDefined<T>(args: T[]): T | undefined {
  for (let i = args.length - 1; i >= 0; i--) {
    if (args[i] !== undefined) {
      return args[i];
    }
  }
  return undefined;
}
