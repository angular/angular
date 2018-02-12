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
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  providers: [{provide: forwardRef(() => TOKEN), useClass: forwardRef(() => Service)}]
})
export class TokenAppModule {
}

export class Service { readonly data = 'fromToken'; }

export const TOKEN = new InjectionToken('test', {
  scope: TokenAppModule,
  useClass: Service,
  deps: [],
});
