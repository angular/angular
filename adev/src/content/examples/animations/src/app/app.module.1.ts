import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';

@NgModule({
  imports: [BrowserModule],
  providers: [provideAnimationsAsync()],
  bootstrap: [],
})
export class AppModule {}
