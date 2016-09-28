/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PlatformLocation} from '@angular/common';
import {platformCoreDynamic} from '@angular/compiler';
import {NgModule, PLATFORM_INITIALIZER, PlatformRef, Provider, createPlatformFactory, platformCore} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {Parse5DomAdapter} from './parse5_adapter';

function notSupported(feature: string): Error {
  throw new Error(`platform-server does not support '${feature}'.`);
}

class ServerPlatformLocation extends PlatformLocation {
  getBaseHrefFromDOM(): string { throw notSupported('getBaseHrefFromDOM'); };
  onPopState(fn: any): void { notSupported('onPopState'); };
  onHashChange(fn: any): void { notSupported('onHashChange'); };
  get pathname(): string { throw notSupported('pathname'); }
  get search(): string { throw notSupported('search'); }
  get hash(): string { throw notSupported('hash'); }
  replaceState(state: any, title: string, url: string): void { notSupported('replaceState'); };
  pushState(state: any, title: string, url: string): void { notSupported('pushState'); };
  forward(): void { notSupported('forward'); };
  back(): void { notSupported('back'); };
}

export const INTERNAL_SERVER_PLATFORM_PROVIDERS: Array<any /*Type | Provider | any[]*/> = [
  {provide: PLATFORM_INITIALIZER, useValue: initParse5Adapter, multi: true},
  {provide: PlatformLocation, useClass: ServerPlatformLocation},
];

function initParse5Adapter() {
  Parse5DomAdapter.makeCurrent();
}

/**
 * The ng module for the server.
 *
 * @experimental
 */
@NgModule({imports: [BrowserModule]})
export class ServerModule {
}

/**
 * @experimental
 */
export const platformServer =
    createPlatformFactory(platformCore, 'server', INTERNAL_SERVER_PLATFORM_PROVIDERS);

/**
 * The server platform that supports the runtime compiler.
 *
 * @experimental
 */
export const platformDynamicServer =
    createPlatformFactory(platformCoreDynamic, 'serverDynamic', INTERNAL_SERVER_PLATFORM_PROVIDERS);
