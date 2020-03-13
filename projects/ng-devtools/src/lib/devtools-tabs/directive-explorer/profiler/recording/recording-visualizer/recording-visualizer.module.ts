import { NgModule } from '@angular/core';
import { RecordingVisualizerComponent } from './recording-visualizer.component';
import { CommonModule } from '@angular/common';
import { NgxFlamegraphModule } from 'ngx-flamegraph';
import { FlamegraphVisualizerComponent } from './flamegraph-visualizer/flamegraph-visualizer.component';
import { WebtreegraphVisualizerComponent } from './webtreegraph-visualizer/webtreegraph-visualizer.component';

@NgModule({
  declarations: [RecordingVisualizerComponent, FlamegraphVisualizerComponent, WebtreegraphVisualizerComponent],
  imports: [CommonModule, NgxFlamegraphModule],
  exports: [RecordingVisualizerComponent],
})
export class RecordingVisualizerModule {}
