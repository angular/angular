/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { LContainer } from '../interfaces/container';
import { LView } from '../interfaces/view';
/**
 * Retrieve the root view from any component or `LView` by walking the parent `LView` until
 * reaching the root `LView`.
 *
 * @param componentOrLView any component or `LView`
 */
export declare function getRootView<T>(componentOrLView: LView | {}): LView<T>;
/**
 * Returns the context information associated with the application where the target is situated. It
 * does this by walking the parent views until it gets to the root view, then getting the context
 * off of that.
 *
 * @param viewOrComponent the `LView` or component to get the root context for.
 */
export declare function getRootContext<T>(viewOrComponent: LView<T> | {}): T;
/**
 * Gets the first `LContainer` in the LView or `null` if none exists.
 */
export declare function getFirstLContainer(lView: LView): LContainer | null;
/**
 * Gets the next `LContainer` that is a sibling of the given container.
 */
export declare function getNextLContainer(container: LContainer): LContainer | null;
