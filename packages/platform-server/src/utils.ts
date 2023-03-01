/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ApplicationRef, EnvironmentProviders, importProvidersFrom, InjectionToken, NgModuleFactory, NgModuleRef, PlatformRef, Provider, Renderer2, StaticProvider, Type, ɵinternalCreateApplication as internalCreateApplication, ɵisPromise} from '@angular/core';
import {BrowserModule, ɵTRANSITION_ID} from '@angular/platform-browser';
import {first} from 'rxjs/operators';

import {PlatformState} from './platform_state';
import {platformDynamicServer, platformServer, ServerModule} from './server';
import {BEFORE_APP_SERIALIZED, INITIAL_CONFIG} from './tokens';
import {TRANSFER_STATE_SERIALIZATION_PROVIDERS} from './transfer_state';

interface PlatformOptions {
  document?: string|Document;
  url?: string;
  platformProviders?: Provider[];
}

function _getPlatform(
    platformFactory: (extraProviders: StaticProvider[]) => PlatformRef,
    options: PlatformOptions): PlatformRef {
  const extraProviders = options.platformProviders ?? [];
  return platformFactory([
    {provide: INITIAL_CONFIG, useValue: {document: options.document, url: options.url}},
    extraProviders
  ]);
}

/**
 * Adds the `ng-server-context` attribute to host elements of all bootstrapped components
 * within a given application.
 */
function appendServerContextInfo(serverContext: string, applicationRef: ApplicationRef) {
  applicationRef.components.forEach(componentRef => {
    const renderer = componentRef.injector.get(Renderer2);
    const element = componentRef.location.nativeElement;
    if (element) {
      renderer.setAttribute(element, 'ng-server-context', serverContext);
    }
  });
}

function _render<T>(
    platform: PlatformRef,
    bootstrapPromise: Promise<NgModuleRef<T>|ApplicationRef>): Promise<string> {
  return bootstrapPromise.then((moduleOrApplicationRef) => {
    const environmentInjector = moduleOrApplicationRef.injector;
    const transitionId = environmentInjector.get(ɵTRANSITION_ID, null);
    if (!transitionId) {
      throw new Error(
          `renderModule[Factory]() requires the use of BrowserModule.withServerTransition() to ensure
the server-rendered app can be properly bootstrapped into a client app.`);
    }
    const applicationRef: ApplicationRef = moduleOrApplicationRef instanceof ApplicationRef ?
        moduleOrApplicationRef :
        environmentInjector.get(ApplicationRef);
    const serverContext =
        sanitizeServerContext(environmentInjector.get(SERVER_CONTEXT, DEFAULT_SERVER_CONTEXT));
    return applicationRef.isStable.pipe((first((isStable: boolean) => isStable)))
        .toPromise()
        .then(() => {
          appendServerContextInfo(serverContext, applicationRef);

          const platformState = platform.injector.get(PlatformState);

          const asyncPromises: Promise<any>[] = [];

          // Run any BEFORE_APP_SERIALIZED callbacks just before rendering to string.
          const callbacks = environmentInjector.get(BEFORE_APP_SERIALIZED, null);

          if (callbacks) {
            for (const callback of callbacks) {
              try {
                const callbackResult = callback();
                if (ɵisPromise(callbackResult)) {
                  // TODO: in TS3.7, callbackResult is void.
                  asyncPromises.push(callbackResult as any);
                }

              } catch (e) {
                // Ignore exceptions.
                console.warn('Ignoring BEFORE_APP_SERIALIZED Exception: ', e);
              }
            }
          }

          const complete = () => {
            const output = platformState.renderToString();
            platform.destroy();
            return output;
          };

          if (asyncPromises.length === 0) {
            return complete();
          }

          return Promise
              .all(asyncPromises.map(asyncPromise => {
                return asyncPromise.catch(e => {
                  console.warn('Ignoring BEFORE_APP_SERIALIZED Exception: ', e);
                });
              }))
              .then(complete);
        });
  });
}

/**
 * Specifies the value that should be used if no server context value has been provided.
 */
const DEFAULT_SERVER_CONTEXT = 'other';

/**
 * An internal token that allows providing extra information about the server context
 * (e.g. whether SSR or SSG was used). The value is a string and characters other
 * than [a-zA-Z0-9\-] are removed. See the default value in `DEFAULT_SERVER_CONTEXT` const.
 */
export const SERVER_CONTEXT = new InjectionToken<string>('SERVER_CONTEXT');

/**
 * Sanitizes provided server context:
 * - removes all characters other than a-z, A-Z, 0-9 and `-`
 * - returns `other` if nothing is provided or the string is empty after sanitization
 */
function sanitizeServerContext(serverContext: string): string {
  const context = serverContext.replace(/[^a-zA-Z0-9\-]/g, '');
  return context.length > 0 ? context : DEFAULT_SERVER_CONTEXT;
}

/**
 * Bootstraps an application using provided NgModule and serializes the page content to string.
 *
 * @param moduleType A reference to an NgModule that should be used for bootstrap.
 * @param options Additional configuration for the render operation:
 *  - `document` - the document of the page to render, either as an HTML string or
 *                 as a reference to the `document` instance.
 *  - `url` - the URL for the current render request.
 *  - `extraProviders` - set of platform level providers for the current render request.
 *
 * @publicApi
 */
export function renderModule<T>(moduleType: Type<T>, options: {
  document?: string|Document,
  url?: string,
  extraProviders?: StaticProvider[],
}): Promise<string> {
  const {document, url, extraProviders: platformProviders} = options;
  const platform = _getPlatform(platformDynamicServer, {document, url, platformProviders});
  return _render(platform, platform.bootstrapModule(moduleType));
}

/**
 * Bootstraps an instance of an Angular application and renders it to a string.
 *
 * Note: the root component passed into this function *must* be a standalone one (should have the
 * `standalone: true` flag in the `@Component` decorator config).
 *
 * ```typescript
 * @Component({
 *   standalone: true,
 *   template: 'Hello world!'
 * })
 * class RootComponent {}
 *
 * const output: string = await renderApplication(RootComponent, {appId: 'server-app'});
 * ```
 *
 * @param rootComponent A reference to a Standalone Component that should be rendered.
 * @param options Additional configuration for the render operation:
 *  - `appId` - a string identifier of this application. The appId is used to prefix all
 *              server-generated stylings and state keys of the application in TransferState
 *              use-cases.
 *  - `document` - the document of the page to render, either as an HTML string or
 *                 as a reference to the `document` instance.
 *  - `url` - the URL for the current render request.
 *  - `providers` - set of application level providers for the current render request.
 *  - `platformProviders` - the platform level providers for the current render request.
 *
 * @returns A Promise, that returns serialized (to a string) rendered page, once resolved.
 *
 * @publicApi
 * @developerPreview
 */
export function renderApplication<T>(rootComponent: Type<T>, options: {
  appId: string,
  document?: string|Document,
  url?: string,
  providers?: Array<Provider|EnvironmentProviders>,
  platformProviders?: Provider[],
}): Promise<string> {
  const {document, url, platformProviders, appId} = options;
  const platform = _getPlatform(platformDynamicServer, {document, url, platformProviders});
  const appProviders = [
    importProvidersFrom(BrowserModule.withServerTransition({appId})),
    importProvidersFrom(ServerModule),
    ...(options.providers ?? []),
  ];
  return _render(platform, internalCreateApplication({rootComponent, appProviders}));
}

/**
 * Bootstraps an application using provided {@link NgModuleFactory} and serializes the page content
 * to string.
 *
 * @param moduleFactory An instance of the {@link NgModuleFactory} that should be used for
 *     bootstrap.
 * @param options Additional configuration for the render operation:
 *  - `document` - the document of the page to render, either as an HTML string or
 *                 as a reference to the `document` instance.
 *  - `url` - the URL for the current render request.
 *  - `extraProviders` - set of platform level providers for the current render request.
 *
 * @publicApi
 *
 * @deprecated
 * This symbol is no longer necessary as of Angular v13.
 * Use {@link renderModule} API instead.
 */
export function renderModuleFactory<T>(moduleFactory: NgModuleFactory<T>, options: {
  document?: string,
  url?: string,
  extraProviders?: StaticProvider[],
}): Promise<string> {
  const {document, url, extraProviders: platformProviders} = options;
  const platform = _getPlatform(platformServer, {document, url, platformProviders});
  return _render(platform, platform.bootstrapModuleFactory(moduleFactory));
}
