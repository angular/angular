/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Injectable, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {ServerModule} from '@angular/platform-server';

@Injectable()
export class NormalService {
}

@Component({
  selector: 'dep-app',
  template: '{{found}}',
})
export class AppComponent {
  found: boolean;
  constructor(service: ShakeableService) {
    this.found = !!service.normal;
  }
}

@NgModule({
  imports: [
    BrowserModule,
    ServerModule,
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  providers: [NormalService],
})
export class DepAppModule {
}

@Injectable({providedIn: DepAppModule})
export class ShakeableService {
  constructor(readonly normal: NormalService) {}
}
