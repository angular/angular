/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Inject, Injectable, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {ServerModule} from '@angular/platform-server';


@Component({
  selector: 'string-app',
  template: '{{data}}',
})
export class AppComponent {
  data: string;
  constructor(service: Service) {
    this.data = service.data;
  }
}

@NgModule({
  imports: [
    BrowserModule,
    ServerModule,
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  providers: [{provide: 'someStringToken', useValue: 'works'}],
})
export class StringAppModule {
}

@Injectable({providedIn: StringAppModule})
export class Service {
  constructor(@Inject('someStringToken') readonly data: string) {}
}
