/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AppModuleFactory, AppModuleRef, bootstrapModuleFactory} from '@angular/core';
import {ComponentFixture} from '@angular/core/testing';
import {serverPlatform} from '@angular/platform-server';

import {MainModuleNgFactory} from '../src/module.ngfactory';

export function createModule<M>(factory: AppModuleFactory<M>): AppModuleRef<M> {
  return bootstrapModuleFactory(factory, serverPlatform());
}

export function createComponent<C>(
    comp: {new (...args: any[]): C},
    moduleFactory: AppModuleFactory<any> = null): ComponentFixture<C> {
  if (!moduleFactory) {
    moduleFactory = MainModuleNgFactory;
  }
  const moduleRef = createModule(moduleFactory);
  const compRef =
      moduleRef.componentFactoryResolver.resolveComponentFactory(comp).create(moduleRef.injector);
  return new ComponentFixture(compRef, null, null);
}
