import {NgModule} from '@angular/core';
import {MatCardModule, MatProgressSpinnerModule, MatToolbarModule} from '@angular/material';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {AngularFireModule} from 'angularfire2';
import {AngularFireDatabaseModule} from 'angularfire2/database';
import {environment} from '../environments/environment';
import {CoverageChart} from './coverage-chart/coverage-chart';
import {DashboardApp} from './dashboard-app';
import {PayloadChart} from './payload-chart/payload-chart';

@NgModule({
  exports: [
    MatCardModule,
    MatToolbarModule,
    MatProgressSpinnerModule
  ]
})
export class DashboardMaterialModule {}

@NgModule({
  declarations: [
    DashboardApp,
    PayloadChart,
    CoverageChart
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    DashboardMaterialModule,
    NgxChartsModule
  ],
  providers: [],
  bootstrap: [DashboardApp]
})
export class DashboardModule {}
