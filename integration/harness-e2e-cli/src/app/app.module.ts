import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

import {AppComponent} from './app.component';
import {MatLegacyRadioModule} from '@angular/material/legacy-radio';

@NgModule({
  declarations: [AppComponent],
  imports: [MatLegacyRadioModule, NoopAnimationsModule, BrowserModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
