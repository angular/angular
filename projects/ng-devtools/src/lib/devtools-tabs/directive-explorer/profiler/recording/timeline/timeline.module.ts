import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineComponent } from './timeline.component';
import { RecordingVisualizerModule } from './recording-visualizer/recording-visualizer.module';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { NgxFlamegraphModule } from 'ngx-flamegraph';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [TimelineComponent],
  imports: [
    CommonModule,
    FormsModule,
    RecordingVisualizerModule,
    MatSliderModule,
    MatButtonModule,
    NgxFlamegraphModule,
    MatSelectModule,
  ],
  exports: [TimelineComponent],
})
export class TimelineModule {}
