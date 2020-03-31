import { NgModule } from '@angular/core';
import { TimelineVisualizerComponent } from './timeline-visualizer.component';
import { CommonModule } from '@angular/common';
import { NgxFlamegraphModule } from 'ngx-flamegraph';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FlamegraphVisualizerComponent } from './flamegraph-visualizer/flamegraph-visualizer.component';
import { BargraphVisualizerComponent } from './bargraph-visualizer/bargraph-visualizer.component';
import { TreeMapVisualizerComponent } from './tree-map-visualizer/tree-map-visualizer.component';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
  declarations: [
    TimelineVisualizerComponent,
    FlamegraphVisualizerComponent,
    TreeMapVisualizerComponent,
    BargraphVisualizerComponent,
  ],
  imports: [CommonModule, NgxFlamegraphModule, NgxChartsModule, MatCheckboxModule],
  exports: [TimelineVisualizerComponent],
})
export class RecordingVisualizerModule {}
