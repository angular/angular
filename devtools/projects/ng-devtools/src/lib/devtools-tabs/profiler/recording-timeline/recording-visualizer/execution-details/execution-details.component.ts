/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {SelectedDirective} from '../recording-visualizer-types';

@Component({
  selector: 'ng-execution-details',
  templateUrl: './execution-details.component.html',
  styleUrls: ['./execution-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExecutionDetailsComponent {
  readonly data = input.required<SelectedDirective[]>();
}
