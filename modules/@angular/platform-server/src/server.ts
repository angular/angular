/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PlatformLocation} from '@angular/common';
import {platformCoreDynamic} from '@angular/compiler';
import {APP_BOOTSTRAP_LISTENER, Injectable, InjectionToken, Injector, NgModule, PLATFORM_INITIALIZER, PlatformRef, Provider, RendererFactoryV2, RootRenderer, createPlatformFactory, isDevMode, platformCore} from '@angular/core';
import {HttpModule} from '@angular/http';
import {BrowserModule, DOCUMENT} from '@angular/platform-browser';

import {SERVER_HTTP_PROVIDERS} from './http';
import {ServerPlatformLocation} from './location';
import {Parse5DomAdapter, parseDocument} from './parse5_adapter';
import {PlatformState} from './platform_state';
import {ALLOW_MULTIPLE_PLATFORMS, DebugDomRootRenderer} from './private_import_core';
import {SharedStylesHost, getDOM} from './private_import_platform-browser';
import {ServerRendererFactoryV2, ServerRootRenderer} from './server_renderer';
import {ServerStylesHost} from './styles_host';
import {INITIAL_CONFIG, PlatformConfig} from './tokens';

function notSupported(feature: string): Error {
  throw new Error(`platform-server does not support '${feature}'.`);
}

export const INTERNAL_SERVER_PLATFORM_PROVIDERS: Array<any /*Type | Provider | any[]*/> = [
  {provide: DOCUMENT, useFactory: _document, deps: [Injector]},
  {provide: PLATFORM_INITIALIZER, useFactory: initParse5Adapter, multi: true, deps: [Injector]},
  {provide: PlatformLocation, useClass: ServerPlatformLocation}, PlatformState,
  // Add special provider that allows multiple instances of platformServer* to be created.
  {provide: ALLOW_MULTIPLE_PLATFORMS, useValue: true}
];

function initParse5Adapter(injector: Injector) {
  return () => { Parse5DomAdapter.makeCurrent(); };
}

export function _createConditionalRootRenderer(rootRenderer: any) {
  return isDevMode() ? new DebugDomRootRenderer(rootRenderer) : rootRenderer;
}

export function _addStylesToRootComponentFactory(stylesHost: ServerStylesHost) {
  const initializer = () => stylesHost.rootComponentIsReady();
  return initializer;
}

export const SERVER_RENDER_PROVIDERS: Provider[] = [
  ServerRootRenderer,
  {provide: RootRenderer, useFactory: _createConditionalRootRenderer, deps: [ServerRootRenderer]},
  ServerRendererFactoryV2,
  {provide: RendererFactoryV2, useExisting: ServerRendererFactoryV2},
  ServerStylesHost,
  {provide: SharedStylesHost, useExisting: ServerStylesHost},
  {
    provide: APP_BOOTSTRAP_LISTENER,
    useFactory: _addStylesToRootComponentFactory,
    deps: [ServerStylesHost],
    multi: true
  },
];

/**
 * The ng module for the server.
 *
 * @experimental
 */
@NgModule({
  exports: [BrowserModule],
  imports: [HttpModule],
  providers: [SERVER_RENDER_PROVIDERS, SERVER_HTTP_PROVIDERS],
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
