import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';

import { NgxFlamegraphModule } from 'ngx-flamegraph';

import { FlamegraphVisualizerComponent } from './flamegraph-visualizer/flamegraph-visualizer.component';
import { BargraphVisualizerComponent } from './bargraph-visualizer/bargraph-visualizer.component';
import { TreeMapVisualizerComponent } from './tree-map-visualizer/tree-map-visualizer.component';
import { TimelineVisualizerComponent } from './timeline-visualizer.component';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import { ExecutionDetailsComponent } from './execution-details/execution-details.component';

@NgModule({
  declarations: [
    ExecutionDetailsComponent,
    BarChartComponent,
    TimelineVisualizerComponent,
    FlamegraphVisualizerComponent,
    TreeMapVisualizerComponent,
    BargraphVisualizerComponent,
  ],
  imports: [CommonModule, NgxFlamegraphModule, MatCheckboxModule, MatToolbarModule, MatCardModule],
  exports: [TimelineVisualizerComponent],
})
export class RecordingVisualizerModule {}
