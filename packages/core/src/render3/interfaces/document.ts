/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {RuntimeError, RuntimeErrorCode} from '../../errors';

/**
 * Most of the use of `document` in Angular is from within the DI system so it is possible to simply
 * inject the `DOCUMENT` token and are done.
 *
 * Ivy is special because it does not rely upon the DI and must get hold of the document some other
 * way.
 *
 * The solution is to define `getDocument()` and `setDocument()` top-level functions for ivy.
 * Wherever ivy needs the global document, it calls `getDocument()` instead.
 *
 * When running ivy outside of a browser environment, it is necessary to call `setDocument()` to
 * tell ivy what the global `document` is.
 *
 * Angular does this for us in each of the standard platforms (`Browser` and `Server`)
 * by calling `setDocument()` when providing the `DOCUMENT` token.
 */
let DOCUMENT: Document | undefined = undefined;

/**
 * Tell ivy what the `document` is for this platform.
 *
 * It is only necessary to call this if the current platform is not a browser.
 *
 * @param document The object representing the global `document` in this environment.
 */
export function setDocument(document: Document | undefined): void {
  DOCUMENT = document;
}

/**
 * Access the object that represents the `document` for this platform.
 *
 * Ivy calls this whenever it needs to access the `document` object.
 * For example to create the renderer or to do sanitization.
 */
export function getDocument(): Document {
  if (DOCUMENT !== undefined) {
    return DOCUMENT;
  } else if (typeof document !== 'undefined') {
    return document;
  }

  throw new RuntimeError(
    RuntimeErrorCode.MISSING_DOCUMENT,
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      `The document object is not available in this context. Make sure the DOCUMENT injection token is provided.`,
  );

  // No "document" can be found. This should only happen if we are running ivy outside Angular and
  // the current platform is not a browser. Since this is not a supported scenario at the moment
  // this should not happen in Angular apps.
  // Once we support running ivy outside of Angular we will need to publish `setDocument()` as a
  // public API.
}
