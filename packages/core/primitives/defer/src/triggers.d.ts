/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/** Currently-registered `viewport` triggers. */
export declare const viewportTriggers: WeakMap<Element, DeferEventEntry>;
/** Names of the events considered as interaction events. */
export declare const interactionEventNames: readonly ["click", "keydown"];
/** Names of the events considered as hover events. */
export declare const hoverEventNames: readonly ["mouseenter", "mouseover", "focusin"];
/** Object keeping track of registered callbacks for a deferred block trigger. */
declare class DeferEventEntry {
    callbacks: Set<VoidFunction>;
    listener: () => void;
}
/**
 * Registers an interaction trigger.
 * @param trigger Element that is the trigger.
 * @param callback Callback to be invoked when the trigger is interacted with.
 * @return cleanup function which removes trigger Element from interactionTriggers map
 * and interaction event listeners from the trigger Element
 */
export declare function onInteraction(trigger: Element, callback: VoidFunction): VoidFunction;
/**
 * Registers a hover trigger.
 * @param trigger Element that is the trigger.
 * @param callback Callback to be invoked when the trigger is hovered over.
 * @return cleanup function which removes trigger element from hoverTriggers map
 * and removes hover interaction event listeners from the trigger element
 */
export declare function onHover(trigger: Element, callback: VoidFunction): VoidFunction;
/**
 * Used to create an IntersectionObserver instance.
 * @return IntersectionObserver that is used by onViewport
 */
export declare function createIntersectionObserver(): IntersectionObserver;
/**
 * Registers a viewport trigger.
 * @param trigger Element that is the trigger.
 * @param callback Callback to be invoked when the trigger comes into the viewport.
 * @param observerFactoryFn Factory function which returns an IntersectionObserver
 * @return cleanup function which removes trigger Element from viewportTriggers map
 * and tells the intersection observer to stop observing trigger Element and set
 * intersectionObserver to null if there are no more Elements to observe
 */
export declare function onViewport(trigger: Element, callback: VoidFunction, observerFactoryFn: () => IntersectionObserver): VoidFunction;
export {};
