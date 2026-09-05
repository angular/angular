/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {formatRuntimeError, RuntimeErrorCode} from '../../errors';
import {
  type EventCallback,
  markEventHandledForElement,
  type WrappedEventCallback,
} from '../../event_delegation_utils';
import {TNode, TNodeType} from '../interfaces/node';
import {GlobalTargetResolver, Renderer} from '../interfaces/renderer';
import {CONTEXT, LView, RENDERER, TView} from '../interfaces/view';
import {assertTNodeType} from '../node_assert';
import {getCurrentDirectiveDef, getCurrentTNode, getLView, getTView} from '../state';

import {listenToOutput} from '../view/directive_outputs';
import {executeListenerWithErrorHandling, listenToDomEvent, wrapListener} from '../view/listeners';
import {loadComponentRenderer} from './shared';

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
export function ɵɵlistener(
  eventName: string,
  listenerFn: EventCallback,
  eventTargetResolver?: GlobalTargetResolver,
): typeof ɵɵlistener {
  const lView = getLView<{} | null>();
  const tView = getTView();
  const tNode = getCurrentTNode()!;
  listenerInternal(
    tView,
    lView,
    lView[RENDERER],
    tNode,
    eventName,
    listenerFn,
    eventTargetResolver,
  );
  return ɵɵlistener;
}

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
export function ɵɵsyntheticHostListener(
  eventName: string,
  listenerFn: EventCallback,
): typeof ɵɵsyntheticHostListener {
  const tNode = getCurrentTNode()!;
  const lView = getLView<{} | null>();
  const tView = getTView();
  const currentDef = getCurrentDirectiveDef(tView.data);
  const renderer = loadComponentRenderer(currentDef, tNode, lView);
  listenerInternal(tView, lView, renderer, tNode, eventName, listenerFn);
  return ɵɵsyntheticHostListener;
}

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
export function ɵɵdomListener(
  eventName: string,
  listenerFn: EventCallback,
  eventTargetResolver?: GlobalTargetResolver,
): typeof ɵɵdomListener {
  const lView = getLView<{} | null>();
  const tView = getTView();
  const tNode = getCurrentTNode()!;

  if (tNode.type & TNodeType.AnyRNode || eventTargetResolver) {
    listenToDomEvent(
      tNode,
      tView,
      lView,
      eventTargetResolver,
      lView[RENDERER],
      eventName,
      listenerFn,
      _wrapDomListenerImpl(tNode, lView, listenerFn, eventName),
    );
  }

  return ɵɵdomListener;
}

export function listenerInternal(
  tView: TView,
  lView: LView<{} | null>,
  renderer: Renderer,
  tNode: TNode,
  eventName: string,
  listenerFn: EventCallback,
  eventTargetResolver?: GlobalTargetResolver,
): void {
  ngDevMode && assertTNodeType(tNode, TNodeType.AnyRNode | TNodeType.AnyContainer);

  let processOutputs = true;
  let wrappedListener: WrappedEventCallback | null = null;

  // Adding a native event listener is applicable when:
  // - The corresponding TNode represents a DOM element.
  // - The event target has a resolver (usually resulting in a global object,
  //   such as `window` or `document`).
  if (tNode.type & TNodeType.AnyRNode || eventTargetResolver) {
    wrappedListener ??= _wrapDomListenerImpl(tNode, lView, listenerFn, eventName);
    const hasCoalescedDomEvent = listenToDomEvent(
      tNode,
      tView,
      lView,
      eventTargetResolver,
      renderer,
      eventName,
      listenerFn,
      wrappedListener,
    );

    // Context: https://github.com/angular/angular/pull/30144
    if (hasCoalescedDomEvent) {
      processOutputs = false;
    }
  }

  if (processOutputs) {
    const outputConfig = tNode.outputs?.[eventName];
    const hostDirectiveOutputConfig = tNode.hostDirectiveOutputs?.[eventName];

    if (hostDirectiveOutputConfig && hostDirectiveOutputConfig.length) {
      for (let i = 0; i < hostDirectiveOutputConfig.length; i += 2) {
        const index = hostDirectiveOutputConfig[i] as number;
        const lookupName = hostDirectiveOutputConfig[i + 1] as string;
        wrappedListener ??= wrapListener(tNode, lView, listenerFn);
        listenToOutput(tNode, lView, index, lookupName, eventName, wrappedListener);
      }
    }

    if (outputConfig && outputConfig.length) {
      for (const index of outputConfig) {
        wrappedListener ??= wrapListener(tNode, lView, listenerFn);
        listenToOutput(tNode, lView, index, eventName, eventName, wrappedListener);
      }
    }
  }
}

/** Listeners with this suffix don't schedule change detection */
const SILENT_EVENT_SUFFIX = '.silent';

/**
 * This is a copy of `wrapListener` but without `markViewDirty()`, so the listener itself
 * doesn't schedule change detection. Note that signal writes inside still schedule it,
 * since signals notify the scheduler on their own
 */
function wrapSilentListener(lView: LView, listenerFn: EventCallback): WrappedEventCallback {
  function wrapListenerIn_preventDefault(event: any) {
    const nativeEl = (wrapListenerIn_preventDefault as any).__ngNativeEl__;
    if (nativeEl !== undefined) {
      markEventHandledForElement(event, nativeEl);
    }

    const context = lView[CONTEXT];
    let result = executeListenerWithErrorHandling(lView, context, listenerFn, event);
    let nextListenerFn = (<any>wrapListenerIn_preventDefault).__ngNextListenerFn__;
    while (nextListenerFn) {
      result = executeListenerWithErrorHandling(lView, context, nextListenerFn, event) && result;
      nextListenerFn = (<any>nextListenerFn).__ngNextListenerFn__;
    }

    return result;
  }

  const wrapped = wrapListenerIn_preventDefault as WrappedEventCallback;
  wrapped.__ngOriginalListener__ = listenerFn;
  return wrapped;
}

function wrapDomListenerImpl(
  tNode: TNode,
  lView: LView,
  listenerFn: EventCallback,
  eventName: string,
): WrappedEventCallback {
  if (!eventName.endsWith(SILENT_EVENT_SUFFIX)) {
    if (ngDevMode && eventName.includes(SILENT_EVENT_SUFFIX + '.')) {
      console.warn(
        formatRuntimeError(
          RuntimeErrorCode.MISPLACED_SILENT_EVENT_MODIFIER,
          `"${eventName}": \`.silent\` must be the last modifier, e.g. "keyup.enter.silent". ` +
            `This listener will never fire.`,
        ),
      );
    }
    return wrapListener(tNode, lView, listenerFn);
  }
  const wrapped = wrapSilentListener(lView, listenerFn);
  wrapped.__ngNativeEventName__ = eventName.slice(0, -SILENT_EVENT_SUFFIX.length);
  return wrapped;
}

// Default is just `wrapListener`, the `.silent` code is referenced only from
// `enableSilentListenersImpl()`, so it's tree-shaken if nobody enables it
let _wrapDomListenerImpl: typeof wrapDomListenerImpl = wrapListener;

/** Turns on `.silent` support, called from `provideSilentListeners()` */
export function enableSilentListenersImpl() {
  _wrapDomListenerImpl = wrapDomListenerImpl;
}
