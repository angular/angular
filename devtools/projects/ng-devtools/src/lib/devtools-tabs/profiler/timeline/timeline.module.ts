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
