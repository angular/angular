import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';

import { NgxFlamegraphModule } from 'ngx-flamegraph';

import { FlamegraphVisualizerComponent } from './flamegraph-visualizer/flamegraph-visualizer.component';
import { BargraphVisualizerComponent } from './bargraph-visualizer/bargraph-visualizer.component';
import { TreeMapVisualizerComponent } from './tree-map-visualizer/tree-map-visualizer.component';
import { TimelineVisualizerComponent } from './timeline-visualizer.component';
import { BarChartComponent } from './bargraph-visualizer/bar-chart/bar-chart.component';
import { ExecutionDetailsComponent } from './execution-details/execution-details.component';
import { AngularSplitModule } from 'projects/ng-devtools/src/lib/vendor/angular-split/lib/module';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [
    ExecutionDetailsComponent,
    BarChartComponent,
    TimelineVisualizerComponent,
    FlamegraphVisualizerComponent,
    TreeMapVisualizerComponent,
    BargraphVisualizerComponent,
  ],
  imports: [CommonModule, NgxFlamegraphModule, MatTooltipModule, MatToolbarModule, MatCardModule, AngularSplitModule],
  exports: [TimelineVisualizerComponent],
})
export class RecordingVisualizerModule {}
