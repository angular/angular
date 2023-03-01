/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';

import {RouterOutlet} from '../directives/router_outlet';

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
  standalone: true,
})
export class ɵEmptyOutletComponent {
}

export {ɵEmptyOutletComponent as EmptyOutletComponent};
