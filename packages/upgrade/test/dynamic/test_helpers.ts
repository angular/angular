/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {UpgradeAdapterRef} from '@angular/upgrade';
import * as angular from '@angular/upgrade/src/common/angular1';
import {$ROOT_SCOPE} from '@angular/upgrade/src/common/constants';

export * from '../common/test_helpers';

export function $apply(adapter: UpgradeAdapterRef, exp: angular.Ng1Expression) {
  const $rootScope = adapter.ng1Injector.get($ROOT_SCOPE) as angular.IRootScopeService;
  $rootScope.$apply(exp);
}

export function $digest(adapter: UpgradeAdapterRef) {
  const $rootScope = adapter.ng1Injector.get($ROOT_SCOPE) as angular.IRootScopeService;
  $rootScope.$digest();
}
