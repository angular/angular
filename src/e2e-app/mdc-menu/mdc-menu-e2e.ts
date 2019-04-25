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
  selector: 'mdc-menu-e2e',
  templateUrl: 'mdc-menu-e2e.html',
  styles: [`
    #before-t, #above-t, #combined-t {
      width: 60px;
      height: 20px;
    }

    .bottom-row {
      margin-top: 5px;
    }
  `]
})
export class MdcMenuE2e {
  selected: string = '';
}
