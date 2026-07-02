import {NgModule, provideZoneChangeDetection} from '@angular/core';
import {
  BrowserModule,
  provideClientHydration,
  withIncrementalHydration,
} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule],
  providers: [provideZoneChangeDetection(), provideClientHydration(withIncrementalHydration())],
  bootstrap: [AppComponent],
})
export class AppModule {}
