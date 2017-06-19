import {BrowserModule} from '@angular/platform-browser';
import {AngularFireModule} from 'angularfire2';
import {AngularFireDatabaseModule} from 'angularfire2/database';
import {NgModule} from '@angular/core';
import {DashboardApp} from './dashboard-app';
import {environment} from '../environments/environment';
import {MdToolbarModule} from '@angular/material';

@NgModule({
  exports: [
    MdToolbarModule
  ]
})
export class DashboardMaterialModule {}

@NgModule({
  declarations: [
    DashboardApp
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    DashboardMaterialModule
  ],
  providers: [],
  bootstrap: [DashboardApp]
})
export class DashboardModule {}
