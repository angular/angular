/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, NgModuleFactory, NgModuleRef, StaticProvider} from '@angular/core';
import {platformBrowser} from '@angular/platform-browser';

import * as angular from '../common/angular1';
import {$INJECTOR, INJECTOR_KEY, LAZY_MODULE_REF, UPGRADE_MODULE_NAME} from '../common/constants';
import {LazyModuleRef, isFunction} from '../common/util';

import {angular1Providers, setTempInjectorRef} from './angular1_providers';
import {NgAdapterInjector} from './util';


/** @experimental */
export function downgradeModule<T>(
    moduleFactoryOrBootstrapFn: NgModuleFactory<T>|
    ((extraProviders: StaticProvider[]) => Promise<NgModuleRef<T>>)): string {
  const LAZY_MODULE_NAME = UPGRADE_MODULE_NAME + '.lazy';
  const bootstrapFn = isFunction(moduleFactoryOrBootstrapFn) ?
      moduleFactoryOrBootstrapFn :
      (extraProviders: StaticProvider[]) =>
          platformBrowser(extraProviders).bootstrapModuleFactory(moduleFactoryOrBootstrapFn);

  let injector: Injector;

  // Create an ng1 module to bootstrap.
  angular.module(LAZY_MODULE_NAME, [])
      .factory(
          INJECTOR_KEY,
          () => {
            if (!injector) {
              throw new Error(
                  'Trying to get the Angular injector before bootstrapping an Angular module.');
            }
            return injector;
          })
      .factory(LAZY_MODULE_REF, [
        $INJECTOR,
        ($injector: angular.IInjectorService) => {
          setTempInjectorRef($injector);
          const result: LazyModuleRef = {
            needsNgZone: true,
            promise: bootstrapFn(angular1Providers).then(ref => {
              injector = result.injector = new NgAdapterInjector(ref.injector);
              injector.get($INJECTOR);

              return injector;
            })
          };
          return result;
        }
      ]);

  return LAZY_MODULE_NAME;
}
