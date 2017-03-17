// #docplaster
// A mini-application
import { Injectable } from '@angular/core';

@Injectable()
export class Logger {
  log(message: string) { console.log(message); }
}

// #docregion import-core-component
import { Component } from '@angular/core';
// #enddocregion import-core-component

@Component({
 selector: 'my-app',
 template: 'Welcome to Angular'
})
export class AppComponent {
  constructor(logger: Logger) {
    logger.log('Let the fun begin!');
  }
}

// #docregion module
import { NgModule }      from '@angular/core';
// #docregion import-browser-module
import { BrowserModule } from '@angular/platform-browser';
// #enddocregion import-browser-module
@NgModule({
// #docregion ngmodule-imports
  imports:      [ BrowserModule ],
// #enddocregion ngmodule-imports
  providers:    [ Logger ],
  declarations: [ AppComponent ],
  exports:      [ AppComponent ],
  bootstrap:    [ AppComponent ]
})
// #docregion export
export class AppModule { }
// #enddocregion export
// #enddocregion module

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

platformBrowserDynamic().bootstrapModule(AppModule);
