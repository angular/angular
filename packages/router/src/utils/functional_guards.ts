/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {inject, Type} from '@angular/core';

import {CanActivateChildFn, CanActivateFn, CanDeactivateFn, CanMatchFn, ResolveFn} from '../models';

/**
 * A set of functions for converting arrays of injectable classes to equivalent guard functions for
 * use in a `Route` definition.
 *
 * Usage {@example router/utils/functional_guards.ts region='CanActivate'}
 *
 * @publicApi
 * @see Route
 */
export const mapToGuards = {
  canMatch(providers: Array<Type<{canMatch: CanMatchFn}>>): CanMatchFn[] {
    return providers.map(provider => (...params) => inject(provider).canMatch(...params));
  },
  canActivate(providers: Array<Type<{canActivate: CanActivateFn}>>): CanActivateFn[] {
    return providers.map(provider => (...params) => inject(provider).canActivate(...params));
  },
  canActivateChild(
      providers: Array<Type<{canActivateChild: CanActivateChildFn}>>): CanActivateChildFn[] {
    return providers.map(provider => (...params) => inject(provider).canActivateChild(...params));
  },
  canDeactivate(providers: Array<Type<{canDeactivate: CanDeactivateFn<unknown>}>>):
      CanDeactivateFn<unknown>[] {
        return providers.map(provider => (...params) => inject(provider).canDeactivate(...params));
      },
  resolve(providers: Array<Type<{resolve: ResolveFn<unknown>}>>): ResolveFn<unknown>[] {
    return providers.map(provider => (...params) => inject(provider).resolve(...params));
  },
};
