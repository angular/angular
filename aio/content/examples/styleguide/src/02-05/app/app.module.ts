// #docplaster
// #docregion
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';

@NgModule({
  imports: [
    BrowserModule,
    // #enddocregion
    RouterModule.forChild([{ path: '02-05', component: AppComponent }])
    // #docregion
  ],
  declarations: [
    AppComponent
  ],
  exports: [ AppComponent ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
// #enddocregion
