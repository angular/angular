/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RouterOutlet} from './directives/router_outlet';

/**
 * @whatItDoes Contains all the router outlets created in a component.
 *
 * @stable
 */
export class RouterOutletMap {
  /** @internal */
  _outlets: {[name: string]: RouterOutlet} = {};

  /**
   * Adds an outlet to this map.
   */
  registerOutlet(name: string, outlet: RouterOutlet): void { this._outlets[name] = outlet; }

  /**
   * Removes an outlet from this map.
   */
  removeOutlet(name: string): void { this._outlets[name] = undefined !; }
}
