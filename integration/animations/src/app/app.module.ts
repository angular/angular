import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent, AnimationsComponent} from './app.component';

@NgModule({
  declarations: [
    AppComponent,
    AnimationsComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
