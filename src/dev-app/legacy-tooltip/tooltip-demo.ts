/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Component} from '@angular/core';
import {LegacyTooltipExamplesModule} from '@angular/components-examples/material/legacy-tooltip';

@Component({
  selector: 'tooltip-demo',
  templateUrl: 'tooltip-demo.html',
  standalone: true,
  imports: [LegacyTooltipExamplesModule],
})
export class TooltipDemo {}
