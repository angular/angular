/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {INJECTOR, Injector} from '../di/injector';
import {InjectFlags} from '../di/interface/injector';
import {StaticProvider} from '../di/interface/provider';
import {R3Injector, createInjector} from '../di/r3_injector';
import {Type} from '../interface/type';
import {ComponentFactoryResolver as viewEngine_ComponentFactoryResolver} from '../linker/component_factory_resolver';
import {InternalNgModuleRef, NgModuleFactory as viewEngine_NgModuleFactory, NgModuleRef as viewEngine_NgModuleRef} from '../linker/ng_module_factory';
import {NgModuleDef} from '../metadata/ng_module';
import {assertDefined} from '../util/assert';
import {stringify} from '../util/stringify';

import {ComponentFactoryResolver} from './component_ref';
import {getNgModuleDef} from './definition';

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

    this._bootstrapComponents = ngModuleDef !.bootstrap;
    const additionalProviders: StaticProvider[] = [
      {
        provide: viewEngine_NgModuleRef,
        useValue: this,
      },
      COMPONENT_FACTORY_RESOLVER
    ];
    this._r3Injector = createInjector(ngModuleType, _parent, additionalProviders) as R3Injector;
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
  constructor(public moduleType: Type<T>) { super(); }

  create(parentInjector: Injector|null): viewEngine_NgModuleRef<T> {
    return new NgModuleRef(this.moduleType, parentInjector);
  }
}
