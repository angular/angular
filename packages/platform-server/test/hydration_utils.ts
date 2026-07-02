/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ApplicationRef,
  ComponentRef,
  ErrorHandler,
  Injectable,
  Provider,
  Type,
  ɵConsole as Console,
  ɵHydrationStatus as HydrationStatus,
  ɵreadHydrationInfo as readHydrationInfo,
  ɵSSR_CONTENT_INTEGRITY_MARKER as SSR_CONTENT_INTEGRITY_MARKER,
} from '@angular/core';
import {
  bootstrapApplication,
  BootstrapContext,
  HydrationFeature,
  provideClientHydration,
  HydrationFeatureKind,
} from '@angular/platform-browser';

import {provideServerRendering} from '../public_api';
import {EVENT_DISPATCH_SCRIPT_ID, renderApplication} from '../src/utils';

import {getAppContents, stripUtilAttributes} from './dom_utils';

/**
 * The name of the attribute that contains a slot index
 * inside the TransferState storage where hydration info
 * could be found.
 */
export const NGH_ATTR_NAME = 'ngh';
export const EMPTY_TEXT_NODE_COMMENT = 'ngetn';
export const TEXT_NODE_SEPARATOR_COMMENT = 'ngtns';

export const SKIP_HYDRATION_ATTR_NAME = 'ngSkipHydration';
export const SKIP_HYDRATION_ATTR_NAME_LOWER_CASE: string = SKIP_HYDRATION_ATTR_NAME.toLowerCase();

export const TRANSFER_STATE_TOKEN_ID = '__nghData__';

/**
 * Represents the <script> tag added by the build process to inject
 * event dispatch (JSAction) logic.
 */
export const EVENT_DISPATCH_SCRIPT = `<script type="text/javascript" id="${EVENT_DISPATCH_SCRIPT_ID}"></script>`;
export const DEFAULT_DOCUMENT = `<html><head></head><body>${EVENT_DISPATCH_SCRIPT}<app></app></body></html>`;

export function getComponentRef<T>(appRef: ApplicationRef): ComponentRef<T> {
  return appRef.components[0];
}

export function stripSsrIntegrityMarker(input: string): string {
  return input.replace(`<!--${SSR_CONTENT_INTEGRITY_MARKER}-->`, '');
}

export function stripTransferDataScript(input: string): string {
  return input.replace(/<script (.*?)<\/script>/s, '');
}

export function stripExcessiveSpaces(html: string): string {
  return html.replace(/\s+/g, ' ');
}

export function verifyClientAndSSRContentsMatch(
  ssrContents: string,
  clientAppRootElement: HTMLElement,
) {
  const clientContents = stripSsrIntegrityMarker(
    stripTransferDataScript(stripUtilAttributes(clientAppRootElement.outerHTML, false)),
  );
  ssrContents = stripSsrIntegrityMarker(
    stripTransferDataScript(stripUtilAttributes(ssrContents, false)),
  );
  expect(getAppContents(clientContents)).toBe(ssrContents, 'Client and server contents mismatch');
}

export function verifyNodeHasMismatchInfo(doc: Document, selector = 'app'): void {
  expect(readHydrationInfo(doc.querySelector(selector)!)?.status).toBe(HydrationStatus.Mismatched);
}

/** Checks whether a given element is a <script> that contains transfer state data. */
export function isTransferStateScript(el: HTMLElement): boolean {
  return (
    el.nodeType === Node.ELEMENT_NODE &&
    el.tagName.toLowerCase() === 'script' &&
    el.getAttribute('id') === 'ng-state'
  );
}

export function isSsrContentsIntegrityMarker(el: Node): boolean {
  return (
    el.nodeType === Node.COMMENT_NODE && el.textContent?.trim() === SSR_CONTENT_INTEGRITY_MARKER
  );
}

/**
 * Walks over DOM nodes starting from a given node and checks
 * whether all nodes were claimed for hydration, i.e. annotated
 * with a special monkey-patched flag (which is added in dev mode
 * only). It skips any nodes with the skip hydration attribute.
 */
export function verifyAllNodesClaimedForHydration(el: HTMLElement, exceptions: HTMLElement[] = []) {
  if (
    (el.nodeType === Node.ELEMENT_NODE && el.hasAttribute(SKIP_HYDRATION_ATTR_NAME_LOWER_CASE)) ||
    exceptions.includes(el) ||
    isTransferStateScript(el) ||
    isSsrContentsIntegrityMarker(el)
  ) {
    return;
  }

  if (readHydrationInfo(el)?.status !== HydrationStatus.Hydrated) {
    fail('Hydration error: the node is *not* hydrated: ' + el.outerHTML);
  }
  verifyAllChildNodesClaimedForHydration(el, exceptions);
}

export function verifyAllChildNodesClaimedForHydration(
  el: HTMLElement,
  exceptions: HTMLElement[] = [],
) {
  let current = el.firstChild;
  while (current) {
    verifyAllNodesClaimedForHydration(current as HTMLElement, exceptions);
    current = current.nextSibling;
  }
}

export function verifyNodeWasHydrated(el: HTMLElement) {
  if (readHydrationInfo(el)?.status !== HydrationStatus.Hydrated) {
    fail('Hydration error: the node is *not* hydrated: ' + el.outerHTML);
  }
}

export function verifyNodeWasNotHydrated(el: HTMLElement) {
  if (readHydrationInfo(el)?.status === HydrationStatus.Hydrated) {
    fail('Hydration error: the node is hydrated and should not be: ' + el.outerHTML);
  }
}

/**
 * Walks over DOM nodes starting from a given node and make sure
 * those nodes were not annotated as "claimed" by hydration.
 * This helper function is needed to verify that the non-destructive
 * hydration feature can be turned off.
 */
export function verifyNoNodesWereClaimedForHydration(el: HTMLElement) {
  if (readHydrationInfo(el)?.status === HydrationStatus.Hydrated) {
    fail(
      'Unexpected state: the following node was hydrated, when the test ' +
        'expects the node to be re-created instead: ' +
        el.outerHTML,
    );
  }
  let current = el.firstChild;
  while (current) {
    verifyNoNodesWereClaimedForHydration(current as HTMLElement);
    current = current.nextSibling;
  }
}

export function verifyNodeHasSkipHydrationMarker(element: HTMLElement): void {
  expect(readHydrationInfo(element)?.status).toBe(HydrationStatus.Skipped);
}

/**
 * Verifies whether a console has a log entry that contains a given message.
 */
export function verifyHasLog(appRef: ApplicationRef, message: string) {
  const console = appRef.injector.get(Console) as DebugConsole;
  const context =
    `Expected '${message}' to be present in the log, but it was not found. ` +
    `Logs content: ${JSON.stringify(console.logs)}`;
  expect(console.logs.some((log) => log.includes(message)))
    .withContext(context)
    .toBe(true);
}

/**
 * Verifies that there is no message with a particular content in a console.
 */
export function verifyHasNoLog(appRef: ApplicationRef, message: string) {
  const console = appRef.injector.get(Console) as DebugConsole;
  const context =
    `Expected '${message}' to be present in the log, but it was not found. ` +
    `Logs content: ${JSON.stringify(console.logs)}`;
  expect(console.logs.some((log) => log.includes(message)))
    .withContext(context)
    .toBe(false);
}

export function timeout(delay: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, delay);
  });
}

export function getHydrationInfoFromTransferState(input: string): string | undefined {
  return input.match(/<script.*application\/json[^>]+>(.*?)<\/script>/)?.[1];
}

export function withNoopErrorHandler() {
  class NoopErrorHandler extends ErrorHandler {
    override handleError(error: any): void {
      // noop
    }
  }
  return [
    {
      provide: ErrorHandler,
      useClass: NoopErrorHandler,
    },
  ];
}

@Injectable()
export class DebugConsole extends Console {
  logs: string[] = [];
  override log(message: string) {
    this.logs.push(message);
  }
  override warn(message: string) {
    this.logs.push(message);
  }
}

export function withDebugConsole() {
  return [{provide: Console, useClass: DebugConsole}];
}

/**
 * This renders the application with server side rendering logic.
 *
 * @param component the test component to be rendered
 * @param doc the document
 * @param envProviders the environment providers
 * @returns a promise containing the server rendered app as a string
 */
export async function ssr(
  component: Type<unknown>,
  options: {
    doc?: string;
    envProviders?: Provider[];
    hydrationFeatures?: () => HydrationFeature<HydrationFeatureKind>[];
    enableHydration?: boolean;
  } = {},
): Promise<string> {
  try {
    // Enter server mode for the duration of this function.
    globalThis['ngServerMode'] = true;

    const defaultHtml = DEFAULT_DOCUMENT;
    const {enableHydration = true, envProviders = [], hydrationFeatures = () => []} = options;
    const providers = [
      ...envProviders,
      provideServerRendering(),
      enableHydration ? provideClientHydration(...hydrationFeatures()) : [],
    ];

    const bootstrap = (context: BootstrapContext) =>
      bootstrapApplication(component, {providers}, context);

    return await renderApplication(bootstrap, {
      document: options?.doc ?? defaultHtml,
    });
  } finally {
    // Leave server mode so the remaining test is back in "client mode".
    globalThis['ngServerMode'] = undefined;
  }
}

/**
 * Verifies that there are no messages in a console.
 */
export function verifyEmptyConsole(appRef: ApplicationRef) {
  const console = appRef.injector.get(Console) as DebugConsole;
  const logs = console.logs.filter(
    (msg) => !msg.startsWith('Angular is running in development mode'),
  );
  expect(logs).toEqual([]);
}

/**
 * Clears the Debug console
 */
export function clearConsole(appRef: ApplicationRef) {
  const console = appRef.injector.get(Console) as DebugConsole;
  console.logs = [];
}

// Clears all the counts in ngDevMode
export function resetNgDevModeCounters() {
  if (typeof ngDevMode === 'object') {
    // Reset all ngDevMode counters.
    for (const metric of Object.keys(ngDevMode!)) {
      const currentValue = (ngDevMode as unknown as {[key: string]: number | boolean})[metric];
      if (typeof currentValue === 'number') {
        // Rest only numeric values, which represent counters.
        (ngDevMode as unknown as {[key: string]: number | boolean})[metric] = 0;
      }
    }
  }
}
