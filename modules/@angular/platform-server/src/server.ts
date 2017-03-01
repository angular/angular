/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PlatformLocation, ɵPLATFORM_SERVER_ID as PLATFORM_SERVER_ID} from '@angular/common';
import {platformCoreDynamic} from '@angular/compiler';
import {Injectable, InjectionToken, Injector, NgModule, PLATFORM_ID, PLATFORM_INITIALIZER, PlatformRef, Provider, RendererFactoryV2, RootRenderer, Testability, createPlatformFactory, isDevMode, platformCore, ɵALLOW_MULTIPLE_PLATFORMS as ALLOW_MULTIPLE_PLATFORMS} from '@angular/core';
import {HttpModule} from '@angular/http';
import {BrowserModule, DOCUMENT, ɵSharedStylesHost as SharedStylesHost, ɵgetDOM as getDOM} from '@angular/platform-browser';

import {SERVER_HTTP_PROVIDERS} from './http';
import {ServerPlatformLocation} from './location';
import {Parse5DomAdapter, parseDocument} from './parse5_adapter';
import {PlatformState} from './platform_state';
import {ServerRendererFactoryV2} from './server_renderer';
import {ServerStylesHost} from './styles_host';
import {INITIAL_CONFIG, PlatformConfig} from './tokens';

function notSupported(feature: string): Error {
  throw new Error(`platform-server does not support '${feature}'.`);
}

export const INTERNAL_SERVER_PLATFORM_PROVIDERS: Array<any /*Type | Provider | any[]*/> = [
  {provide: DOCUMENT, useFactory: _document, deps: [Injector]},
  {provide: PLATFORM_ID, useValue: PLATFORM_SERVER_ID},
  {provide: PLATFORM_INITIALIZER, useFactory: initParse5Adapter, multi: true, deps: [Injector]},
  {provide: PlatformLocation, useClass: ServerPlatformLocation}, PlatformState,
  // Add special provider that allows multiple instances of platformServer* to be created.
  {provide: ALLOW_MULTIPLE_PLATFORMS, useValue: true}
];

function initParse5Adapter(injector: Injector) {
  return () => { Parse5DomAdapter.makeCurrent(); };
}

export const SERVER_RENDER_PROVIDERS: Provider[] = [
  ServerRendererFactoryV2,
  {provide: RendererFactoryV2, useExisting: ServerRendererFactoryV2},
  ServerStylesHost,
  {provide: SharedStylesHost, useExisting: ServerStylesHost},
];

/**
 * The ng module for the server.
 *
 * @experimental
 */
@NgModule({
  exports: [BrowserModule],
  imports: [HttpModule],
  providers: [
    SERVER_RENDER_PROVIDERS,
    SERVER_HTTP_PROVIDERS,
    {provide: Testability, useValue: null},
  ],
})
export class ServerModule {
}

function _document(injector: Injector) {
  let config: PlatformConfig|null = injector.get(INITIAL_CONFIG, null);
  if (config && config.document) {
    return parseDocument(config.document);
  } else {
    return getDOM().createHtmlDocument();
  }
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
