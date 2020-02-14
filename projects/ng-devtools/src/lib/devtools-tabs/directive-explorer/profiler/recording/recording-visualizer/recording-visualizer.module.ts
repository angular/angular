import { NgModule } from '@angular/core';
import { RecordingVisualizerComponent } from './recording-visualizer.component';
import { CommonModule } from '@angular/common';
import { NgxFlamegraphModule } from 'ngx-flamegraph';

@NgModule({
  declarations: [RecordingVisualizerComponent],
  imports: [CommonModule, NgxFlamegraphModule],
  exports: [RecordingVisualizerComponent],
})
export class RecordingVisualizerModule {}
