import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {HelloWorldModule} from './hello-world/hello-world.module';

@NgModule({imports: [BrowserModule, HelloWorldModule]})
export class AppModule {
  ngDoBootstrap() {}
}
