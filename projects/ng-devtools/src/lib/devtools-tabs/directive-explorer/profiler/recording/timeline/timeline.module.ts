import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineComponent } from './timeline.component';
import { RecordingVisualizerModule } from '../recording-visualizer/recording-visualizer.module';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [TimelineComponent],
  imports: [CommonModule, FormsModule, RecordingVisualizerModule, MatSliderModule, MatButtonModule],
  exports: [TimelineComponent]
})
export class TimelineModule {}
