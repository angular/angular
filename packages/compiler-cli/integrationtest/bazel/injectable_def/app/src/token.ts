/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, forwardRef, Inject, inject, Injectable, InjectionToken, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {ServerModule} from '@angular/platform-server';

export interface IService {
  readonly dep: {readonly data: string;};
}

@NgModule({})
export class TokenModule {
}

export const TOKEN = new InjectionToken('test', {
  providedIn: TokenModule,
  factory: () => new Service(inject(Dep)),
});


@Component({
  selector: 'token-app',
  template: '{{data}}',
})
export class AppComponent {
  data: string;
  constructor(@Inject(TOKEN) service: IService) {
    this.data = service.dep.data;
  }
}

@NgModule({
  imports: [
    BrowserModule.withServerTransition({appId: 'id-app'}),
    ServerModule,
    TokenModule,
  ],
  providers: [forwardRef(() => Dep)],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
})
export class TokenAppModule {
}

@Injectable()
export class Dep {
  readonly data = 'fromToken';
}

export class Service {
  constructor(readonly dep: Dep) {}
}
