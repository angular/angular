import {BrowserModule} from '@angular/platform-browser';
import {AngularFireModule} from 'angularfire2';
import {AngularFireDatabaseModule} from 'angularfire2/database';
import {NgModule} from '@angular/core';
import {DashboardApp} from './dashboard-app';
import {environment} from '../environments/environment';
import {MatCardModule, MatProgressSpinnerModule, MatToolbarModule} from '@angular/material';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {PayloadChart} from './payload-chart/payload-chart';
import {CoverageChart} from './coverage-chart/coverage-chart';

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
