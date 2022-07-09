import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

import {AppComponent} from './app.component';
import {MatRadioModule} from '@angular/material/radio';

@NgModule({
  declarations: [AppComponent],
  imports: [MatRadioModule, NoopAnimationsModule, BrowserModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
