// #docplaster
// #docregion
import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import
// #enddocregion
       { AppComponent }  from './app.component.0';
/*
// #docregion
       { AppComponent }  from './app.component';
// #enddocregion
*/
// #docregion

@NgModule({
// #docregion imports
  imports: [ BrowserModule ],
// #enddocregion imports
  declarations: [ AppComponent ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
