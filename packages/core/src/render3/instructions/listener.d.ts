/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import type { EventCallback } from '../../event_delegation_utils';
import { TNode } from '../interfaces/node';
import { GlobalTargetResolver, Renderer } from '../interfaces/renderer';
import { LView, TView } from '../interfaces/view';
/**
 * Adds an event listener to the current node.
 *
 * If an output exists on one of the node's directives, it also subscribes to the output
 * and saves the subscription for later cleanup.
 *
 * @param eventName Name of the event
 * @param listenerFn The function to be called when event emits
 * @param eventTargetResolver Function that returns global target information in case this listener
 * should be attached to a global object like window, document or body
 *
 * @codeGenApi
 */
export declare function ɵɵlistener(eventName: string, listenerFn: EventCallback, eventTargetResolver?: GlobalTargetResolver): typeof ɵɵlistener;
/**
 * Registers a synthetic host listener (e.g. `(@foo.start)`) on a component or directive.
 *
 * This instruction is for compatibility purposes and is designed to ensure that a
 * synthetic host listener (e.g. `@HostListener('@foo.start')`) properly gets rendered
 * in the component's renderer. Normally all host listeners are evaluated with the
 * parent component's renderer, but, in the case of animation @triggers, they need
 * to be evaluated with the sub component's renderer (because that's where the
 * animation triggers are defined).
 *
 * Do not use this instruction as a replacement for `listener`. This instruction
 * only exists to ensure compatibility with the ViewEngine's host binding behavior.
 *
 * @param eventName Name of the event
 * @param listenerFn The function to be called when event emits
 * @param useCapture Whether or not to use capture in event listener
 * @param eventTargetResolver Function that returns global target information in case this listener
 * should be attached to a global object like window, document or body
 *
 * @codeGenApi
 */
export declare function ɵɵsyntheticHostListener(eventName: string, listenerFn: EventCallback): typeof ɵɵsyntheticHostListener;
/**
 * Adds a listener for a DOM event on the current node.
 *
 * @param eventName Name of the event
 * @param listenerFn The function to be called when event emits
 * @param eventTargetResolver Function that returns global target information in case this listener
 * should be attached to a global object like window, document or body
 *
 * @codeGenApi
 */
export declare function ɵɵdomListener(eventName: string, listenerFn: EventCallback, eventTargetResolver?: GlobalTargetResolver): typeof ɵɵdomListener;
export declare function listenerInternal(tView: TView, lView: LView<{} | null>, renderer: Renderer, tNode: TNode, eventName: string, listenerFn: EventCallback, eventTargetResolver?: GlobalTargetResolver): void;
