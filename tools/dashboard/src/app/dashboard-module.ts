import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {DashboardApp} from './dashboard-app';

@NgModule({
  declarations: [
    DashboardApp
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [DashboardApp]
})
export class DashboardModule {}
