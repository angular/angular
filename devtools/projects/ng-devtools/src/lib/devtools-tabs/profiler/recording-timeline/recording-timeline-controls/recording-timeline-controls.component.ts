/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, output, signal} from '@angular/core';
import {ButtonComponent} from '../../../../shared/button/button.component';

const FILTER_PLACEHOLDER = 'Filter';

@Component({
  selector: 'ng-recording-timeline-controls',
  templateUrl: './recording-timeline-controls.component.html',
  styleUrls: ['./recording-timeline-controls.component.scss'],
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordingTimelineControlsComponent {
  protected readonly exportProfile = output<void>();
  protected readonly filter = output<string>();
  protected readonly filterPlaceholder = signal(FILTER_PLACEHOLDER);
  FILTER_PLACEHOLDER = FILTER_PLACEHOLDER;
}
