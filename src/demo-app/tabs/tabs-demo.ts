/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'tabs-demo',
  templateUrl: 'tabs-demo.html',
})
export class TabsDemo {
  examples = [
    'tab-group-basic',
    'tab-group-dynamic-height',
    'tab-group-stretched',
    'tab-group-async',
    'tab-group-custom-label',
    'tab-group-header-below',
    'tab-group-theme',
    'tab-group-lazy-loaded',
    'tab-group-dynamic',
    'tab-nav-bar-basic',
  ];
}
