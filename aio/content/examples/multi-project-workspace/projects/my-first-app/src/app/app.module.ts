import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { MyLibModule } from 'projects/my-lib/src/public-api';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    MyLibModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
