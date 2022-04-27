import {HelloWorldComponent} from './hello-world.component.js';

import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

@NgModule({
  declarations: [HelloWorldComponent],
  bootstrap: [HelloWorldComponent],
  imports: [BrowserModule],
})
export class AppModule {}
