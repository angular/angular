import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {HttpClientModule} from '@angular/common/http';
import {CommonModule} from '@angular/common';

import {AppComponent} from './app.component';
import {HelloWorldModule} from './hello-world/hello-world.module';

@NgModule({
  imports: [CommonModule, BrowserModule, HttpClientModule, HelloWorldModule],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
