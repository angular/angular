import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgxEchartsModule } from 'ngx-echarts';

import { AppComponent } from './app.component';
import { SystemComponent } from './system/system.component';
import { GoogleChartsModule } from 'angular-google-charts';
import { GaugeChartComponent } from './gauge-chart/gauge-chart.component';
import { GraphChartComponent } from './graph-chart/graph-chart.component';
@NgModule({
  declarations: [
    AppComponent,
    SystemComponent,
    GaugeChartComponent,
    GraphChartComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    GoogleChartsModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
