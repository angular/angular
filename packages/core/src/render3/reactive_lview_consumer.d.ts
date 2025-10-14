/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ReactiveNode } from '../../primitives/signals';
import { LView, TView } from './interfaces/view';
export interface ReactiveLViewConsumer extends ReactiveNode {
    lView: LView | null;
}
/**
 * Create a new template consumer pointing at the specified LView.
 * Sometimes, a previously created consumer may be reused, in order to save on allocations. In that
 * case, the LView will be updated.
 */
export declare function getOrBorrowReactiveLViewConsumer(lView: LView): ReactiveLViewConsumer;
export declare function maybeReturnReactiveLViewConsumer(consumer: ReactiveLViewConsumer): void;
export declare const REACTIVE_LVIEW_CONSUMER_NODE: Omit<ReactiveLViewConsumer, 'lView'>;
/**
 * Creates a temporary consumer for use with `LView`s that should not have consumers.
 * If the LView already has a consumer, returns the existing one instead.
 *
 * This is necessary because some APIs may cause change detection directly on an LView
 * that we do not want to have a consumer (Embedded views today). As a result, there
 * would be no active consumer from running change detection on its host component
 * and any signals in the LView template would be untracked. Instead, we create
 * this temporary consumer that marks the first parent that _should_ have a consumer
 * for refresh. Once change detection runs as part of that refresh, we throw away
 * this consumer because its signals will then be tracked by the parent's consumer.
 */
export declare function getOrCreateTemporaryConsumer(lView: LView): ReactiveLViewConsumer;
export declare const TEMPORARY_CONSUMER_NODE: ReactiveNode;
/**
 * Indicates if the view should get its own reactive consumer node.
 *
 * In the current design, all embedded views share a consumer with the component view. This allows
 * us to refresh at the component level rather than at a per-view level. In addition, root views get
 * their own reactive node because root component will have a host view that executes the
 * component's host bindings. This needs to be tracked in a consumer as well.
 *
 * To get a more granular change detection than per-component, all we would just need to update the
 * condition here so that a given view gets a reactive consumer which can become dirty independently
 * from its parent component. For example embedded views for signal components could be created with
 * a new type "SignalEmbeddedView" and the condition here wouldn't even need updating in order to
 * get granular per-view change detection for signal components.
 */
export declare function viewShouldHaveReactiveConsumer(tView: TView): boolean;
export declare function isReactiveLViewConsumer(node: ReactiveNode): node is ReactiveLViewConsumer;
