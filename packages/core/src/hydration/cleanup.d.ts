/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ApplicationRef } from '../application/application_ref';
import { DehydratedDeferBlock } from '../defer/interfaces';
import { DehydratedBlockRegistry } from '../defer/registry';
import { LContainer } from '../render3/interfaces/container';
/**
 * Removes all dehydrated views from a given LContainer:
 * both in internal data structure, as well as removing
 * corresponding DOM nodes that belong to that dehydrated view.
 */
export declare function removeDehydratedViews(lContainer: LContainer): void;
export declare function removeDehydratedViewList(deferBlock: DehydratedDeferBlock): void;
/**
 * Walks over all views within this LContainer invokes dehydrated views
 * cleanup function for each one.
 */
export declare function cleanupLContainer(lContainer: LContainer): void;
/**
 * Walks over all views registered within the ApplicationRef and removes
 * all dehydrated views from all `LContainer`s along the way.
 */
export declare function cleanupDehydratedViews(appRef: ApplicationRef): void;
/**
 * post hydration cleanup handling for defer blocks that were incrementally
 * hydrated. This removes all the jsaction attributes, timers, observers,
 * dehydrated views and containers
 */
export declare function cleanupHydratedDeferBlocks(deferBlock: DehydratedDeferBlock | null, hydratedBlocks: string[], registry: DehydratedBlockRegistry, appRef: ApplicationRef): void;
