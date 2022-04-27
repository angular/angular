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
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDialogModule} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatSelectModule} from '@angular/material/select';
import {MatTooltipModule} from '@angular/material/tooltip';
import {NgxFlamegraphModule} from 'ngx-flamegraph';

import {FrameSelectorComponent} from './frame-selector.component.js';
import {RecordingDialogComponent} from './recording-dialog.component.js';
import {RecordingModalComponent} from './recording-modal.component.js';
import {RecordingVisualizerModule} from './recording-visualizer/recording-visualizer.module.js';
import {TimelineControlsComponent} from './timeline-controls.component.js';
import {TimelineComponent} from './timeline.component.js';

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
