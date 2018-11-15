/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Component} from '@angular/core';
import {EXAMPLE_COMPONENTS} from '@angular/material-examples';

@Component({
  moduleId: module.id,
  selector: 'tooltip-demo',
  templateUrl: 'tooltip-demo.html',
})
export class TooltipDemo {
  examples = Object.keys(EXAMPLE_COMPONENTS).filter(example => example.startsWith('tooltip-'));
}
