/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Component} from '@angular/core';
import {LegacyTooltipExamplesModule} from './examples';

@Component({
  selector: 'legacy-tooltip-demo',
  templateUrl: 'legacy-tooltip-demo.html',
  standalone: true,
  imports: [LegacyTooltipExamplesModule],
})
export class LegacyTooltipDemo {}
