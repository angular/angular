import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';

import { NgxFlamegraphModule } from 'ngx-flamegraph';

import { FlamegraphVisualizerComponent } from './flamegraph-visualizer.component';
import { BargraphVisualizerComponent } from './bargraph-visualizer.component';
import { TreeMapVisualizerComponent } from './tree-map-visualizer.component';
import { TimelineVisualizerComponent } from './timeline-visualizer.component';
import { BarChartComponent } from './bar-chart.component';
import { ExecutionDetailsComponent } from './execution-details.component';
import { AngularSplitModule } from '../../../../vendor/angular-split/public_api';
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
