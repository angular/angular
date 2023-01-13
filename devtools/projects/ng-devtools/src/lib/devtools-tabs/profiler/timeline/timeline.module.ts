/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ScrollingModule} from '@angular/cdk/scrolling';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatLegacyCardModule as MatCardModule} from '@angular/material/legacy-card';
import {MatLegacyCheckboxModule as MatCheckboxModule} from '@angular/material/legacy-checkbox';
import {MatLegacyDialogModule as MatDialogModule} from '@angular/material/legacy-dialog';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatLegacyProgressBarModule as MatProgressBarModule} from '@angular/material/legacy-progress-bar';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';
import {MatLegacyTooltipModule as MatTooltipModule} from '@angular/material/legacy-tooltip';
import {NgxFlamegraphModule} from 'ngx-flamegraph';

import {FrameSelectorComponent} from './frame-selector.component';
import {RecordingDialogComponent} from './recording-dialog.component';
import {RecordingModalComponent} from './recording-modal.component';
import {RecordingVisualizerModule} from './recording-visualizer/recording-visualizer.module';
import {TimelineControlsComponent} from './timeline-controls.component';
import {TimelineComponent} from './timeline.component';

@NgModule({
  declarations: [
    TimelineComponent,
    TimelineControlsComponent,
    RecordingModalComponent,
    RecordingDialogComponent,
    FrameSelectorComponent,
  ],
  imports: [
    ScrollingModule,
    CommonModule,
    FormsModule,
    RecordingVisualizerModule,
    MatCheckboxModule,
    MatDialogModule,
    MatProgressBarModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatCardModule,
    MatInputModule,
    NgxFlamegraphModule,
    MatSelectModule,
  ],
  exports: [
    TimelineComponent,
    TimelineControlsComponent,
    RecordingModalComponent,
    RecordingDialogComponent,
    FrameSelectorComponent,
  ],
})
export class TimelineModule {
}
