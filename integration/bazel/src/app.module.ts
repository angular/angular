import {HelloWorldModule} from './hello-world/hello-world.module';

import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

@NgModule({
  imports: [BrowserModule, HelloWorldModule]
})
export class AppModule {}
