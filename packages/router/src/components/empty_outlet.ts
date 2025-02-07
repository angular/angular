/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';

import {RouterOutlet} from '../directives/router_outlet';
import {PRIMARY_OUTLET} from '../shared';
import {Route} from '../models';
export {ɵEmptyOutletComponent as EmptyOutletComponent};

/**
 * This component is used internally within the router to be a placeholder when an empty
 * router-outlet is needed. For example, with a config such as:
 *
 * `{path: 'parent', outlet: 'nav', children: [...]}`
 *
 * In order to render, there needs to be a component on this config, which will default
 * to this `EmptyOutletComponent`.
 */
@Component({
  template: `<router-outlet></router-outlet>`,
  imports: [RouterOutlet],
})
export class ɵEmptyOutletComponent {}

/**
 * Makes a copy of the config and adds any default required properties.
 */
export function standardizeConfig(r: Route): Route {
  const children = r.children && r.children.map(standardizeConfig);
  const c = children ? {...r, children} : {...r};
  if (
    !c.component &&
    !c.loadComponent &&
    (children || c.loadChildren) &&
    c.outlet &&
    c.outlet !== PRIMARY_OUTLET
  ) {
    c.component = ɵEmptyOutletComponent;
  }
  return c;
}
