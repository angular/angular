/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  APP_ID,
  ApplicationRef,
  CSP_NONCE,
  InjectionToken,
  PlatformRef,
  Provider,
  Renderer2,
  StaticProvider,
  Type,
  ɵannotateForHydration as annotateForHydration,
  ɵIS_HYDRATION_DOM_REUSE_ENABLED as IS_HYDRATION_DOM_REUSE_ENABLED,
  ɵSSR_CONTENT_INTEGRITY_MARKER as SSR_CONTENT_INTEGRITY_MARKER,
  ɵstartMeasuring as startMeasuring,
  ɵstopMeasuring as stopMeasuring,
} from '@angular/core';

import {PlatformState} from './platform_state';
import {platformServer} from './server';
import {BEFORE_APP_SERIALIZED, INITIAL_CONFIG} from './tokens';
import {createScript} from './transfer_state';

/**
 * Event dispatch (JSAction) script is inlined into the HTML by the build
 * process to avoid extra blocking request on a page. The script looks like this:
 * ```html
 * <script type="text/javascript" id="ng-event-dispatch-contract">...</script>
 * ```
 * This const represents the "id" attribute value.
 */
export const EVENT_DISPATCH_SCRIPT_ID = 'ng-event-dispatch-contract';

interface PlatformOptions {
  document?: string | Document;
  url?: string;
  platformProviders?: Provider[];
}

/**
 * Creates an instance of a server platform (with or without JIT compiler support
 * depending on the `ngJitMode` global const value), using provided options.
 */
function createServerPlatform(options: PlatformOptions): PlatformRef {
  const extraProviders = options.platformProviders ?? [];
  const measuringLabel = 'createServerPlatform';
  startMeasuring(measuringLabel);

  const platform = platformServer([
    {provide: INITIAL_CONFIG, useValue: {document: options.document, url: options.url}},
    extraProviders,
  ]);

  stopMeasuring(measuringLabel);
  return platform;
}

/**
 * Finds and returns inlined event dispatch script if it exists.
 * See the `EVENT_DISPATCH_SCRIPT_ID` const docs for additional info.
 */
function findEventDispatchScript(doc: Document) {
  return doc.getElementById(EVENT_DISPATCH_SCRIPT_ID);
}

/**
 * Removes inlined event dispatch script if it exists.
 * See the `EVENT_DISPATCH_SCRIPT_ID` const docs for additional info.
 */
function removeEventDispatchScript(doc: Document) {
  findEventDispatchScript(doc)?.remove();
}

/**
 * Annotate nodes for hydration and remove event dispatch script when not needed.
 */
function prepareForHydration(platformState: PlatformState, applicationRef: ApplicationRef): void {
  const measuringLabel = 'prepareForHydration';
  startMeasuring(measuringLabel);
  const environmentInjector = applicationRef.injector;
  const doc = platformState.getDocument();

  if (!environmentInjector.get(IS_HYDRATION_DOM_REUSE_ENABLED, false)) {
    // Hydration is diabled, remove inlined event dispatch script.
    // (which was injected by the build process) from the HTML.
    removeEventDispatchScript(doc);

    return;
  }

  appendSsrContentIntegrityMarker(doc);

  const eventTypesToReplay = annotateForHydration(applicationRef, doc);
  if (eventTypesToReplay.regular.size || eventTypesToReplay.capture.size) {
    insertEventRecordScript(
      environmentInjector.get(APP_ID),
      doc,
      eventTypesToReplay,
      environmentInjector.get(CSP_NONCE, null),
    );
  } else {
    // No events to replay, we should remove inlined event dispatch script
    // (which was injected by the build process) from the HTML.
    removeEventDispatchScript(doc);
  }
  stopMeasuring(measuringLabel);
}

/**
 * Creates a marker comment node and append it into the `<body>`.
 * Some CDNs have mechanisms to remove all comment node from HTML.
 * This behaviour breaks hydration, so we'll detect on the client side if this
 * marker comment is still available or else throw an error
 */
function appendSsrContentIntegrityMarker(doc: Document) {
  // Adding a ng hydration marker comment
  const comment = doc.createComment(SSR_CONTENT_INTEGRITY_MARKER);
  doc.body.firstChild
    ? doc.body.insertBefore(comment, doc.body.firstChild)
    : doc.body.append(comment);
}

/**
 * Adds the `ng-server-context` attribute to host elements of all bootstrapped components
 * within a given application.
 */
function appendServerContextInfo(applicationRef: ApplicationRef) {
  const injector = applicationRef.injector;
  let serverContext = sanitizeServerContext(injector.get(SERVER_CONTEXT, DEFAULT_SERVER_CONTEXT));
  applicationRef.components.forEach((componentRef) => {
    const renderer = componentRef.injector.get(Renderer2);
    const element = componentRef.location.nativeElement;
    if (element) {
      renderer.setAttribute(element, 'ng-server-context', serverContext);
    }
  });
}

function insertEventRecordScript(
  appId: string,
  doc: Document,
  eventTypesToReplay: {regular: Set<string>; capture: Set<string>},
  nonce: string | null,
): void {
  const measuringLabel = 'insertEventRecordScript';
  startMeasuring(measuringLabel);
  const {regular, capture} = eventTypesToReplay;
  const eventDispatchScript = findEventDispatchScript(doc);

  // Note: this is only true when build with the CLI tooling, which inserts the script in the HTML
  if (eventDispatchScript) {
    // This is defined in packages/core/primitives/event-dispatch/contract_binary.ts
    const replayScriptContents =
      `window.__jsaction_bootstrap(` +
      `document.body,` +
      `"${appId}",` +
      `${JSON.stringify(Array.from(regular))},` +
      `${JSON.stringify(Array.from(capture))}` +
      `);`;

    const replayScript = createScript(doc, replayScriptContents, nonce);

    // Insert replay script right after inlined event dispatch script, since it
    // relies on `__jsaction_bootstrap` to be defined in the global scope.
    eventDispatchScript.after(replayScript);
  }
  stopMeasuring(measuringLabel);
}

/**
 * Renders an Angular application to a string.
 *
 * @private
 *
 * @param platformRef - Reference to the Angular platform.
 * @param applicationRef - Reference to the Angular application.
 * @returns A promise that resolves to the rendered string.
 */
export async function renderInternal(
  platformRef: PlatformRef,
  applicationRef: ApplicationRef,
): Promise<string> {
  const platformState = platformRef.injector.get(PlatformState);
  prepareForHydration(platformState, applicationRef);
  appendServerContextInfo(applicationRef);

  // Run any BEFORE_APP_SERIALIZED callbacks just before rendering to string.
  const environmentInjector = applicationRef.injector;
  const callbacks = environmentInjector.get(BEFORE_APP_SERIALIZED, null);
  if (callbacks) {
    const asyncCallbacks: Promise<void>[] = [];
    for (const callback of callbacks) {
      try {
        const callbackResult = callback();
        if (callbackResult) {
          asyncCallbacks.push(callbackResult);
        }
      } catch (e) {
        // Ignore exceptions.
        console.warn('Ignoring BEFORE_APP_SERIALIZED Exception: ', e);
      }
    }

    if (asyncCallbacks.length) {
      for (const result of await Promise.allSettled(asyncCallbacks)) {
        if (result.status === 'rejected') {
          console.warn('Ignoring BEFORE_APP_SERIALIZED Exception: ', result.reason);
        }
      }
    }
  }

  return platformState.renderToString();
}

/**
 * Destroy the application in a macrotask, this allows pending promises to be settled and errors
 * to be surfaced to the users.
 */
function asyncDestroyPlatform(platformRef: PlatformRef): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      platformRef.destroy();
      resolve();
    }, 0);
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
export async function renderModule<T>(
  moduleType: Type<T>,
  options: {document?: string | Document; url?: string; extraProviders?: StaticProvider[]},
): Promise<string> {
  const {document, url, extraProviders: platformProviders} = options;
  const platformRef = createServerPlatform({document, url, platformProviders});
  try {
    const moduleRef = await platformRef.bootstrapModule(moduleType);
    const applicationRef = moduleRef.injector.get(ApplicationRef);

    const measuringLabel = 'whenStable';
    startMeasuring(measuringLabel);
    // Block until application is stable.
    await applicationRef.whenStable();
    stopMeasuring(measuringLabel);

    return await renderInternal(platformRef, applicationRef);
  } finally {
    await asyncDestroyPlatform(platformRef);
  }
}

/**
 * Bootstraps an instance of an Angular application and renders it to a string.

 * ```ts
 * const bootstrap = () => bootstrapApplication(RootComponent, appConfig);
 * const output: string = await renderApplication(bootstrap);
 * ```
 *
 * @param bootstrap A method that when invoked returns a promise that returns an `ApplicationRef`
 *     instance once resolved.
 * @param options Additional configuration for the render operation:
 *  - `document` - the document of the page to render, either as an HTML string or
 *                 as a reference to the `document` instance.
 *  - `url` - the URL for the current render request.
 *  - `platformProviders` - the platform level providers for the current render request.
 *
 * @returns A Promise, that returns serialized (to a string) rendered page, once resolved.
 *
 * @publicApi
 */
export async function renderApplication<T>(
  bootstrap: () => Promise<ApplicationRef>,
  options: {document?: string | Document; url?: string; platformProviders?: Provider[]},
): Promise<string> {
  const renderAppLabel = 'renderApplication';
  const bootstrapLabel = 'bootstrap';
  const _renderLabel = '_render';

  startMeasuring(renderAppLabel);
  const platformRef = createServerPlatform(options);
  try {
    startMeasuring(bootstrapLabel);
    const applicationRef = await bootstrap();
    stopMeasuring(bootstrapLabel);

    startMeasuring(_renderLabel);

    const measuringLabel = 'whenStable';
    startMeasuring(measuringLabel);
    // Block until application is stable.
    await applicationRef.whenStable();
    stopMeasuring(measuringLabel);

    const rendered = await renderInternal(platformRef, applicationRef);
    stopMeasuring(_renderLabel);
    return rendered;
  } finally {
    await asyncDestroyPlatform(platformRef);
    stopMeasuring(renderAppLabel);
  }
}
