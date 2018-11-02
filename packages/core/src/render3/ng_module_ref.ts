/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector} from '../di/injector';
import {StaticProvider} from '../di/provider';
import {createInjector} from '../di/r3_injector';
import {ComponentFactoryResolver as viewEngine_ComponentFactoryResolver} from '../linker/component_factory_resolver';
import {InternalNgModuleRef, NgModuleFactory as viewEngine_NgModuleFactory, NgModuleRef as viewEngine_NgModuleRef} from '../linker/ng_module_factory';
import {NgModuleDef} from '../metadata/ng_module';
import {Type} from '../type';
import {stringify} from '../util';
import {assertDefined} from './assert';
import {ComponentFactoryResolver} from './component_ref';
import {getNgModuleDef} from './definition';

export interface NgModuleType { ngModuleDef: NgModuleDef<any>; }

export const COMPONENT_FACTORY_RESOLVER: StaticProvider = {
  provide: viewEngine_ComponentFactoryResolver,
  useFactory: () => new ComponentFactoryResolver(),
  deps: [],
};

export class NgModuleRef<T> extends viewEngine_NgModuleRef<T> implements InternalNgModuleRef<T> {
  // tslint:disable-next-line:require-internal-with-underscore
  _bootstrapComponents: Type<any>[] = [];
  injector: Injector;
  componentFactoryResolver: viewEngine_ComponentFactoryResolver;
  instance: T;
  destroyCbs: (() => void)[]|null = [];

  constructor(ngModuleType: Type<T>, parentInjector: Injector|null) {
    super();
    const ngModuleDef = getNgModuleDef(ngModuleType);
    ngDevMode && assertDefined(
                     ngModuleDef,
                     `NgModule '${stringify(ngModuleType)}' is not a subtype of 'NgModuleType'.`);

    this._bootstrapComponents = ngModuleDef !.bootstrap;
    const additionalProviders: StaticProvider[] = [
      COMPONENT_FACTORY_RESOLVER, {
        provide: viewEngine_NgModuleRef,
        useValue: this,
      }
    ];
    this.injector = createInjector(ngModuleType, parentInjector, additionalProviders);
    this.instance = this.injector.get(ngModuleType);
    this.componentFactoryResolver = new ComponentFactoryResolver();
  }

  destroy(): void {
    ngDevMode && assertDefined(this.destroyCbs, 'NgModule already destroyed');
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
