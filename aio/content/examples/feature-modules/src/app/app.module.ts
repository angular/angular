// #docplaster
// #docregion app-module, app-module-import
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
// #enddocregion app-module-import

import { AppComponent } from './app.component';
// import the feature module here so you can add it to the imports array below
import { CustomerDashboardModule } from './customer-dashboard/customer-dashboard.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  // #docregion app-module-skeleton
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    // #enddocregion app-module-skeleton
    CustomerDashboardModule // add the feature module here
    // #docregion app-module-skeleton
  ],
  // #enddocregion app-module-skeleton
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
// #enddocregion app-module
