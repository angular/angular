/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModuleFactory, NgModuleRef, PlatformRef, Type} from '@angular/core';

import {NgElements} from './ng-elements';
import {isFunction} from './utils';

/**
 * TODO(gkalpak): Add docs.
 * @experimental
 */
export function registerAsCustomElements<T>(
    customElementComponents: Type<any>[], platformRef: PlatformRef,
    moduleFactory: NgModuleFactory<T>): Promise<NgModuleRef<T>>;
export function registerAsCustomElements<T>(
    customElementComponents: Type<any>[],
    bootstrapFn: () => Promise<NgModuleRef<T>>): Promise<NgModuleRef<T>>;
export function registerAsCustomElements<T>(
    customElementComponents: Type<any>[],
    platformRefOrBootstrapFn: PlatformRef | (() => Promise<NgModuleRef<T>>),
    moduleFactory?: NgModuleFactory<T>): Promise<NgModuleRef<T>> {
  const bootstrapFn = isFunction(platformRefOrBootstrapFn) ?
      platformRefOrBootstrapFn :
      () => platformRefOrBootstrapFn.bootstrapModuleFactory(moduleFactory !);

  return bootstrapFn().then(moduleRef => {
    const ngElements = new NgElements(moduleRef, customElementComponents);
    ngElements.register();
    return moduleRef;
  });
}
