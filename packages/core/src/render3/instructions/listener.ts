/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {setActiveConsumer} from '@angular/core/primitives/signals';

import {NotificationSource} from '../../change_detection/scheduling/zoneless_scheduling';
import {assertIndexInRange} from '../../util/assert';
import {TNode, TNodeType} from '../interfaces/node';
import {GlobalTargetResolver, Renderer} from '../interfaces/renderer';
import {RElement, RNode} from '../interfaces/renderer_dom';
import {isComponentHost, isDirectiveHost} from '../interfaces/type_checks';
import {CLEANUP, CONTEXT, LView, RENDERER, TView} from '../interfaces/view';
import {assertTNodeType} from '../node_assert';
import {profiler} from '../profiler';
import {ProfilerEvent} from '../profiler_types';
import {getCurrentDirectiveDef, getCurrentTNode, getLView, getTView} from '../state';
import {
  getComponentLViewByIndex,
  getNativeByTNode,
  getOrCreateLViewCleanup,
  getOrCreateTViewCleanup,
  unwrapRNode,
} from '../util/view_utils';

import {markViewDirty} from './mark_view_dirty';
import {handleError, loadComponentRenderer} from './shared';
import {DirectiveDef} from '../interfaces/definition';
import {getDocument} from '../interfaces/document';

const COMPOSITION_START = 'compositionstart';
const COMPOSITION_END = 'compositionend';

/**
 * Contains a reference to a function that disables event replay feature
 * for server-side rendered applications. This function is overridden with
 * an actual implementation when the event replay feature is enabled via
 * `withEventReplay()` call.
 */
let stashEventListener = (el: RElement, eventName: string, listenerFn: (e?: any) => any) => {};

export function setStashFn(fn: typeof stashEventListener) {
  stashEventListener = fn;
}

/**
 * Adds an event listener to the current node.
 *
 * If an output exists on one of the node's directives, it also subscribes to the output
 * and saves the subscription for later cleanup.
 *
 * @param eventName Name of the event
 * @param listenerFn The function to be called when event emits
 * @param useCapture Whether or not to use capture in event listener - this argument is a reminder
 *     from the Renderer3 infrastructure and should be removed from the instruction arguments
 * @param eventTargetResolver Function that returns global target information in case this listener
 * should be attached to a global object like window, document or body
 *
 * @codeGenApi
 */
export function ɵɵlistener(
  eventName: string,
  listenerFn: (e?: any) => any,
  useCapture?: boolean,
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
  listenerFn: (e?: any) => any,
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
 * A utility function that checks if a given element has already an event handler registered for an
 * event with a specified name. The TView.cleanup data structure is used to find out which events
 * are registered for a given element.
 */
function findExistingListener(
  tView: TView,
  lView: LView,
  eventName: string,
  tNodeIdx: number,
): ((e?: any) => any) | null {
  const tCleanup = tView.cleanup;
  if (tCleanup != null) {
    for (let i = 0; i < tCleanup.length - 1; i += 2) {
      const cleanupEventName = tCleanup[i];
      if (cleanupEventName === eventName && tCleanup[i + 1] === tNodeIdx) {
        // We have found a matching event name on the same node but it might not have been
        // registered yet, so we must explicitly verify entries in the LView cleanup data
        // structures.
        const lCleanup = lView[CLEANUP]!;
        const listenerIdxInLCleanup = tCleanup[i + 2];
        return lCleanup.length > listenerIdxInLCleanup ? lCleanup[listenerIdxInLCleanup] : null;
      }
      // TView.cleanup can have a mix of 4-elements entries (for event handler cleanups) or
      // 2-element entries (for directive and queries destroy hooks). As such we can encounter
      // blocks of 4 or 2 items in the tView.cleanup and this is why we iterate over 2 elements
      // first and jump another 2 elements if we detect listeners cleanup (4 elements). Also check
      // documentation of TView.cleanup for more details of this data structure layout.
      if (typeof cleanupEventName === 'string') {
        i += 2;
      }
    }
  }
  return null;
}

export function listenerInternal(
  tView: TView,
  lView: LView<{} | null>,
  renderer: Renderer,
  tNode: TNode,
  eventName: string,
  listenerFn: (e?: any) => any,
  eventTargetResolver?: GlobalTargetResolver,
): void {
  const isTNodeDirectiveHost = isDirectiveHost(tNode);
  const firstCreatePass = tView.firstCreatePass;
  const tCleanup = firstCreatePass ? getOrCreateTViewCleanup(tView) : null;
  const context = lView[CONTEXT];

  // When the ɵɵlistener instruction was generated and is executed we know that there is either a
  // native listener or a directive output on this element. As such we we know that we will have to
  // register a listener and store its cleanup function on LView.
  const lCleanup = getOrCreateLViewCleanup(lView);

  ngDevMode && assertTNodeType(tNode, TNodeType.AnyRNode | TNodeType.AnyContainer);

  let processOutputs = true;

  // Adding a native event listener is applicable when:
  // - The corresponding TNode represents a DOM element.
  // - The event target has a resolver (usually resulting in a global object,
  //   such as `window` or `document`).
  if (tNode.type & TNodeType.AnyRNode || eventTargetResolver) {
    // The native element can be a comment node (eg a directive host listener applied on a ng-container)
    const native = getNativeByTNode(tNode, lView);

    // `target` can be an Element but also a non-Element node: `document`.
    const target = (eventTargetResolver?.(native) ?? native) as RElement | RNode;

    // Specific behavior for value two-way binding on an input element.
    const eventMapping = createControlValueChangeEventMapping(target, eventName);
    const eventMapperFn = eventMapping ? eventMapping.mapperFn : null;
    if (eventMapping) {
      eventName = eventMapping.eventName;
    }

    const lCleanupIndex = lCleanup.length;
    const idxOrTargetGetter = eventTargetResolver
      ? (_lView: LView) => eventTargetResolver(unwrapRNode(_lView[tNode.index]))
      : tNode.index;

    // In order to match current behavior, native DOM event listeners must be added for all
    // events (including outputs).

    // There might be cases where multiple directives on the same element try to register an event
    // handler function for the same event. In this situation we want to avoid registration of
    // several native listeners as each registration would be intercepted by NgZone and
    // trigger change detection. This would mean that a single user action would result in several
    // change detections being invoked. To avoid this situation we want to have only one call to
    // native handler registration (for the same element and same type of event).
    //
    // In order to have just one native event handler in presence of multiple handler functions,
    // we just register a first handler function as a native event listener and then chain
    // (coalesce) other handler functions on top of the first native handler function.
    let existingListener = null;
    // Please note that the coalescing described here doesn't happen for events specifying an
    // alternative target (ex. (document:click)) - this is to keep backward compatibility with the
    // view engine.
    // Also, we don't have to search for existing listeners is there are no directives
    // matching on a given node as we can't register multiple event handlers for the same event in
    // a template (this would mean having duplicate attributes).
    if (!eventTargetResolver && isTNodeDirectiveHost) {
      existingListener = findExistingListener(tView, lView, eventName, tNode.index);
    }
    if (existingListener !== null) {
      // Attach a new listener to coalesced listeners list, maintaining the order in which
      // listeners are registered. For performance reasons, we keep a reference to the last
      // listener in that list (in `__ngLastListenerFn__` field), so we can avoid going through
      // the entire set each time we need to add a new listener.
      const lastListenerFn = (<any>existingListener).__ngLastListenerFn__ || existingListener;
      lastListenerFn.__ngNextListenerFn__ = listenerFn;
      (<any>existingListener).__ngLastListenerFn__ = listenerFn;
      processOutputs = false;
    } else {
      listenerFn = wrapListener(tNode, lView, context, listenerFn, eventMapperFn);

      const listenFn = (eventName: string) => {
        // TODO: Fix the event replay part, `native` can be document which is not an Element
        stashEventListener(native as RElement, eventName, listenerFn);
        const cleanupFn = renderer.listen(target, eventName, listenerFn);
        ngDevMode && ngDevMode.rendererAddEventListener++;

        lCleanup.push(listenerFn, cleanupFn);
        tCleanup && tCleanup.push(eventName, idxOrTargetGetter, lCleanupIndex, lCleanupIndex + 1);
      };

      listenFn(eventName);

      // In case we are mapping an input event, we also want to listen for the composition events
      if (eventMapperFn) {
        listenFn(COMPOSITION_START);
        listenFn(COMPOSITION_END);
      }
    }
  } else {
    // Even if there is no native listener to add, we still need to wrap the listener so that OnPush
    // ancestors are marked dirty when an event occurs.
    listenerFn = wrapListener(tNode, lView, context, listenerFn, null);
  }

  if (processOutputs) {
    const outputConfig = tNode.outputs?.[eventName];
    const hostDirectiveOutputConfig = tNode.hostDirectiveOutputs?.[eventName];

    if (hostDirectiveOutputConfig && hostDirectiveOutputConfig.length) {
      for (let i = 0; i < hostDirectiveOutputConfig.length; i += 2) {
        const index = hostDirectiveOutputConfig[i] as number;
        const lookupName = hostDirectiveOutputConfig[i + 1] as string;
        listenToOutput(
          tNode,
          tView,
          lView,
          index,
          lookupName,
          eventName,
          listenerFn,
          lCleanup,
          tCleanup,
        );
      }
    }

    if (outputConfig && outputConfig.length) {
      for (const index of outputConfig) {
        listenToOutput(
          tNode,
          tView,
          lView,
          index,
          eventName,
          eventName,
          listenerFn,
          lCleanup,
          tCleanup,
        );
      }
    }
  }
}

function listenToOutput(
  tNode: TNode,
  tView: TView,
  lView: LView,
  index: number,
  lookupName: string,
  eventName: string,
  listenerFn: (e?: any) => any,
  lCleanup: any[],
  tCleanup: any[] | null,
) {
  ngDevMode && assertIndexInRange(lView, index);
  const instance = lView[index];
  const def = tView.data[index] as DirectiveDef<unknown>;
  const propertyName = def.outputs[lookupName];
  const output = instance[propertyName];

  if (ngDevMode && !isOutputSubscribable(output)) {
    throw new Error(`@Output ${propertyName} not initialized in '${instance.constructor.name}'.`);
  }

  const subscription = (output as SubscribableOutput<unknown>).subscribe(listenerFn);
  const idx = lCleanup.length;
  lCleanup.push(listenerFn, subscription);
  tCleanup && tCleanup.push(eventName, tNode.index, idx, -(idx + 1));
}

function executeListenerWithErrorHandling(
  lView: LView,
  context: {} | null,
  listenerFn: (e?: any) => any,
  e: any,
): boolean {
  const prevConsumer = setActiveConsumer(null);
  try {
    profiler(ProfilerEvent.OutputStart, context, listenerFn);
    // Only explicitly returning false from a listener should preventDefault
    return listenerFn(e) !== false;
  } catch (error) {
    handleError(lView, error);
    return false;
  } finally {
    profiler(ProfilerEvent.OutputEnd, context, listenerFn);
    setActiveConsumer(prevConsumer);
  }
}

/**
 * Wraps an event listener with a function that marks ancestors dirty and prevents default behavior,
 * if applicable.
 *
 * @param tNode The TNode associated with this listener
 * @param lView The LView that contains this listener
 * @param listenerFn The listener function to call
 * @param wrapWithPreventDefault Whether or not to prevent default behavior
 * (the procedural renderer does this already, so in those cases, we should skip)
 */
function wrapListener(
  tNode: TNode,
  lView: LView<{} | null>,
  context: {} | null,
  listenerFn: (e?: any) => any,
  inputEventMapperFn: ((e: Event) => any) | null,
): EventListener {
  // Note: we are performing most of the work in the listener function itself
  // to optimize listener registration.
  return function wrapListenerIn_markDirtyAndPreventDefault(e: any) {
    // Ivy uses `Function` as a special token that allows us to unwrap the function
    // so that it can be invoked programmatically by `DebugNode.triggerEventHandler`.
    if (e === Function) {
      return listenerFn;
    }

    // Mapping the `input` event to the control's value
    if (inputEventMapperFn) {
      e = inputEventMapperFn(e);
      // The event is now the control's value
    }

    // In order to be backwards compatible with View Engine, events on component host nodes
    // must also mark the component view itself dirty (i.e. the view that it owns).
    const startView = isComponentHost(tNode) ? getComponentLViewByIndex(tNode.index, lView) : lView;
    markViewDirty(startView, NotificationSource.Listener);

    // Some events might be skipped (e.g. composition events)
    let result =
      e !== SKIP_EVENT ? executeListenerWithErrorHandling(lView, context, listenerFn, e) : false;

    // A just-invoked listener function might have coalesced listeners so we need to check for
    // their presence and invoke as needed.
    let nextListenerFn = (<any>wrapListenerIn_markDirtyAndPreventDefault).__ngNextListenerFn__;
    while (nextListenerFn) {
      // We should prevent default if any of the listeners explicitly return false
      result = executeListenerWithErrorHandling(lView, context, nextListenerFn, e) && result;
      nextListenerFn = (<any>nextListenerFn).__ngNextListenerFn__;
    }

    return result;
  };
}

const SUPPORTED_CONTROLS = ['INPUT', 'SELECT', 'TEXTAREA'];

const INPUT_EVENT = 'input';

const VALUE_CHANGE_EVENT = 'valueChange';
const VALUE_AS_NUMBER_CHANGE_EVENT = 'valueAsNumberChange';
const VALUE_AS_DATE_CHANGE_EVENT = 'valueAsDateChange';
const CHECKED_CHANGE_EVENT = 'checkedChange';
const FILES_CHANGE_EVENT = 'filesChange';

// Dummy object to indicate that no synthetic change event should be emitted
const SKIP_EVENT = typeof ngDevMode === 'undefined' || ngDevMode ? {__brand__: 'SKIP_EVENT'} : {};

/**
 * For specific control elements (like `input`, `select`, `textarea`) we want to emit a synthetic change event.
 *
 * valueChange/valueAsNumberChange/valueAsDateChange/checkedChange/filesChange are the synthetic events
 * that are emitted when the value/checked/files property changes.
 *
 * Returns null when no synthetic event should be emitted.
 */
function createControlValueChangeEventMapping(
  nativeElement: RElement | RNode,
  eventName: string,
): {mapperFn: (e: Event) => unknown; eventName: string} | null {
  if (!('tagName' in nativeElement)) {
    // Document or Window node
    return null;
  }

  const tagName = nativeElement.tagName.toUpperCase();

  if (!SUPPORTED_CONTROLS.includes(tagName)) {
    //We don't support emitting input change events for other DOM elements
    return null;
  }

  const isOneOfSupportedChangeEvents = [
    VALUE_CHANGE_EVENT,
    VALUE_AS_NUMBER_CHANGE_EVENT,
    VALUE_AS_DATE_CHANGE_EVENT,
    CHECKED_CHANGE_EVENT,
    FILES_CHANGE_EVENT,
  ].includes(eventName);

  if (!isOneOfSupportedChangeEvents) {
    return null;
  }

  /** Whether the user is creating a composed string (via IME events). */
  let isComposing = false;

  return {
    mapperFn: (e) => {
      // In composition mode we don't want to emit the synthetic event
      // We wait until the 'compositionend' event to emit the synthetic event again
      if (e.type === COMPOSITION_START) {
        isComposing = true;
        return SKIP_EVENT;
      }
      if (isComposing && e.type !== COMPOSITION_END) {
        return SKIP_EVENT;
      }

      if (e.type === COMPOSITION_END) {
        isComposing = false;
        // No early return, we want to emit the synthetic event
      }

      const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

      if (ngDevMode && !SUPPORTED_CONTROLS.includes(target?.tagName!)) {
        throw new Error(`Target ${target} is not supported for value 2-way binding`);
      }

      if (target?.tagName === 'INPUT') {
        const input = target as HTMLInputElement;

        // We need to synthesize input events for all the other radio buttons within the same group
        // in order to update their binded value.
        const type = target.type;
        if (type === 'radio') {
          [
            // This only works on browsers (in node tests this returns an empty array)
            ...getDocument().querySelectorAll(`input[type="radio"][name="${input.name}"]`),
          ].forEach((radio) => {
            if (radio != input) {
              radio.dispatchEvent(new Event(INPUT_EVENT));
            }
          });
        }

        switch (eventName) {
          case CHECKED_CHANGE_EVENT:
            return input.checked;

          case VALUE_AS_NUMBER_CHANGE_EVENT:
            // By spec, the runtime throws if the type is not a valid "date- or time-based nor numeric" type (number, range, date, time, datetime, datetime-local)
            // Thus "type=text" throws at runtime
            // https://html.spec.whatwg.org/multipage/input.html#common-input-element-apis
            return input.valueAsNumber;

          case VALUE_AS_DATE_CHANGE_EVENT:
            // By spec, the runtime throws if the type is not a valid "date" type (date, time, datetime, datetime-local)
            // https://html.spec.whatwg.org/multipage/input.html#common-input-element-apis
            return input.valueAsDate;

          case FILES_CHANGE_EVENT:
            // By spec, the runtime throws if the type is not a valid "file" type (date, time, datetime, datetime-local)
            return input.files;

          // Explicit break so we can throw on unsupported change events
          case VALUE_CHANGE_EVENT:
            break;

          default:
            // TODO: RuntimeError
            throw new Error(`Unsupported input event: ${eventName} for ${input.tagName}`);
          // In the future we might want to support valueAsTemporal
          // https://github.com/tc39/proposal-temporal/issues/3075
          // https://github.com/whatwg/html/issues/10882
        }
      }

      return target.value;
    },
    eventName: INPUT_EVENT,
  };
}

/** Describes a subscribable output field value. */
interface SubscribableOutput<T> {
  subscribe(listener: (v: T) => void): {unsubscribe: () => void};
}

/**
 * Whether the given value represents a subscribable output.
 *
 * For example, an `EventEmitter, a `Subject`, an `Observable` or an
 * `OutputEmitter`.
 */
function isOutputSubscribable(value: unknown): value is SubscribableOutput<unknown> {
  return (
    value != null && typeof (value as Partial<SubscribableOutput<unknown>>).subscribe === 'function'
  );
}
