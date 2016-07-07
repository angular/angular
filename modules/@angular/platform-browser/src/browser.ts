/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {COMMON_DIRECTIVES, COMMON_PIPES, PlatformLocation} from '@angular/common';
import {APPLICATION_COMMON_PROVIDERS, AppModule, AppModuleFactory, AppModuleRef, ExceptionHandler, NgZone, OpaqueToken, PLATFORM_COMMON_PROVIDERS, PLATFORM_INITIALIZER, PlatformRef, ReflectiveInjector, RootRenderer, SanitizationService, Testability, assertPlatform, createPlatform, getPlatform, isDevMode} from '@angular/core';

import {wtfInit} from '../core_private';
import {AnimationDriver} from '../src/dom/animation_driver';
import {WebAnimationsDriver} from '../src/dom/web_animations_driver';

import {BrowserDomAdapter} from './browser/browser_adapter';
import {BrowserPlatformLocation} from './browser/location/browser_platform_location';
import {BrowserGetTestability} from './browser/testability';
import {ELEMENT_PROBE_PROVIDERS} from './dom/debug/ng_probe';
import {getDOM} from './dom/dom_adapter';
import {DomRootRenderer, DomRootRenderer_} from './dom/dom_renderer';
import {DOCUMENT} from './dom/dom_tokens';
import {DomEventsPlugin} from './dom/events/dom_events';
import {EVENT_MANAGER_PLUGINS, EventManager} from './dom/events/event_manager';
import {HAMMER_GESTURE_CONFIG, HammerGestureConfig, HammerGesturesPlugin} from './dom/events/hammer_gestures';
import {KeyEventsPlugin} from './dom/events/key_events';
import {DomSharedStylesHost, SharedStylesHost} from './dom/shared_styles_host';
import {isBlank} from './facade/lang';
import {DomSanitizationService, DomSanitizationServiceImpl} from './security/dom_sanitization_service';

const BROWSER_PLATFORM_MARKER = new OpaqueToken('BrowserPlatformMarker');

/**
 * A set of providers to initialize the Angular platform in a web browser.
 *
 * Used automatically by `bootstrap`, or can be passed to {@link platform}.
 *
 * @experimental API related to bootstrapping are still under review.
 */
export const BROWSER_PLATFORM_PROVIDERS: Array<any /*Type | Provider | any[]*/> = [
  {provide: BROWSER_PLATFORM_MARKER, useValue: true}, PLATFORM_COMMON_PROVIDERS,
  {provide: PLATFORM_INITIALIZER, useValue: initDomAdapter, multi: true},
  {provide: PlatformLocation, useClass: BrowserPlatformLocation}
];

/**
 * @security Replacing built-in sanitization providers exposes the application to XSS risks.
 * Attacker-controlled data introduced by an unsanitized provider could expose your
 * application to XSS risks. For more detail, see the [Security Guide](http://g.co/ng/security).
 * @experimental
 */
export const BROWSER_SANITIZATION_PROVIDERS: Array<any> = [
  {provide: SanitizationService, useExisting: DomSanitizationService},
  {provide: DomSanitizationService, useClass: DomSanitizationServiceImpl},
];

/**
 * A set of providers to initialize an Angular application in a web browser.
 *
 * Used automatically by `bootstrap`, or can be passed to {@link PlatformRef.application}.
 *
 * @experimental API related to bootstrapping are still under review.
 */
export const BROWSER_APP_PROVIDERS: Array<any /*Type | Provider | any[]*/> = [
  APPLICATION_COMMON_PROVIDERS, BROWSER_SANITIZATION_PROVIDERS,
  {provide: ExceptionHandler, useFactory: _exceptionHandler, deps: []},
  {provide: DOCUMENT, useFactory: _document, deps: []},
  {provide: EVENT_MANAGER_PLUGINS, useClass: DomEventsPlugin, multi: true},
  {provide: EVENT_MANAGER_PLUGINS, useClass: KeyEventsPlugin, multi: true},
  {provide: EVENT_MANAGER_PLUGINS, useClass: HammerGesturesPlugin, multi: true},
  {provide: HAMMER_GESTURE_CONFIG, useClass: HammerGestureConfig},
  {provide: DomRootRenderer, useClass: DomRootRenderer_},
  {provide: RootRenderer, useExisting: DomRootRenderer},
  {provide: SharedStylesHost, useExisting: DomSharedStylesHost},
  {provide: AnimationDriver, useFactory: _resolveDefaultAnimationDriver}, DomSharedStylesHost,
  Testability, EventManager, ELEMENT_PROBE_PROVIDERS
];

/**
 * @experimental API related to bootstrapping are still under review.
 */
export function browserPlatform(): PlatformRef {
  if (isBlank(getPlatform())) {
    createPlatform(ReflectiveInjector.resolveAndCreate(BROWSER_PLATFORM_PROVIDERS));
  }
  return assertPlatform(BROWSER_PLATFORM_MARKER);
}

export function initDomAdapter() {
  BrowserDomAdapter.makeCurrent();
  wtfInit();
  BrowserGetTestability.init();
}

export function _exceptionHandler(): ExceptionHandler {
  return new ExceptionHandler(getDOM());
}

export function _document(): any {
  return getDOM().defaultDoc();
}

export function _resolveDefaultAnimationDriver(): AnimationDriver {
  if (getDOM().supportsWebAnimation()) {
    return new WebAnimationsDriver();
  }
  return AnimationDriver.NOOP;
}

/**
 * The app module for the browser.
 * @stable
 */
@AppModule({
  providers: [
    BROWSER_APP_PROVIDERS,
  ],
  directives: COMMON_DIRECTIVES,
  pipes: COMMON_PIPES
})
export class BrowserModule {
}

/**
 * Creates an instance of an `@AppModule` for the browser platform
 * for offline compilation.
 *
 * ## Simple Example
 *
 * ```typescript
 * my_module.ts:
 *
 * @AppModule({
 *   modules: [BrowserModule]
 * })
 * class MyModule {}
 *
 * main.ts:
 * import {MyModuleNgFactory} from './my_module.ngfactory';
 * import {bootstrapModuleFactory} from '@angular/platform-browser';
 *
 * let moduleRef = bootstrapModuleFactory(MyModuleNgFactory);
 * ```
 * @stable
 */
export function bootstrapModuleFactory<M>(moduleFactory: AppModuleFactory<M>): AppModuleRef<M> {
  let platformInjector = browserPlatform().injector;
  // Note: We need to create the NgZone _before_ we instantiate the module,
  // as instantiating the module creates some providers eagerly.
  // So we create a mini parent injector that just contains the new NgZone and
  // pass that as parent to the AppModuleFactory.
  let ngZone = new NgZone({enableLongStackTrace: isDevMode()});
  let ngZoneInjector =
      ReflectiveInjector.resolveAndCreate([{provide: NgZone, useValue: ngZone}], platformInjector);
  return ngZone.run(() => { return moduleFactory.create(ngZoneInjector); });
}
