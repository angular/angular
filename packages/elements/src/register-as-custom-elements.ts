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
 * @whatItDoes Registers an array of Angular Components as Custom Elements.
 *
 * @description registers the `customElementComponents` using an existing `PlatformRef` and compiled
 * `NgModuleFactory`
 *
 * @param {Type<any>[]} customElementComponents
 * @param {PlatformRef} platformRef
 * @param {NgModuleFactory<T>} moduleFactory
 * @returns {Promise<NgModuleRef<T>>}
 * @experimental
 */
export function registerAsCustomElements<T>(
    customElementComponents: Type<any>[], platformRef: PlatformRef,
    moduleFactory: NgModuleFactory<T>): Promise<NgModuleRef<T>>;

/**
 *
 * @description registers the `customElementComponents` using a async bootstrap function, allowing
 * JIT usage (not recommended)
 * @param {Type<any>[]} customElementComponents
 * @param {() => Promise<NgModuleRef<T>>} bootstrapFn
 * @returns {Promise<NgModuleRef<T>>}
 */
export function registerAsCustomElements<T>(
    customElementComponents: Type<any>[],
    bootstrapFn: () => Promise<NgModuleRef<T>>): Promise<NgModuleRef<T>>;
/**
 *
 * @description The `customElement` components passed into this function are wrapped in a subclass
 * of `NgElement` and registered with the browser's
 * [`CustomElementRegistry`](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry)
 *
 * ## Example
 *
 * ```typescript
 * //index.ts
 * import { registerAsCustomElements } from '@angular/elements';
 * import { platformBrowser } from '@angular/platform-browser';
 * import { HelloWorld } from './hello-world.ngfactory';
 * import { HelloWorldModuleNgFactory } from './hello-world.ngfactory';
 *
 * registerAsCustomElements([HelloWorld], platformBrowser(), HelloWorldModuleNgFactory);
 *   .catch(err => console.log(err));
 * ```
 *
 * @param {Type<any>[]} customElementComponents
 * @param {(PlatformRef | (() => Promise<NgModuleRef<T>>))} platformRefOrBootstrapFn
 * @param {NgModuleFactory<T>} [moduleFactory]
 * @returns {Promise<NgModuleRef<T>>}
 */
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
