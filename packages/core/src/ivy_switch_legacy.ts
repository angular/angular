/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectableType, InjectorType, defineInjectable, defineInjector, getInjectableDef} from './di/defs';
import {InjectableProvider} from './di/injectable';
import {inject, injectArgs} from './di/injector';
import {ClassSansProvider, ConstructorSansProvider, ExistingSansProvider, FactorySansProvider, StaticClassSansProvider, ValueProvider, ValueSansProvider} from './di/provider';
import * as ivyOn from './ivy_switch_on';
import {NgModule} from './metadata';
import {ReflectionCapabilities} from './reflection/reflection_capabilities';
import {Type} from './type';
import {getClosureSafeProperty} from './util/property';

function noop() {}

export interface DirectiveCompiler { (type: any, meta: any): void; }

export const R3_COMPILE_COMPONENT__POST_NGCC__: DirectiveCompiler = ivyOn.R3_COMPILE_COMPONENT;
export const R3_COMPILE_DIRECTIVE__POST_NGCC__: DirectiveCompiler = ivyOn.R3_COMPILE_DIRECTIVE;
export const R3_COMPILE_INJECTABLE__POST_NGCC__: DirectiveCompiler = ivyOn.R3_COMPILE_INJECTABLE;
export const R3_COMPILE_NGMODULE__POST_NGCC__: DirectiveCompiler = ivyOn.R3_COMPILE_NGMODULE;
export const R3_COMPILE_PIPE__POST_NGCC__: DirectiveCompiler = ivyOn.R3_COMPILE_PIPE;

export const R3_ELEMENT_REF_FACTORY__POST_NGCC__ = ivyOn.R3_ELEMENT_REF_FACTORY;
export const R3_TEMPLATE_REF_FACTORY__POST_NGCC__ = ivyOn.R3_TEMPLATE_REF_FACTORY;
export const R3_CHANGE_DETECTOR_REF_FACTORY__POST_NGCC__ = ivyOn.R3_CHANGE_DETECTOR_REF_FACTORY;
export const R3_VIEW_CONTAINER_REF_FACTORY__POST_NGCC__ = ivyOn.R3_VIEW_CONTAINER_REF_FACTORY;

export const ivyEnable__POST_NGCC__: boolean = ivyOn.ivyEnabled;

const R3_COMPILE_COMPONENT__PRE_NGCC__: DirectiveCompiler = noop;
const R3_COMPILE_DIRECTIVE__PRE_NGCC__: DirectiveCompiler = noop;
const R3_COMPILE_INJECTABLE__PRE_NGCC__: DirectiveCompiler = preR3InjectableCompile;
const R3_COMPILE_NGMODULE__PRE_NGCC__: DirectiveCompiler = preR3NgModuleCompile;
const R3_COMPILE_PIPE__PRE_NGCC__: DirectiveCompiler = noop;

export const R3_ELEMENT_REF_FACTORY__PRE_NGCC__ = noop;
export const R3_TEMPLATE_REF_FACTORY__PRE_NGCC__ = noop;
export const R3_CHANGE_DETECTOR_REF_FACTORY__PRE_NGCC__ = noop;
export const R3_VIEW_CONTAINER_REF_FACTORY__PRE_NGCC__ = noop;

const ivyEnable__PRE_NGCC__ = false;

export const ivyEnabled = ivyEnable__PRE_NGCC__;
export let R3_COMPILE_COMPONENT: DirectiveCompiler = R3_COMPILE_COMPONENT__PRE_NGCC__;
export let R3_COMPILE_DIRECTIVE: DirectiveCompiler = R3_COMPILE_DIRECTIVE__PRE_NGCC__;
export let R3_COMPILE_INJECTABLE: DirectiveCompiler = R3_COMPILE_INJECTABLE__PRE_NGCC__;
export let R3_COMPILE_NGMODULE: DirectiveCompiler = R3_COMPILE_NGMODULE__PRE_NGCC__;
export let R3_COMPILE_PIPE: DirectiveCompiler = R3_COMPILE_PIPE__PRE_NGCC__;

export let R3_ELEMENT_REF_FACTORY = R3_ELEMENT_REF_FACTORY__PRE_NGCC__;
export let R3_TEMPLATE_REF_FACTORY = R3_TEMPLATE_REF_FACTORY__PRE_NGCC__;
export let R3_CHANGE_DETECTOR_REF_FACTORY = R3_CHANGE_DETECTOR_REF_FACTORY__PRE_NGCC__;
export let R3_VIEW_CONTAINER_REF_FACTORY = R3_VIEW_CONTAINER_REF_FACTORY__PRE_NGCC__;

////////////////////////////////////////////////////////////
// Glue code which should be removed after Ivy is default //
////////////////////////////////////////////////////////////

function preR3NgModuleCompile(moduleType: InjectorType<any>, metadata: NgModule): void {
  let imports = (metadata && metadata.imports) || [];
  if (metadata && metadata.exports) {
    imports = [...imports, metadata.exports];
  }

  moduleType.ngInjectorDef = defineInjector({
    factory: convertInjectableProviderToFactory(moduleType, {useClass: moduleType}),
    providers: metadata && metadata.providers,
    imports: imports,
  });
}

const USE_VALUE =
    getClosureSafeProperty<ValueProvider>({provide: String, useValue: getClosureSafeProperty});
const EMPTY_ARRAY: any[] = [];

function convertInjectableProviderToFactory(type: Type<any>, provider?: InjectableProvider): () =>
    any {
  if (!provider) {
    const reflectionCapabilities = new ReflectionCapabilities();
    const deps = reflectionCapabilities.parameters(type);
    // TODO - convert to flags.
    return () => new type(...injectArgs(deps as any[]));
  }

  if (USE_VALUE in provider) {
    const valueProvider = (provider as ValueSansProvider);
    return () => valueProvider.useValue;
  } else if ((provider as ExistingSansProvider).useExisting) {
    const existingProvider = (provider as ExistingSansProvider);
    return () => inject(existingProvider.useExisting);
  } else if ((provider as FactorySansProvider).useFactory) {
    const factoryProvider = (provider as FactorySansProvider);
    return () => factoryProvider.useFactory(...injectArgs(factoryProvider.deps || EMPTY_ARRAY));
  } else if ((provider as StaticClassSansProvider | ClassSansProvider).useClass) {
    const classProvider = (provider as StaticClassSansProvider | ClassSansProvider);
    let deps = (provider as StaticClassSansProvider).deps;
    if (!deps) {
      const reflectionCapabilities = new ReflectionCapabilities();
      deps = reflectionCapabilities.parameters(type);
    }
    return () => new classProvider.useClass(...injectArgs(deps));
  } else {
    let deps = (provider as ConstructorSansProvider).deps;
    if (!deps) {
      const reflectionCapabilities = new ReflectionCapabilities();
      deps = reflectionCapabilities.parameters(type);
    }
    return () => new type(...injectArgs(deps !));
  }
}

/**
 * Supports @Injectable() in JIT mode for Render2.
 */
function preR3InjectableCompile(
    injectableType: InjectableType<any>,
    options: {providedIn?: Type<any>| 'root' | null} & InjectableProvider): void {
  if (options && options.providedIn !== undefined && !getInjectableDef(injectableType)) {
    injectableType.ngInjectableDef = defineInjectable({
      providedIn: options.providedIn,
      factory: convertInjectableProviderToFactory(injectableType, options),
    });
  }
}
