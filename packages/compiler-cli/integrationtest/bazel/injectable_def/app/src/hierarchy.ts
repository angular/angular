/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Injectable, NgModule, Optional, Self} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {ServerModule} from '@angular/platform-server';

@Injectable()
export class Service {
}

@Component({
  selector: 'hierarchy-app',
  template: '<child-cmp></child-cmp>',
  providers: [Service],
})
export class AppComponent {
}

@Component({
  selector: 'child-cmp',
  template: '{{found}}',
})
export class ChildComponent {
  found: boolean;

  constructor(@Optional() @Self() service: Service|null) {
    this.found = !!service;
  }
}

@NgModule({
  imports: [
    BrowserModule,
    ServerModule,
  ],
  declarations: [AppComponent, ChildComponent],
  bootstrap: [AppComponent],
})
export class HierarchyAppModule {
}
