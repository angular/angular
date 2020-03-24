import { NgModule } from '@angular/core';
import { TimelineVisualizerComponent } from './timeline-visualizer.component';
import { CommonModule } from '@angular/common';
import { NgxFlamegraphModule } from 'ngx-flamegraph';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FlamegraphVisualizerComponent } from './flamegraph-visualizer/flamegraph-visualizer.component';
import { WebtreegraphVisualizerComponent } from './webtreegraph-visualizer/webtreegraph-visualizer.component';
import { BargraphVisualizerComponent } from './bargraph-visualizer/bargraph-visualizer.component';

@NgModule({
  declarations: [
    TimelineVisualizerComponent,
    FlamegraphVisualizerComponent,
    WebtreegraphVisualizerComponent,
    BargraphVisualizerComponent,
  ],
  imports: [CommonModule, NgxFlamegraphModule, NgxChartsModule],
  exports: [TimelineVisualizerComponent],
})
export class RecordingVisualizerModule {}
