import {
  PLATFORM_INITIALIZER,
  PLATFORM_DIRECTIVES,
  PLATFORM_PIPES,
  ExceptionHandler,
  RootRenderer,
  APPLICATION_COMMON_PROVIDERS,
  PLATFORM_COMMON_PROVIDERS,
  OpaqueToken,
  Testability,
  PlatformRef,
  getPlatform,
  createPlatform,
  assertPlatform,
  ReflectiveInjector
} from "@angular/core";
import {isBlank} from "../../facade/lang";
import {wtfInit, SanitizationService} from "../../../core_private";
import {COMMON_DIRECTIVES, COMMON_PIPES, FORM_PROVIDERS, PlatformLocation} from "@angular/common";
import {DomSanitizationService, DomSanitizationServiceImpl} from "../../security/dom_sanitization_service";
import {BrowserDomAdapter} from "../../browser/browser_adapter";
import {BrowserGetTestability} from "../../browser/testability";
import {getDOM} from "../../dom/dom_adapter";
import {DOCUMENT} from "../../dom/dom_tokens";
import {EVENT_MANAGER_PLUGINS, EventManager} from "../../dom/events/event_manager";
import {DomRootRenderer, DomRootRenderer_} from "../../dom/dom_renderer";
import {SharedStylesHost, DomSharedStylesHost} from "../../dom/shared_styles_host";
import {KeyEventsPlugin} from "../../dom/events/key_events";
import {ELEMENT_PROBE_PROVIDERS} from "../../dom/debug/ng_probe";
import {DomEventsPlugin} from "../../dom/events/dom_events";
import {HAMMER_GESTURE_CONFIG, HammerGestureConfig, HammerGesturesPlugin} from "../../dom/events/hammer_gestures";
import {AnimationBuilder} from "../../animate/animation_builder";
import {BrowserDetails} from "../../animate/browser_details";
import {BrowserPlatformLocation} from "../../browser/location/browser_platform_location";

const BROWSER_PLATFORM_MARKER =
    /*@ts2dart_const*/ new OpaqueToken('BrowserPlatformMarker');

/**
 * A set of providers to initialize the Angular platform in a web browser.
 *
 * Used automatically by `bootstrap`, or can be passed to {@link platform}.
 */
export const BROWSER_PLATFORM_PROVIDERS: Array<any /*Type | Provider | any[]*/> = /*@ts2dart_const*/[
  /*@ts2dart_Provider*/ {provide: BROWSER_PLATFORM_MARKER, useValue: true},
  PLATFORM_COMMON_PROVIDERS,
  /*@ts2dart_Provider*/ {provide: PLATFORM_INITIALIZER, useValue: initDomAdapter, multi: true},
  /*@ts2dart_Provider*/ {provide: PlatformLocation, useClass: BrowserPlatformLocation}
];

export const BROWSER_SANITIZATION_PROVIDERS: Array<any> = /*@ts2dart_const*/[
  /* @ts2dart_Provider */ {provide: SanitizationService, useExisting: DomSanitizationService},
  /* @ts2dart_Provider */ {provide: DomSanitizationService, useClass: DomSanitizationServiceImpl},
];

/**
 * A set of providers to initialize an Angular application in a web browser.
 *
 * Used automatically by `bootstrap`, or can be passed to {@link PlatformRef.application}.
 */
export const BROWSER_APP_COMMON_PROVIDERS: Array<any /*Type | Provider | any[]*/> =
    /*@ts2dart_const*/[
      APPLICATION_COMMON_PROVIDERS,
      FORM_PROVIDERS,
      BROWSER_SANITIZATION_PROVIDERS,
      /* @ts2dart_Provider */ {provide: PLATFORM_PIPES, useValue: COMMON_PIPES, multi: true},
      /* @ts2dart_Provider */ {provide: PLATFORM_DIRECTIVES, useValue: COMMON_DIRECTIVES, multi: true},
      /* @ts2dart_Provider */ {provide: ExceptionHandler, useFactory: _exceptionHandler, deps: []},
      /* @ts2dart_Provider */ {provide: DOCUMENT, useFactory: _document, deps: []},
      /* @ts2dart_Provider */ {provide: EVENT_MANAGER_PLUGINS, useClass: DomEventsPlugin, multi: true},
      /* @ts2dart_Provider */ {provide: EVENT_MANAGER_PLUGINS, useClass: KeyEventsPlugin, multi: true},
      /* @ts2dart_Provider */ {provide: EVENT_MANAGER_PLUGINS, useClass: HammerGesturesPlugin, multi: true},
      /* @ts2dart_Provider */ {provide: HAMMER_GESTURE_CONFIG, useClass: HammerGestureConfig},
      /* @ts2dart_Provider */ {provide: DomRootRenderer, useClass: DomRootRenderer_},
      /* @ts2dart_Provider */ {provide: RootRenderer, useExisting: DomRootRenderer},
      /* @ts2dart_Provider */ {provide: SharedStylesHost, useExisting: DomSharedStylesHost},
      DomSharedStylesHost,
      Testability,
      BrowserDetails,
      AnimationBuilder,
      EventManager,
      ELEMENT_PROBE_PROVIDERS
    ];

export function browserPlatform(): PlatformRef {
  if (isBlank(getPlatform())) {
    createPlatform(ReflectiveInjector.resolveAndCreate(BROWSER_PLATFORM_PROVIDERS));
  }
  return assertPlatform(BROWSER_PLATFORM_MARKER);
}

function initDomAdapter() {
  BrowserDomAdapter.makeCurrent();
  wtfInit();
  BrowserGetTestability.init();
}

function _exceptionHandler(): ExceptionHandler {
  return new ExceptionHandler(getDOM());
}

function _document(): any {
  return getDOM().defaultDoc();
}
