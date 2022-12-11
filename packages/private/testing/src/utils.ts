/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵresetJitOptions as resetJitOptions} from '@angular/core';

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
 * ```
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
export function withBody<T extends Function>(html: string, blockFn: T): T {
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
 * ```
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
export function withHead<T extends Function>(html: string, blockFn: T): T {
  return wrapTestFn(() => document.head, html, blockFn);
}

/**
 * Wraps provided function (which typically contains the code of a test) into a new function that
 * performs the necessary setup of the environment.
 */
function wrapTestFn<T extends Function>(
    elementGetter: () => HTMLElement, html: string, blockFn: T): T {
  return function(done: DoneFn) {
    if (typeof blockFn === 'function') {
      elementGetter().innerHTML = html;
      const blockReturn = blockFn();
      if (blockReturn instanceof Promise) {
        blockReturn.then(done, done.fail);
      } else {
        done();
      }
    }
  } as any;
}

/**
 * Runs jasmine expectations against the provided keys for `ngDevMode`.
 *
 * Will not perform expectations for keys that are not provided.
 *
 * ```ts
 * // Expect that `ngDevMode.styleMap` is `1`, and `ngDevMode.tNode` is `3`, but we don't care
 * // about the other values.
 * expectPerfCounters({
 *   stylingMap: 1,
 *   tNode: 3,
 * })
 * ```
 */
export function expectPerfCounters(expectedCounters: Partial<NgDevModePerfCounters>): void {
  Object.keys(expectedCounters).forEach(key => {
    const expected = (expectedCounters as any)[key];
    const actual = (ngDevMode as any)[key];
    expect(actual).toBe(expected, `ngDevMode.${key}`);
  });
}

let savedDocument: Document|undefined = undefined;
let savedRequestAnimationFrame: ((callback: FrameRequestCallback) => number)|undefined = undefined;
let savedNode: typeof Node|undefined = undefined;
let requestAnimationFrameCount = 0;
let domino: typeof import('domino')|null|undefined = undefined;

async function loadDominoOrNull(): Promise<typeof import('domino')|null> {
  if (domino !== undefined) {
    return domino;
  }

  try {
    return domino = (await import('domino')).default;
  } catch {
    return domino = null;
  }
}

/**
 * Ensure that global has `Document` if we are in node.js
 * @publicApi
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
  // Trick to avoid Event patching from
  // https://github.com/angular/angular/blob/7cf5e95ac9f0f2648beebf0d5bd9056b79946970/packages/platform-browser/src/dom/events/dom_events.ts#L112-L132
  // It fails with Domino with TypeError: Cannot assign to read only property
  // 'stopImmediatePropagation' of object '#<Event>'
  (global as any).Event = null;
  savedNode = (global as any).Node;
  // Domino types do not type `impl`, but it's a documented field.
  // See: https://www.npmjs.com/package/domino#usage.
  (global as any).Node = (domino as typeof domino&{impl: any}).impl.Node;

  savedRequestAnimationFrame = (global as any).requestAnimationFrame;
  (global as any).requestAnimationFrame = function(cb: () => void): number {
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
