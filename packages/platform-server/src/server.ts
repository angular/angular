/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  DOCUMENT,
  PlatformLocation,
  ViewportScroller,
  ɵgetDOM as getDOM,
  ɵNullViewportScroller as NullViewportScroller,
  ɵPLATFORM_SERVER_ID as PLATFORM_SERVER_ID,
} from '@angular/common';
import {
  ApplicationConfig,
  ApplicationRef,
  createPlatformFactory,
  Injector,
  NgModule,
  Optional,
  PLATFORM_ID,
  PLATFORM_INITIALIZER,
  platformCore,
  PlatformRef,
  Provider,
  StaticProvider,
  Testability,
  ɵALLOW_MULTIPLE_PLATFORMS as ALLOW_MULTIPLE_PLATFORMS,
  Type,
  ɵsetDocument,
  ɵTESTABILITY as TESTABILITY,
} from '@angular/core';
import {
  BrowserModule,
  EVENT_MANAGER_PLUGINS,
  ɵBrowserDomAdapter as BrowserDomAdapter,
  ɵbootstrapApplicationInternal as bootstrapApplicationInternal,
} from '@angular/platform-browser';

import {DominoAdapter, parseDocument} from './domino_adapter';
import {SERVER_HTTP_PROVIDERS} from './http';
import {ServerPlatformLocation} from './location';
import {enableDomEmulation, PlatformState} from './platform_state';
import {ServerEventManagerPlugin} from './server_events';
import {INITIAL_CONFIG, PlatformConfig} from './tokens';
import {TRANSFER_STATE_SERIALIZATION_PROVIDERS} from './transfer_state';

export const INTERNAL_SERVER_PLATFORM_PROVIDERS: StaticProvider[] = [
  {provide: DOCUMENT, useFactory: _document, deps: [Injector]},
  {provide: PLATFORM_ID, useValue: PLATFORM_SERVER_ID},
  {provide: PLATFORM_INITIALIZER, useFactory: initDominoAdapter, multi: true, deps: [Injector]},
  {
    provide: PlatformLocation,
    useClass: ServerPlatformLocation,
    deps: [DOCUMENT, [Optional, INITIAL_CONFIG]],
  },
  {provide: PlatformState, deps: [DOCUMENT]},
  // Add special provider that allows multiple instances of platformServer* to be created.
  {provide: ALLOW_MULTIPLE_PLATFORMS, useValue: true},
];

function initDominoAdapter(injector: Injector) {
  const _enableDomEmulation = enableDomEmulation(injector);
  return () => {
    if (_enableDomEmulation) {
      DominoAdapter.makeCurrent();
    } else {
      BrowserDomAdapter.makeCurrent();
    }
  };
}

export const SERVER_RENDER_PROVIDERS: Provider[] = [
  {provide: EVENT_MANAGER_PLUGINS, multi: true, useClass: ServerEventManagerPlugin},
];

export const PLATFORM_SERVER_PROVIDERS: Provider[] = [
  TRANSFER_STATE_SERIALIZATION_PROVIDERS,
  SERVER_RENDER_PROVIDERS,
  SERVER_HTTP_PROVIDERS,
  {provide: Testability, useValue: null}, // Keep for backwards-compatibility.
  {provide: TESTABILITY, useValue: null},
  {provide: ViewportScroller, useClass: NullViewportScroller},
];

/**
 * The ng module for the server.
 *
 * @publicApi
 */
@NgModule({
  exports: [BrowserModule],
  providers: PLATFORM_SERVER_PROVIDERS,
})
export class ServerModule {}

function _document(injector: Injector) {
  const config: PlatformConfig | null = injector.get(INITIAL_CONFIG, null);
  const _enableDomEmulation = enableDomEmulation(injector);
  let document: Document;
  if (config && config.document) {
    document =
      typeof config.document === 'string'
        ? _enableDomEmulation
          ? parseDocument(config.document, config.url)
          : window.document
        : config.document;
  } else {
    document = getDOM().createHtmlDocument();
  }
  // Tell ivy about the global document
  ɵsetDocument(document);
  return document;
}

/**
 * @publicApi
 */
export function platformServer(extraProviders?: StaticProvider[] | undefined): PlatformRef {
  const noServerModeSet = typeof ngServerMode === 'undefined';
  if (noServerModeSet) {
    globalThis['ngServerMode'] = true;
  }

  const platform = createPlatformFactory(
    platformCore,
    'server',
    INTERNAL_SERVER_PLATFORM_PROVIDERS,
  )(extraProviders);

  if (noServerModeSet) {
    platform.onDestroy(() => {
      globalThis['ngServerMode'] = undefined;
    });
  }

  return platform;
}

/**
 * Bootstraps an instance of an Angular application for the server platform.
 *
 * @usageNotes
 * The root component passed into this function *must* be a standalone.
 *
 * ```ts
 * @Component({
 *   template: 'Hello world!'
 * })
 * class RootComponent {}
 *
 * const bootstrap = bootstrapServerApplication(RootComponent, {
 *   providers: [
 *     {provide: BACKEND_URL, useValue: 'https://yourdomain.com/api'}
 *   ]
 * });
 * ```
 *
 * @param rootComponent A reference to a standalone component that should be rendered.
 * @param options Extra configuration for the bootstrap operation, see `ApplicationConfig` for
 *     additional info.
 * @returns A function that initiates the bootstrap process once called.
 *
 * @publicApi
 */
export function bootstrapServerApplication(
  rootComponent: Type<unknown>,
  options: ApplicationConfig,
): (platformInjector: Injector) => Promise<ApplicationRef> {
  return (platformInjector: Injector) =>
    bootstrapApplicationInternal(rootComponent, options, platformInjector);
}
