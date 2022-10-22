/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// tslint:disable: no-duplicate-imports
// clang-format off
import {Component} from '@angular/core';
// clang-format on
// #docregion sw-script
import {APP_BASE_HREF} from '@angular/common';
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {ServiceWorkerModule, SW_SCRIPT} from '@angular/service-worker';

// #enddocregion sw-script
// tslint:enable: no-duplicate-imports

@Component({
  selector: 'example-app',
  template: 'SW script: {{ script }}',
})
export class AppComponent {
  get script(): string|undefined {
    return navigator.serviceWorker?.controller?.scriptURL;
  }
}
// #docregion sw-script

@NgModule({
  // #enddocregion sw-script
  bootstrap: [
    AppComponent,
  ],
  declarations: [
    AppComponent,
  ],
  // #docregion sw-script
  imports: [
    BrowserModule,
    ServiceWorkerModule.register(''),
  ],
  providers: [
    // #enddocregion sw-script
    {
      provide: APP_BASE_HREF,
      useValue: '/',
    },
    // #docregion sw-script
    {
      provide: SW_SCRIPT,
      useFactory: (href: string) => (href + 'ngsw-worker.js'),
      deps: [APP_BASE_HREF],
    },
  ],
})
export class AppModule {
}
// #enddocregion sw-script
