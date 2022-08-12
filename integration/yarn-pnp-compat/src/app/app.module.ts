import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {MatLegacyButtonModule} from '@angular/material/legacy-button';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, BrowserAnimationsModule, MatLegacyButtonModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
