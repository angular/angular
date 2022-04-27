import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module.js';
import {AppComponent} from './app.component.js';
import {HelloWorldModule} from './hello-world/hello-world.module.js';

@NgModule({
  imports: [
    AppRoutingModule,
    CommonModule,
    BrowserModule,
    HttpClientModule,
    HelloWorldModule,
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
})
export class AppModule {
}
