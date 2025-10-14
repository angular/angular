/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {
  CommonModule,
  DOCUMENT,
  XhrFactory,
  ɵPLATFORM_BROWSER_ID as PLATFORM_BROWSER_ID,
} from '@angular/common';
import {
  ApplicationModule,
  createPlatformFactory,
  ErrorHandler,
  InjectionToken,
  NgModule,
  PLATFORM_ID,
  PLATFORM_INITIALIZER,
  platformCore,
  RendererFactory2,
  Testability,
  ɵINJECTOR_SCOPE as INJECTOR_SCOPE,
  ɵinternalCreateApplication as internalCreateApplication,
  ɵRuntimeError as RuntimeError,
  ɵsetDocument,
  ɵTESTABILITY as TESTABILITY,
  ɵTESTABILITY_GETTER as TESTABILITY_GETTER,
  inject,
  ɵresolveComponentResources as resolveComponentResources,
} from '@angular/core';
import {BrowserDomAdapter} from './browser/browser_adapter';
import {BrowserGetTestability} from './browser/testability';
import {BrowserXhr} from './browser/xhr';
import {DomRendererFactory2} from './dom/dom_renderer';
import {DomEventsPlugin} from './dom/events/dom_events';
import {EVENT_MANAGER_PLUGINS, EventManager} from './dom/events/event_manager';
import {KeyEventsPlugin} from './dom/events/key_events';
import {SharedStylesHost} from './dom/shared_styles_host';
/**
 * Bootstraps an instance of an Angular application and renders a standalone component as the
 * application's root component. More information about standalone components can be found in [this
 * guide](guide/components/importing).
 *
 * @usageNotes
 * The root component passed into this function *must* be a standalone one (should have the
 * `standalone: true` flag in the `@Component` decorator config).
 *
 * ```angular-ts
 * @Component({
 *   standalone: true,
 *   template: 'Hello world!'
 * })
 * class RootComponent {}
 *
 * const appRef: ApplicationRef = await bootstrapApplication(RootComponent);
 * ```
 *
 * You can add the list of providers that should be available in the application injector by
 * specifying the `providers` field in an object passed as the second argument:
 *
 * ```ts
 * await bootstrapApplication(RootComponent, {
 *   providers: [
 *     {provide: BACKEND_URL, useValue: 'https://yourdomain.com/api'}
 *   ]
 * });
 * ```
 *
 * The `importProvidersFrom` helper method can be used to collect all providers from any
 * existing NgModule (and transitively from all NgModules that it imports):
 *
 * ```ts
 * await bootstrapApplication(RootComponent, {
 *   providers: [
 *     importProvidersFrom(SomeNgModule)
 *   ]
 * });
 * ```
 *
 * Note: the `bootstrapApplication` method doesn't include [Testability](api/core/Testability) by
 * default. You can add [Testability](api/core/Testability) by getting the list of necessary
 * providers using `provideProtractorTestingSupport()` function and adding them into the `providers`
 * array, for example:
 *
 * ```ts
 * import {provideProtractorTestingSupport} from '@angular/platform-browser';
 *
 * await bootstrapApplication(RootComponent, {providers: [provideProtractorTestingSupport()]});
 * ```
 *
 * @param rootComponent A reference to a standalone component that should be rendered.
 * @param options Extra configuration for the bootstrap operation, see `ApplicationConfig` for
 *     additional info.
 * @param context Optional context object that can be used to provide a pre-existing
 *     platform injector. This is useful for advanced use-cases, for example, server-side
 *     rendering, where the platform is created for each request.
 * @returns A promise that returns an `ApplicationRef` instance once resolved.
 *
 * @publicApi
 */
export function bootstrapApplication(rootComponent, options, context) {
  const config = {
    rootComponent,
    platformRef: context?.platformRef,
    ...createProvidersConfig(options),
  };
  // Attempt to resolve component resources before bootstrapping in JIT mode,
  // however don't interrupt the bootstrapping process.
  if ((typeof ngJitMode === 'undefined' || ngJitMode) && typeof fetch === 'function') {
    return resolveComponentResources(fetch)
      .catch((error) => {
        console.error(error);
        return Promise.resolve();
      })
      .then(() => internalCreateApplication(config));
  }
  return internalCreateApplication(config);
}
/**
 * Create an instance of an Angular application without bootstrapping any components. This is useful
 * for the situation where one wants to decouple application environment creation (a platform and
 * associated injectors) from rendering components on a screen. Components can be subsequently
 * bootstrapped on the returned `ApplicationRef`.
 *
 * @param options Extra configuration for the application environment, see `ApplicationConfig` for
 *     additional info.
 * @returns A promise that returns an `ApplicationRef` instance once resolved.
 *
 * @publicApi
 */
export function createApplication(options) {
  return internalCreateApplication(createProvidersConfig(options));
}
function createProvidersConfig(options) {
  return {
    appProviders: [...BROWSER_MODULE_PROVIDERS, ...(options?.providers ?? [])],
    platformProviders: INTERNAL_BROWSER_PLATFORM_PROVIDERS,
  };
}
/**
 * Returns a set of providers required to setup [Testability](api/core/Testability) for an
 * application bootstrapped using the `bootstrapApplication` function. The set of providers is
 * needed to support testing an application with Protractor (which relies on the Testability APIs
 * to be present).
 *
 * @returns An array of providers required to setup Testability for an application and make it
 *     available for testing using Protractor.
 *
 * @publicApi
 */
export function provideProtractorTestingSupport() {
  // Return a copy to prevent changes to the original array in case any in-place
  // alterations are performed to the `provideProtractorTestingSupport` call results in app
  // code.
  return [...TESTABILITY_PROVIDERS];
}
export function initDomAdapter() {
  BrowserDomAdapter.makeCurrent();
}
export function errorHandler() {
  return new ErrorHandler();
}
export function _document() {
  // Tell ivy about the global document
  ɵsetDocument(document);
  return document;
}
const INTERNAL_BROWSER_PLATFORM_PROVIDERS = [
  {provide: PLATFORM_ID, useValue: PLATFORM_BROWSER_ID},
  {provide: PLATFORM_INITIALIZER, useValue: initDomAdapter, multi: true},
  {provide: DOCUMENT, useFactory: _document},
];
/**
 * A factory function that returns a `PlatformRef` instance associated with browser service
 * providers.
 *
 * @publicApi
 */
export const platformBrowser = createPlatformFactory(
  platformCore,
  'browser',
  INTERNAL_BROWSER_PLATFORM_PROVIDERS,
);
/**
 * Internal marker to signal whether providers from the `BrowserModule` are already present in DI.
 * This is needed to avoid loading `BrowserModule` providers twice. We can't rely on the
 * `BrowserModule` presence itself, since the standalone-based bootstrap just imports
 * `BrowserModule` providers without referencing the module itself.
 */
const BROWSER_MODULE_PROVIDERS_MARKER = new InjectionToken(
  typeof ngDevMode === 'undefined' || ngDevMode ? 'BrowserModule Providers Marker' : '',
);
const TESTABILITY_PROVIDERS = [
  {
    provide: TESTABILITY_GETTER,
    useClass: BrowserGetTestability,
  },
  {
    provide: TESTABILITY,
    useClass: Testability,
  },
  {
    provide: Testability, // Also provide as `Testability` for backwards-compatibility.
    useClass: Testability,
  },
];
const BROWSER_MODULE_PROVIDERS = [
  {provide: INJECTOR_SCOPE, useValue: 'root'},
  {provide: ErrorHandler, useFactory: errorHandler},
  {
    provide: EVENT_MANAGER_PLUGINS,
    useClass: DomEventsPlugin,
    multi: true,
  },
  {provide: EVENT_MANAGER_PLUGINS, useClass: KeyEventsPlugin, multi: true},
  DomRendererFactory2,
  SharedStylesHost,
  EventManager,
  {provide: RendererFactory2, useExisting: DomRendererFactory2},
  {provide: XhrFactory, useClass: BrowserXhr},
  typeof ngDevMode === 'undefined' || ngDevMode
    ? {provide: BROWSER_MODULE_PROVIDERS_MARKER, useValue: true}
    : [],
];
/**
 * Exports required infrastructure for all Angular apps.
 * Included by default in all Angular apps created with the CLI
 * `new` command.
 * Re-exports `CommonModule` and `ApplicationModule`, making their
 * exports and providers available to all apps.
 *
 * @publicApi
 */
let BrowserModule = (() => {
  let _classDecorators = [
    NgModule({
      providers: [...BROWSER_MODULE_PROVIDERS, ...TESTABILITY_PROVIDERS],
      exports: [CommonModule, ApplicationModule],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var BrowserModule = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      BrowserModule = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    constructor() {
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        const providersAlreadyPresent = inject(BROWSER_MODULE_PROVIDERS_MARKER, {
          optional: true,
          skipSelf: true,
        });
        if (providersAlreadyPresent) {
          throw new RuntimeError(
            5100 /* RuntimeErrorCode.BROWSER_MODULE_ALREADY_LOADED */,
            `Providers from the \`BrowserModule\` have already been loaded. If you need access ` +
              `to common directives such as NgIf and NgFor, import the \`CommonModule\` instead.`,
          );
        }
      }
    }
  };
  return (BrowserModule = _classThis);
})();
export {BrowserModule};
//# sourceMappingURL=browser.js.map
