import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {
  NgModule
} from '@angular/core';

import {App} from './app';

@NgModule({
  imports: [BrowserModule],
  bootstrap: [App]
})
class AppModule {
}

export function main() {
  platformBrowserDynamic().bootstrapModule(AppModule);
}