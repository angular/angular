/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Inject, InjectionToken, NgModule, forwardRef} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {ServerModule} from '@angular/platform-server';

export interface IService { readonly data: string; }

@NgModule({})
export class TokenModule {
}

export const TOKEN = new InjectionToken('test', {
  scope: TokenModule,
  factory: () => new Service(),
});


@Component({
  selector: 'token-app',
  template: '{{data}}',
})
export class AppComponent {
  data: string;
  constructor(@Inject(TOKEN) service: IService) { this.data = service.data; }
}

@NgModule({
  imports: [
    BrowserModule.withServerTransition({appId: 'id-app'}),
    ServerModule,
    TokenModule,
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
})
export class TokenAppModule {
}

export class Service { readonly data = 'fromToken'; }