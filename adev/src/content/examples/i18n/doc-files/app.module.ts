// For documenting NgModule Apps only
// #docregion
import {LOCALE_ID, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from '../src/app/app.component';

@NgModule({
  imports: [BrowserModule],
  declarations: [AppComponent],
  providers: [{provide: LOCALE_ID, useValue: 'fr'}],
  bootstrap: [AppComponent],
})
export class AppModule {}
