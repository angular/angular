/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Inject, Injectable, NgModule} from '@angular/core';
import {downgradeInjectable} from '../../../static';
import * as ng from '../../../src/common/src/angular1';
/*
 * This mock application code contains the following services and their dependencies:
 *
 * shoppingCart (AngularJS)
 *   -> Inventory (Angular - downgraded)
 *      -> serverRequest (AngularJS - upgraded)
 *         -> Logger (Angular - downgraded)
 *
 * This allows us to test two scenarios:
 *  * AngularJS -> Angular -> AngularJS
 *  * Angular -> AngularJS -> Angular
 */

/* START: Angular bits */
@Injectable()
export class Logger {
  warn() {}
}

@Injectable()
export class Inventory {
  constructor(@Inject('serverRequest') public serverRequest: any) {}
}

export function serverRequestFactory(i: ng.IInjectorService) {
  return i.get('serverRequest');
}

@NgModule({
  providers: [
    Logger,
    Inventory,
    {provide: 'serverRequest', useFactory: serverRequestFactory, deps: ['$injector']},
  ],
})
export class AppModule {}
/* END: Angular bits */

/* START: AngularJS bits */
export const serverRequestInstance: {logger?: Logger} = {};
export const shoppingCartInstance: {inventory?: Inventory} = {};

export function defineAppModule() {
  ng.module_('app', [])
    .factory('logger', downgradeInjectable(Logger))
    .factory('inventory', downgradeInjectable(Inventory))
    .factory('serverRequest', [
      'logger',
      function (logger: Logger) {
        serverRequestInstance.logger = logger;
        return serverRequestInstance;
      },
    ])
    .factory('shoppingCart', [
      'inventory',
      function (inventory: Inventory) {
        shoppingCartInstance.inventory = inventory;
        return shoppingCartInstance;
      },
    ]);
}
/* END: AngularJS bits */
