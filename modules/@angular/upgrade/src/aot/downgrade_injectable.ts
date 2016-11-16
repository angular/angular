/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector} from '@angular/core';
import {INJECTOR_KEY} from './constants';

/**
 * @whatItDoes
 *
 * *Part of the [upgrade/static](/docs/ts/latest/api/#!?query=upgrade%2Fstatic)
 * library for hybrid upgrade apps that support AoT compilation*
 *
 * Allow an Angular 2+ service to be accessible from Angular 1.
 *
 * @howToUse
 *
 * First ensure that the service to be downgraded is provided in an {@link NgModule}
 * that will be part of the upgrade application. For example, let's assume we have
 * defined `HeroesService`
 *
 * {@example upgrade/static/ts/module.ts region="ng2-heroes-service"}
 *
 * and that we have included this in our upgrade app {@link NgModule}
 *
 * {@example upgrade/static/ts/module.ts region="ng2-module"}
 *
 * Now we can register the `downgradeInjectable` factory function for the service
 * on an Angular 1 module.
 *
 * {@example upgrade/static/ts/module.ts region="downgrade-ng2-heroes-service"}
 *
 * Inside an Angular 1 component's controller we can get hold of the
 * downgraded service via the name we gave when downgrading.
 *
 * {@example upgrade/static/ts/module.ts region="example-app"}
 *
 * @description
 *
 * Takes a `token` that identifies a service provided from Angular 2+.
 *
 * Returns a [factory function](https://docs.angularjs.org/guide/di) that can be
 * used to register the service on an Angular 1 module.
 *
 * The factory function provides access to the Angular 2+ service that
 * is identified by the `token` parameter.
 *
 * @experimental
 */
export function downgradeInjectable(token: any) {
  return [INJECTOR_KEY, (i: Injector) => i.get(token)];
}