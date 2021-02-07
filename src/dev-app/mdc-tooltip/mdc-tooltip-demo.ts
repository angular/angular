/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {FormControl} from '@angular/forms';
import {TooltipPosition} from '@angular/material-experimental/mdc-tooltip';

@Component({
  selector: 'mdc-tooltip-demo',
  templateUrl: 'mdc-tooltip-demo.html',
  styleUrls: ['mdc-tooltip-demo.css'],
})
export class MdcTooltipDemo {
  message = new FormControl('Info about the action');
  showDelay = new FormControl(0);
  hideDelay = new FormControl(0);
  positionOptions: TooltipPosition[] = ['below', 'after', 'before', 'above', 'left', 'right'];
  position = new FormControl(this.positionOptions[0]);
}
