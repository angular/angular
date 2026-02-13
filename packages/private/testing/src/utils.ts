/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ɵresetJitOptions as resetJitOptions} from '@angular/core';
import {waitFor} from '@testing-library/dom';

/**
 * Wraps a function in a new function which sets up document and HTML for running a test.
 *
 * This function wraps an existing testing function. The wrapper adds HTML to the `body` element of
 * the `document` and subsequently tears it down.
 *
 * This function can be used with `async await` and `Promise`s. If the wrapped function returns a
 * promise (or is `async`) then the teardown is delayed until that `Promise` is resolved.
 *
 * In the NodeJS environment this function detects if `document` is present and if not, it creates
 * one by loading `domino` and installing it.
 *
 * Example:
 *
 * ```ts
 * describe('something', () => {
 *   it('should do something', withBody('<app-root></app-root>', async () => {
 *     const fixture = TestBed.createComponent(MyApp);
 *     fixture.detectChanges();
 *     expect(fixture.nativeElement.textContent).toEqual('Hello World!');
 *   }));
 * });
 * ```
 *
 * @param html HTML which should be inserted into the `body` of the `document`.
 * @param blockFn function to wrap. The function can return promise or be `async`.
 */
export function withBody(
  html: string,
  blockFn: () => Promise<unknown> | void,
): jasmine.ImplementationCallback {
  return wrapTestFn(() => document.body, html, blockFn);
}

/**
 * Wraps a function in a new function which sets up document and HTML for running a test.
 *
 * This function wraps an existing testing function. The wrapper adds HTML to the `head` element of
 * the `document` and subsequently tears it down.
 *
 * This function can be used with `async await` and `Promise`s. If the wrapped function returns a
 * promise (or is `async`) then the teardown is delayed until that `Promise` is resolved.
 *
 * In the NodeJS environment this function detects if `document` is present and if not, it creates
 * one by loading `domino` and installing it.
 *
 * Example:
 *
 * ```ts
 * describe('something', () => {
 *   it('should do something', withHead('<link rel="preconnect" href="...">', async () => {
 *     // ...
 *   }));
 * });
 * ```
 *
 * @param html HTML which should be inserted into the `head` of the `document`.
 * @param blockFn function to wrap. The function can return promise or be `async`.
 */
export function withHead(
  html: string,
  blockFn: () => Promise<unknown> | void,
): jasmine.ImplementationCallback {
  return wrapTestFn(() => document.head, html, blockFn);
}

/**
 * Wraps provided function (which typically contains the code of a test) into a new function that
 * performs the necessary setup of the environment.
 */
function wrapTestFn(
  elementGetter: () => HTMLElement,
  html: string,
  blockFn: () => Promise<unknown> | void,
): jasmine.ImplementationCallback {
  return () => {
    elementGetter().innerHTML = html;
    return blockFn();
  };
}

let savedDocument: Document | undefined = undefined;
let savedRequestAnimationFrame: ((callback: FrameRequestCallback) => number) | undefined =
  undefined;
let savedNode: typeof Node | undefined = undefined;
let requestAnimationFrameCount = 0;
let domino:
  | (typeof import('../../../platform-server/src/bundled-domino'))['default']
  | null
  | undefined = undefined;

async function loadDominoOrNull(): Promise<
  (typeof import('../../../platform-server/src/bundled-domino'))['default'] | null
> {
  if (domino !== undefined) {
    return domino;
  }

  try {
    return (domino = (await import('../../../platform-server/src/bundled-domino')).default);
  } catch {
    return (domino = null);
  }
}

/**
 * Ensure that global has `Document` if we are in node.js
 */
export async function ensureDocument(): Promise<void> {
  if ((global as any).isBrowser) {
    return;
  }

  const domino = await loadDominoOrNull();
  if (domino === null) {
    return;
  }

  // we are in node.js.
  const window = domino.createWindow('', 'http://localhost');
  savedDocument = (global as any).document;
  (global as any).window = window;
  (global as any).document = window.document;
  savedNode = (global as any).Node;
  // Domino types do not type `impl`, but it's a documented field.
  // See: https://www.npmjs.com/package/domino#usage.
  (global as any).Event = (domino as typeof domino & {impl: any}).impl.Event;
  (global as any).Node = (domino as typeof domino & {impl: any}).impl.Node;

  savedRequestAnimationFrame = (global as any).requestAnimationFrame;
  (global as any).requestAnimationFrame = function (cb: () => void): number {
    setImmediate(cb);
    return requestAnimationFrameCount++;
  };
}

/**
 * Restore the state of `Document` between tests.
 * @publicApi
 */
export function cleanupDocument(): void {
  if (savedDocument) {
    (global as any).document = savedDocument;
    (global as any).window = undefined;
    savedDocument = undefined;
  }
  if (savedNode) {
    (global as any).Node = savedNode;
    savedNode = undefined;
  }
  if (savedRequestAnimationFrame) {
    (global as any).requestAnimationFrame = savedRequestAnimationFrame;
    savedRequestAnimationFrame = undefined;
  }
}

if (typeof beforeEach == 'function') beforeEach(ensureDocument);
if (typeof afterEach == 'function') afterEach(cleanupDocument);

if (typeof afterEach === 'function') afterEach(resetJitOptions);

/**
 * Returns a promise that resolves after the specified time.
 *
 * @param ms - Time to wait in milliseconds. Defaults to 0.
 *
 * @example
 * ```ts
 * await timeout(100); // Wait 100ms
 * ```
 */
export async function timeout(ms?: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Installs Jasmine's fake clock with auto-tick enabled for all tests in the describe block.
 * Call at the top level of a describe block to automatically advance time for async operations.
 *
 * @example
 * ```ts
 * describe('MyComponent', () => {
 *   useAutoTick();
 *
 *   it('should handle timers', () => {
 *     // setTimeout, setInterval, etc. will execute synchronously
 *   });
 * });
 * ```
 */
export function useAutoTick() {
  beforeEach(() => {
    jasmine.clock().install();
    jasmine.clock().autoTick();
  });
  afterEach(() => {
    jasmine.clock().uninstall();
  });
}

/**
 * Returns a promise that resolves when the provided element's text content matches the expected text.
 *
 * @param element - The element or fixture to check.
 * @param text - The expected text content.
 *
 * @example
 * ```ts
 * await expectText(fixture, 'Hello');
 * ```
 */
/**
 * Returns a promise that resolves when the text content is found on the screen.
 *
 * @param text - The expected text content, regex, or matcher function.
 *
 * @example
 * ```ts
 * await expectScreenText('Hello');
 * await expectScreenText(/Hello/);
 * ```
 */
export async function expectScreenText(text: string | RegExp): Promise<void> {
  await waitFor(() => {
    const content = document.body.textContent || '';
    if (typeof text === 'string') {
      throwUnless(content).toContain(text);
    } else {
      throwUnless(text.test(content)).toBeTrue();
    }
  });
}
