/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, NgModuleRef, ɵgetInjectableDef as getInjectableDef} from '@angular/core';

/**
 *
 */
export class TestInjector implements Injector {
  constructor(private parent: Injector) {}

  get(token: any, notFoundValue: any = Injector.THROW_IF_NOT_FOUND, _flags?: any) {
    return getImpl(
        token, notFoundValue, () => { return this.parent.get(token, notFoundValue, _flags); });
  }

  static patchModuleRef(moduleRef: NgModuleRef<any>) {
    const module = moduleRef as any as TestInjector;
    const originalGet = module.get;
    // overwrite get method on `NgModuleRef_` defined in refs.ts
    // and make sure that values provided in root will not be resolved
    module.get = function(token: any, notFoundValue: any) {
      const args = arguments;
      return getImpl(token, notFoundValue, () => { return originalGet.apply(moduleRef, args); });
    };
  }
}

function getImpl(token: any, notFoundValue: any, callback: () => any) {
  const injectableDef = getInjectableDef(token);
  if (injectableDef && injectableDef.providedIn === 'root') {
    if (notFoundValue !== Injector.THROW_IF_NOT_FOUND) {
      return notFoundValue;
    }
    throw new Error(`${token} is not provided in test bed`);
  }
  return callback();
}