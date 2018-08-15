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
export class NormalService {
  constructor(@Optional() @Self() readonly shakeable: ShakeableService|null) {}
}

@Component({
  selector: 'self-app',
  template: '{{found}}',
})
export class AppComponent {
  found: boolean;
  constructor(service: NormalService) {
    this.found = !!service.shakeable;
  }
}

@NgModule({
  imports: [
    BrowserModule.withServerTransition({appId: 'id-app'}),
    ServerModule,
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  providers: [NormalService],
})
export class SelfAppModule {
}

@Injectable({providedIn: SelfAppModule})
export class ShakeableService {
}
