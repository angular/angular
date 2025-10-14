/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { TNode } from '../render3/interfaces/node';
import { LView } from '../render3/interfaces/view';
/**
 * Creates an ElementRef from the most recent node.
 *
 * @returns The ElementRef instance to use
 */
export declare function injectElementRef(): ElementRef;
/**
 * Creates an ElementRef given a node.
 *
 * @param tNode The node for which you'd like an ElementRef
 * @param lView The view to which the node belongs
 * @returns The ElementRef instance to use
 */
export declare function createElementRef(tNode: TNode, lView: LView): ElementRef;
/**
 * A wrapper around a native element inside of a View.
 *
 * An `ElementRef` is backed by a render-specific element. In the browser, this is usually a DOM
 * element.
 *
 * @security Permitting direct access to the DOM can make your application more vulnerable to
 * XSS attacks. Carefully review any use of `ElementRef` in your code. For more detail, see the
 * [Security Guide](https://g.co/ng/security).
 *
 * @publicApi
 */
export declare class ElementRef<T = any> {
    /**
     * <div class="docs-alert docs-alert-important">
     *   <header>Use with caution</header>
     *   <p>
     *    Use this API as the last resort when direct access to DOM is needed. Use templating and
     *    data-binding provided by Angular instead. If used, it is recommended in combination with
     *    {@link /best-practices/security#direct-use-of-the-dom-apis-and-explicit-sanitization-calls DomSanitizer}
     *    for maxiumum security;
     *   </p>
     * </div>
     */
    nativeElement: T;
    constructor(nativeElement: T);
    /**
     * @internal
     * @nocollapse
     */
    static __NG_ELEMENT_ID__: () => ElementRef;
}
/**
 * Unwraps `ElementRef` and return the `nativeElement`.
 *
 * @param value value to unwrap
 * @returns `nativeElement` if `ElementRef` otherwise returns value as is.
 */
export declare function unwrapElementRef<T, R>(value: T | ElementRef<R>): T | R;
