/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {createInjectorWithoutInjectorInstances} from '../di/create_injector';
import {getNullInjector, R3Injector} from '../di/r3_injector';
import {ComponentFactoryResolver as viewEngine_ComponentFactoryResolver} from '../linker/component_factory_resolver';
import {
  NgModuleFactory as viewEngine_NgModuleFactory,
  NgModuleRef as viewEngine_NgModuleRef,
} from '../linker/ng_module_factory';
import {assertDefined} from '../util/assert';
import {stringify} from '../util/stringify';
import {ComponentFactoryResolver} from './component_ref';
import {getNgModuleDef} from './def_getters';
import {maybeUnwrapFn} from './util/misc_utils';
/**
 * Returns a new NgModuleRef instance based on the NgModule class and parent injector provided.
 *
 * @param ngModule NgModule class.
 * @param parentInjector Optional injector instance to use as a parent for the module injector. If
 *     not provided, `NullInjector` will be used instead.
 * @returns NgModuleRef that represents an NgModule instance.
 *
 * @publicApi
 */
export function createNgModule(ngModule, parentInjector) {
  return new NgModuleRef(ngModule, parentInjector ?? null, []);
}
/**
 * The `createNgModule` function alias for backwards-compatibility.
 * Please avoid using it directly and use `createNgModule` instead.
 *
 * @deprecated Use `createNgModule` instead.
 */
export const createNgModuleRef = createNgModule;
export class NgModuleRef extends viewEngine_NgModuleRef {
  constructor(ngModuleType, _parent, additionalProviders, runInjectorInitializers = true) {
    super();
    this.ngModuleType = ngModuleType;
    this._parent = _parent;
    // tslint:disable-next-line:require-internal-with-underscore
    this._bootstrapComponents = [];
    this.destroyCbs = [];
    // When bootstrapping a module we have a dependency graph that looks like this:
    // ApplicationRef -> ComponentFactoryResolver -> NgModuleRef. The problem is that if the
    // module being resolved tries to inject the ComponentFactoryResolver, it'll create a
    // circular dependency which will result in a runtime error, because the injector doesn't
    // exist yet. We work around the issue by creating the ComponentFactoryResolver ourselves
    // and providing it, rather than letting the injector resolve it.
    this.componentFactoryResolver = new ComponentFactoryResolver(this);
    const ngModuleDef = getNgModuleDef(ngModuleType);
    ngDevMode &&
      assertDefined(
        ngModuleDef,
        `NgModule '${stringify(ngModuleType)}' is not a subtype of 'NgModuleType'.`,
      );
    this._bootstrapComponents = maybeUnwrapFn(ngModuleDef.bootstrap);
    this._r3Injector = createInjectorWithoutInjectorInstances(
      ngModuleType,
      _parent,
      [
        {provide: viewEngine_NgModuleRef, useValue: this},
        {
          provide: viewEngine_ComponentFactoryResolver,
          useValue: this.componentFactoryResolver,
        },
        ...additionalProviders,
      ],
      stringify(ngModuleType),
      new Set(['environment']),
    );
    // We need to resolve the injector types separately from the injector creation, because
    // the module might be trying to use this ref in its constructor for DI which will cause a
    // circular error that will eventually error out, because the injector isn't created yet.
    if (runInjectorInitializers) {
      this.resolveInjectorInitializers();
    }
  }
  resolveInjectorInitializers() {
    this._r3Injector.resolveInjectorInitializers();
    this.instance = this._r3Injector.get(this.ngModuleType);
  }
  get injector() {
    return this._r3Injector;
  }
  destroy() {
    ngDevMode && assertDefined(this.destroyCbs, 'NgModule already destroyed');
    const injector = this._r3Injector;
    !injector.destroyed && injector.destroy();
    this.destroyCbs.forEach((fn) => fn());
    this.destroyCbs = null;
  }
  onDestroy(callback) {
    ngDevMode && assertDefined(this.destroyCbs, 'NgModule already destroyed');
    this.destroyCbs.push(callback);
  }
}
export class NgModuleFactory extends viewEngine_NgModuleFactory {
  constructor(moduleType) {
    super();
    this.moduleType = moduleType;
  }
  create(parentInjector) {
    return new NgModuleRef(this.moduleType, parentInjector, []);
  }
}
export function createNgModuleRefWithProviders(moduleType, parentInjector, additionalProviders) {
  return new NgModuleRef(moduleType, parentInjector, additionalProviders, false);
}
export class EnvironmentNgModuleRefAdapter extends viewEngine_NgModuleRef {
  constructor(config) {
    super();
    this.componentFactoryResolver = new ComponentFactoryResolver(this);
    this.instance = null;
    const injector = new R3Injector(
      [
        ...config.providers,
        {provide: viewEngine_NgModuleRef, useValue: this},
        {provide: viewEngine_ComponentFactoryResolver, useValue: this.componentFactoryResolver},
      ],
      config.parent || getNullInjector(),
      config.debugName,
      new Set(['environment']),
    );
    this.injector = injector;
    if (config.runEnvironmentInitializers) {
      injector.resolveInjectorInitializers();
    }
  }
  destroy() {
    this.injector.destroy();
  }
  onDestroy(callback) {
    this.injector.onDestroy(callback);
  }
}
/**
 * Create a new environment injector.
 *
 * @param providers An array of providers.
 * @param parent A parent environment injector.
 * @param debugName An optional name for this injector instance, which will be used in error
 *     messages.
 *
 * @publicApi
 */
export function createEnvironmentInjector(providers, parent, debugName = null) {
  const adapter = new EnvironmentNgModuleRefAdapter({
    providers,
    parent,
    debugName,
    runEnvironmentInitializers: true,
  });
  return adapter.injector;
}
//# sourceMappingURL=ng_module_ref.js.map
