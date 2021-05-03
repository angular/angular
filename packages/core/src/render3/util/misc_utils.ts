/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {global} from '../../util/global';
import {RElement} from '../interfaces/renderer_dom';


export const defaultScheduler =
    (() => (
               typeof requestAnimationFrame !== 'undefined' &&
                   requestAnimationFrame ||  // browser only
               setTimeout                    // everything else
               )
               .bind(global))();

/**
 *
 * @codeGenApi
 */
export function ɵɵresolveWindow(element: RElement&{ownerDocument: Document}) {
  return element.ownerDocument.defaultView;
}

/**
 *
 * @codeGenApi
 */
export function ɵɵresolveDocument(element: RElement&{ownerDocument: Document}) {
  return element.ownerDocument;
}

/**
 *
 * @codeGenApi
 */
export function ɵɵresolveBody(element: RElement&{ownerDocument: Document}) {
  return element.ownerDocument.body;
}

/**
 * The special delimiter we use to separate property names, prefixes, and suffixes
 * in property binding metadata. See storeBindingMetadata().
 *
 * We intentionally use the Unicode "REPLACEMENT CHARACTER" (U+FFFD) as a delimiter
 * because it is a very uncommon character that is unlikely to be part of a user's
 * property names or interpolation strings. If it is in fact used in a property
 * binding, DebugElement.properties will not return the correct value for that
 * binding. However, there should be no runtime effect for real applications.
 *
 * This character is typically rendered as a question mark inside of a diamond.
 * See https://en.wikipedia.org/wiki/Specials_(Unicode_block)
 *
 */
export const INTERPOLATION_DELIMITER = `�`;

/**
 * Unwrap a value which might be behind a closure (for forward declaration reasons).
 */
export function maybeUnwrapFn<T>(value: T|(() => T)): T {
  if (value instanceof Function) {
    return value();
  } else {
    return value;
  }
}
