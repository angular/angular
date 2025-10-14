/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Injector } from '../di/injector';
import { DehydratedContainerView } from '../hydration/interfaces';
import { TNode } from './interfaces/node';
import { LView } from './interfaces/view';
export declare function createAndRenderEmbeddedLView<T>(declarationLView: LView<unknown>, templateTNode: TNode, context: T, options?: {
    injector?: Injector;
    embeddedViewInjector?: Injector;
    dehydratedView?: DehydratedContainerView | null;
}): LView<T>;
/**
 * Returns whether an elements that belong to a view should be
 * inserted into the DOM. For client-only cases, DOM elements are
 * always inserted. For hydration cases, we check whether serialized
 * info is available for a view and the view is not in a "skip hydration"
 * block (in which case view contents was re-created, thus needing insertion).
 */
export declare function shouldAddViewToDom(tNode: TNode, dehydratedView?: DehydratedContainerView | null): boolean;
