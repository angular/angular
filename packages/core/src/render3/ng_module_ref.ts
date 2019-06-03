/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector} from '../di/injector';
import {INJECTOR} from '../di/injector_compatibility';
import {InjectFlags} from '../di/interface/injector';
import {StaticProvider} from '../di/interface/provider';
import {R3Injector, createInjector} from '../di/r3_injector';
import {Type} from '../interface/type';
import {ComponentFactoryResolver as viewEngine_ComponentFactoryResolver} from '../linker/component_factory_resolver';
import {InternalNgModuleRef, NgModuleFactory as viewEngine_NgModuleFactory, NgModuleRef as viewEngine_NgModuleRef} from '../linker/ng_module_factory';
import {registerNgModuleType} from '../linker/ng_module_factory_registration';
import {NgModuleDef} from '../metadata/ng_module';
import {assertDefined} from '../util/assert';
import {stringify} from '../util/stringify';

import {ComponentFactoryResolver} from './component_ref';
import {getNgLocaleIdDef, getNgModuleDef} from './definition';
import {setLocaleId} from './i18n';
import {maybeUnwrapFn} from './util/misc_utils';

export interface NgModuleType<T = any> extends Type<T> { ngModuleDef: NgModuleDef<T>; }

const COMPONENT_FACTORY_RESOLVER: StaticProvider = {
  provide: viewEngine_ComponentFactoryResolver,
  useClass: ComponentFactoryResolver,
  deps: [viewEngine_NgModuleRef],
};

export class NgModuleRef<T> extends viewEngine_NgModuleRef<T> implements InternalNgModuleRef<T> {
  // tslint:disable-next-line:require-internal-with-underscore
  _bootstrapComponents: Type<any>[] = [];
  // tslint:disable-next-line:require-internal-with-underscore
  _r3Injector: R3Injector;
  injector: Injector = this;
  instance: T;
  destroyCbs: (() => void)[]|null = [];

  constructor(ngModuleType: Type<T>, public _parent: Injector|null) {
    super();
    const ngModuleDef = getNgModuleDef(ngModuleType);
    ngDevMode && assertDefined(
                     ngModuleDef,
                     `NgModule '${stringify(ngModuleType)}' is not a subtype of 'NgModuleType'.`);

    const ngLocaleIdDef = getNgLocaleIdDef(ngModuleType);
    if (ngLocaleIdDef) {
      setLocaleId(ngLocaleIdDef);
    }

    this._bootstrapComponents = maybeUnwrapFn(ngModuleDef !.bootstrap);
    const additionalProviders: StaticProvider[] = [
      {
        provide: viewEngine_NgModuleRef,
        useValue: this,
      },
      COMPONENT_FACTORY_RESOLVER
    ];
    this._r3Injector = createInjector(
        ngModuleType, _parent, additionalProviders, stringify(ngModuleType)) as R3Injector;
    this.instance = this.get(ngModuleType);
  }

  get(token: any, notFoundValue: any = Injector.THROW_IF_NOT_FOUND,
      injectFlags: InjectFlags = InjectFlags.Default): any {
    if (token === Injector || token === viewEngine_NgModuleRef || token === INJECTOR) {
      return this;
    }
    return this._r3Injector.get(token, notFoundValue, injectFlags);
  }

  get componentFactoryResolver(): viewEngine_ComponentFactoryResolver {
    return this.get(viewEngine_ComponentFactoryResolver);
  }

  destroy(): void {
    ngDevMode && assertDefined(this.destroyCbs, 'NgModule already destroyed');
    const injector = this._r3Injector;
    !injector.destroyed && injector.destroy();
    this.destroyCbs !.forEach(fn => fn());
    this.destroyCbs = null;
  }
  onDestroy(callback: () => void): void {
    ngDevMode && assertDefined(this.destroyCbs, 'NgModule already destroyed');
    this.destroyCbs !.push(callback);
  }
}

export class NgModuleFactory<T> extends viewEngine_NgModuleFactory<T> {
  constructor(public moduleType: Type<T>) {
    super();

    const ngModuleDef = getNgModuleDef(moduleType);
    if (ngModuleDef !== null) {
      // Register the NgModule with Angular's module registry. The location (and hence timing) of
      // this call is critical to ensure this works correctly (modules get registered when expected)
      // without bloating bundles (modules are registered when otherwise not referenced).
      //
      // In View Engine, registration occurs in the .ngfactory.js file as a side effect. This has
      // several practical consequences:
      //
      // - If an .ngfactory file is not imported from, the module won't be registered (and can be
      //   tree shaken).
      // - If an .ngfactory file is imported from, the module will be registered even if an instance
      //   is not actually created (via `create` below).
      // - Since an .ngfactory file in View Engine references the .ngfactory files of the NgModule's
      //   imports,
      //
      // In Ivy, things are a bit different. .ngfactory files still exist for compatibility, but are
      // not a required API to use - there are other ways to obtain an NgModuleFactory for a given
      // NgModule. Thus, relying on a side effect in the .ngfactory file is not sufficient. Instead,
      // the side effect of registration is added here, in the constructor of NgModuleFactory,
      // ensuring no matter how a factory is created, the module is registered correctly.
      //
      // An alternative would be to include the registration side effect inline following the actual
      // NgModule definition. This also has the correct timing, but breaks tree-shaking - modules
      // will be registered and retained even if they're otherwise never referenced.
      registerNgModuleType(moduleType as NgModuleType);
    }
  }

  create(parentInjector: Injector|null): viewEngine_NgModuleRef<T> {
    return new NgModuleRef(this.moduleType, parentInjector);
  }
}
