import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineComponent } from './timeline.component';
import { RecordingVisualizerModule } from './recording-visualizer/recording-visualizer.module';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { NgxFlamegraphModule } from 'ngx-flamegraph';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { FrameSelectorComponent } from './frame-selector/frame-selector.component';
import { TimelineControlsComponent } from './timeline-controls/timeline-controls.component';

@NgModule({
  declarations: [TimelineComponent, FrameSelectorComponent, TimelineControlsComponent],
  imports: [
    CommonModule,
    FormsModule,
    RecordingVisualizerModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    NgxFlamegraphModule,
    MatSelectModule,
  ],
  exports: [TimelineComponent],
})
export class TimelineModule {}
