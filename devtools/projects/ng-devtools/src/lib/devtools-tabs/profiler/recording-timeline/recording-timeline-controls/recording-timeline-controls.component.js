/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {ChangeDetectionStrategy, Component, output, signal} from '@angular/core';
import {ButtonComponent} from '../../../../shared/button/button.component';
const FILTER_PLACEHOLDER = 'Filter';
let RecordingTimelineControlsComponent = class RecordingTimelineControlsComponent {
  constructor() {
    this.exportProfile = output();
    this.filter = output();
    this.filterPlaceholder = signal(FILTER_PLACEHOLDER);
    this.FILTER_PLACEHOLDER = FILTER_PLACEHOLDER;
  }
};
RecordingTimelineControlsComponent = __decorate(
  [
    Component({
      selector: 'ng-recording-timeline-controls',
      templateUrl: './recording-timeline-controls.component.html',
      styleUrls: ['./recording-timeline-controls.component.scss'],
      imports: [ButtonComponent],
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ],
  RecordingTimelineControlsComponent,
);
export {RecordingTimelineControlsComponent};
//# sourceMappingURL=recording-timeline-controls.component.js.map
