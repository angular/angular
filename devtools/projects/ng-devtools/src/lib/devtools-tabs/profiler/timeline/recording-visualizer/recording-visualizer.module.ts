import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {NgxFlamegraphModule} from 'ngx-flamegraph';

import {AngularSplitModule} from '../../../../vendor/angular-split/public_api';

import {BarChartComponent} from './bar-chart.component';
import {BargraphVisualizerComponent} from './bargraph-visualizer.component';
import {ExecutionDetailsComponent} from './execution-details.component';
import {FlamegraphVisualizerComponent} from './flamegraph-visualizer.component';
import {TimelineVisualizerComponent} from './timeline-visualizer.component';
import {TreeMapVisualizerComponent} from './tree-map-visualizer.component';

@NgModule({
  declarations: [
    ExecutionDetailsComponent,
    BarChartComponent,
    TimelineVisualizerComponent,
    FlamegraphVisualizerComponent,
    TreeMapVisualizerComponent,
    BargraphVisualizerComponent,
  ],
  imports: [
    CommonModule, NgxFlamegraphModule, MatTooltipModule, MatToolbarModule, MatCardModule,
    AngularSplitModule
  ],
  exports: [TimelineVisualizerComponent],
})
export class RecordingVisualizerModule {
}
