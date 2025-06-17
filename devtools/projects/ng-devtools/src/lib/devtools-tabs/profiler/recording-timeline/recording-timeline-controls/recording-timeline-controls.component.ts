/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, output} from '@angular/core';
import {ButtonComponent} from '../../../../shared/button/button.component';

@Component({
  selector: 'ng-recording-timeline-controls',
  templateUrl: './recording-timeline-controls.component.html',
  styleUrls: ['./recording-timeline-controls.component.scss'],
  imports: [ButtonComponent],
})
export class RecordingTimelineControlsComponent {
  readonly exportProfile = output<void>();
  readonly filter = output<string>();
}
