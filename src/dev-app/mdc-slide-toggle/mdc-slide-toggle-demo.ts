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
  selector: 'mdc-slide-toggle-demo',
  templateUrl: 'mdc-slide-toggle-demo.html',
  styleUrls: ['mdc-slide-toggle-demo.css'],
})
export class MdcSlideToggleDemo {
  firstToggle: boolean;

  onFormSubmit() {
    alert(`You submitted the form.`);
  }
}
