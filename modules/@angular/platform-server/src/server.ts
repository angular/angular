import {PlatformLocation} from '@angular/common';
import {ComponentRef, OpaqueToken, PLATFORM_COMMON_PROVIDERS, PLATFORM_INITIALIZER, PlatformRef, ReflectiveInjector, Type, assertPlatform, coreLoadAndBootstrap, createPlatform, getPlatform} from '@angular/core';
import {BROWSER_APP_PROVIDERS, BrowserPlatformLocation} from '@angular/platform-browser';
import {BROWSER_APP_COMPILER_PROVIDERS} from '@angular/platform-browser-dynamic';

import {ReflectionCapabilities, reflector, wtfInit} from '../core_private';

import {Parse5DomAdapter} from './parse5_adapter';

const SERVER_PLATFORM_MARKER = new OpaqueToken('ServerPlatformMarker');

/**
 * A set of providers to initialize the Angular platform in a server.
 *
 * Used automatically by `serverBootstrap`, or can be passed to {@link platform}.
 */
export const SERVER_PLATFORM_PROVIDERS: Array<any /*Type | Provider | any[]*/> = [
  {provide: SERVER_PLATFORM_MARKER, useValue: true}, PLATFORM_COMMON_PROVIDERS,
  {provide: PLATFORM_INITIALIZER, useValue: initParse5Adapter, multi: true},
  {provide: PlatformLocation, useClass: BrowserPlatformLocation}
];

export const SERVER_APPLICATION_PROVIDERS: Array<any> =
    [BROWSER_APP_PROVIDERS, BROWSER_APP_COMPILER_PROVIDERS];

function initParse5Adapter() {
  Parse5DomAdapter.makeCurrent();
  wtfInit();
}


export function serverPlatform(): PlatformRef {
  if (!getPlatform()) {
    createPlatform(ReflectiveInjector.resolveAndCreate(SERVER_PLATFORM_PROVIDERS));
  }
  return assertPlatform(SERVER_PLATFORM_MARKER);
}


export function serverBootstrap(
    appComponentType: Type,
    customProviders?: Array<any /*Type | Provider | any[]*/>): Promise<ComponentRef<any>> {
  reflector.reflectionCapabilities = new ReflectionCapabilities();
  let providers = [SERVER_APPLICATION_PROVIDERS, customProviders || []];
  var appInjector = ReflectiveInjector.resolveAndCreate(providers, serverPlatform().injector);
  return coreLoadAndBootstrap(appComponentType, appInjector);
}
