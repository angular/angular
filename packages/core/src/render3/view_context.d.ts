/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import type { TNode } from './interfaces/node';
import type { LView } from './interfaces/view';
export declare class ViewContext {
    readonly view: LView;
    readonly node: TNode;
    constructor(view: LView, node: TNode);
    /**
     * @internal
     * @nocollapse
     */
    static __NG_ELEMENT_ID__: typeof injectViewContext;
}
export declare function injectViewContext(): ViewContext;
