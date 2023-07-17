/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Input} from '@angular/core';

import {SelectedDirective} from './timeline-visualizer.component';

@Component({
  selector: 'ng-execution-details',
  templateUrl: './execution-details.component.html',
  styleUrls: ['./execution-details.component.scss'],
})
export class ExecutionDetailsComponent {
  @Input() data: SelectedDirective[];
}
