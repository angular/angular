/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {TooltipPosition} from '@angular/material';


@Component({
  moduleId: module.id,
  selector: 'tooltip-demo',
  templateUrl: 'tooltip-demo.html',
  styleUrls: ['tooltip-demo.css'],
})
export class TooltipDemo {
  position: TooltipPosition = 'after';
  message = 'Here is the tooltip';
  tooltips: string[] = [];
  disabled = false;
  showDelay = 0;
  hideDelay = 0;
  showExtraClass = false;
}
