/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PlatformRef, Type} from '@angular/core';
import * as angular from '@angular/upgrade/src/common/angular1';
import {$ROOT_SCOPE} from '@angular/upgrade/src/common/constants';
import {UpgradeModule} from '@angular/upgrade/static';

export * from '../common/test_helpers';

export function bootstrap(
    platform: PlatformRef, Ng2Module: Type<{}>, element: Element, ng1Module: angular.IModule) {
  // We bootstrap the Angular module first; then when it is ready (async)
  // We bootstrap the AngularJS module on the bootstrap element
  return platform.bootstrapModule(Ng2Module).then(ref => {
    const upgrade = ref.injector.get(UpgradeModule) as UpgradeModule;
    upgrade.bootstrap(element, [ng1Module.name]);
    return upgrade;
  });
}

export function $apply(adapter: UpgradeModule, exp: angular.Ng1Expression) {
  const $rootScope = adapter.$injector.get($ROOT_SCOPE) as angular.IRootScopeService;
  $rootScope.$apply(exp);
}

export function $digest(adapter: UpgradeModule) {
  const $rootScope = adapter.$injector.get($ROOT_SCOPE) as angular.IRootScopeService;
  $rootScope.$digest();
}
