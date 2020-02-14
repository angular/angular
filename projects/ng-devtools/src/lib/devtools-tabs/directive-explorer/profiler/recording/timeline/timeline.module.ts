import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineComponent } from './timeline.component';
import { RecordingVisualizerModule } from '../recording-visualizer/recording-visualizer.module';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { NgxFlamegraphModule } from 'ngx-flamegraph';

@NgModule({
  declarations: [TimelineComponent],
  imports: [
    CommonModule,
    FormsModule,
    RecordingVisualizerModule,
    MatSliderModule,
    MatButtonModule,
    NgxFlamegraphModule,
  ],
  exports: [TimelineComponent],
})
export class TimelineModule {}
