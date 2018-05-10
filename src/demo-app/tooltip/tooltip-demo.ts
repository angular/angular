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
  selector: 'tooltip-demo',
  templateUrl: 'tooltip-demo.html',
})
export class TooltipDemo {
  examples = [
    'tooltip-overview',
    'tooltip-position',
    'tooltip-disabled',
    'tooltip-message',
    'tooltip-delay',
    'tooltip-manual',
    'tooltip-modified-defaults',
    'tooltip-auto-hide',
    'tooltip-custom-class',
  ];
}
