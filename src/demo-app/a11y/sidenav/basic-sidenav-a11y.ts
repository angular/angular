/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ViewEncapsulation} from '@angular/core';


@Component({
  moduleId: module.id,
  selector: 'basic-sidenav-a11y',
  templateUrl: 'basic-sidenav-a11y.html',
  styleUrls: ['shared.css'],
  host: {'class': 'a11y-demo-sidenav-app'},
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
})
export class SidenavBasicAccessibilityDemo {}
