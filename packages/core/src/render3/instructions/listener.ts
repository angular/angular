/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {assertDataInRange} from '../../util/assert';
import {isObservable} from '../../util/lang';
import {PropertyAliasValue, TNode, TNodeFlags, TNodeType} from '../interfaces/node';
import {GlobalTargetResolver, RElement, Renderer3, isProceduralRenderer} from '../interfaces/renderer';
import {FLAGS, LView, LViewFlags, RENDERER, TVIEW} from '../interfaces/view';
import {assertNodeOfPossibleTypes} from '../node_assert';
import {getLView, getPreviousOrParentTNode} from '../state';
import {getComponentViewByIndex, getNativeByTNode, unwrapRNode} from '../util/view_utils';
import {BindingDirection, generatePropertyAliases, getCleanup, handleError, loadComponentRenderer, markViewDirty} from './shared';

/**
 * Adds an event listener to the current node.
 *
 * If an output exists on one of the node's directives, it also subscribes to the output
 * and saves the subscription for later cleanup.
 *
 * @param eventName Name of the event
 * @param listenerFn The function to be called when event emits
 * @param useCapture Whether or not to use capture in event listener
 * @param eventTargetResolver Function that returns global target information in case this listener
 * should be attached to a global object like window, document or body
 *
 * @publicApi
 */
export function Δlistener(
    eventName: string, listenerFn: (e?: any) => any, useCapture = false,
    eventTargetResolver?: GlobalTargetResolver): void {
  listenerInternal(eventName, listenerFn, useCapture, eventTargetResolver);
}

/**
* Registers a synthetic host listener (e.g. `(@foo.start)`) on a component.
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
 * @publicApi
*/
export function ΔcomponentHostSyntheticListener<T>(
    eventName: string, listenerFn: (e?: any) => any, useCapture = false,
    eventTargetResolver?: GlobalTargetResolver): void {
  listenerInternal(eventName, listenerFn, useCapture, eventTargetResolver, loadComponentRenderer);
}

function listenerInternal(
    eventName: string, listenerFn: (e?: any) => any, useCapture = false,
    eventTargetResolver?: GlobalTargetResolver,
    loadRendererFn?: ((tNode: TNode, lView: LView) => Renderer3) | null): void {
  const lView = getLView();
  const tNode = getPreviousOrParentTNode();
  const tView = lView[TVIEW];
  const firstTemplatePass = tView.firstTemplatePass;
  const tCleanup: false|any[] = firstTemplatePass && (tView.cleanup || (tView.cleanup = []));

  ngDevMode && assertNodeOfPossibleTypes(
                   tNode, TNodeType.Element, TNodeType.Container, TNodeType.ElementContainer);

  // add native event listener - applicable to elements only
  if (tNode.type === TNodeType.Element) {
    const native = getNativeByTNode(tNode, lView) as RElement;
    const resolved = eventTargetResolver ? eventTargetResolver(native) : {} as any;
    const target = resolved.target || native;
    ngDevMode && ngDevMode.rendererAddEventListener++;
    const renderer = loadRendererFn ? loadRendererFn(tNode, lView) : lView[RENDERER];
    const lCleanup = getCleanup(lView);
    const lCleanupIndex = lCleanup.length;
    let useCaptureOrSubIdx: boolean|number = useCapture;

    // In order to match current behavior, native DOM event listeners must be added for all
    // events (including outputs).
    if (isProceduralRenderer(renderer)) {
      // The first argument of `listen` function in Procedural Renderer is:
      // - either a target name (as a string) in case of global target (window, document, body)
      // - or element reference (in all other cases)
      listenerFn = wrapListener(tNode, lView, listenerFn, false /** preventDefault */);
      const cleanupFn = renderer.listen(resolved.name || target, eventName, listenerFn);
      lCleanup.push(listenerFn, cleanupFn);
      useCaptureOrSubIdx = lCleanupIndex + 1;
    } else {
      listenerFn = wrapListener(tNode, lView, listenerFn, true /** preventDefault */);
      target.addEventListener(eventName, listenerFn, useCapture);
      lCleanup.push(listenerFn);
    }

    const idxOrTargetGetter = eventTargetResolver ?
        (_lView: LView) => eventTargetResolver(unwrapRNode(_lView[tNode.index])).target :
        tNode.index;
    tCleanup && tCleanup.push(eventName, idxOrTargetGetter, lCleanupIndex, useCaptureOrSubIdx);
  }

  // subscribe to directive outputs
  if (tNode.outputs === undefined) {
    // if we create TNode here, inputs must be undefined so we know they still need to be
    // checked
    tNode.outputs = generatePropertyAliases(tNode, BindingDirection.Output);
  }

  const outputs = tNode.outputs;
  let props: PropertyAliasValue|undefined;
  if (outputs && (props = outputs[eventName])) {
    const propsLength = props.length;
    if (propsLength) {
      const lCleanup = getCleanup(lView);
      for (let i = 0; i < propsLength; i += 3) {
        const index = props[i] as number;
        ngDevMode && assertDataInRange(lView, index);
        const minifiedName = props[i + 2];
        const directiveInstance = lView[index];
        const output = directiveInstance[minifiedName];

        if (ngDevMode && !isObservable(output)) {
          throw new Error(
              `@Output ${minifiedName} not initialized in '${directiveInstance.constructor.name}'.`);
        }

        const subscription = output.subscribe(listenerFn);
        const idx = lCleanup.length;
        lCleanup.push(listenerFn, subscription);
        tCleanup && tCleanup.push(eventName, tNode.index, idx, -(idx + 1));
      }
    }
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
    tNode: TNode, lView: LView, listenerFn: (e?: any) => any,
    wrapWithPreventDefault: boolean): EventListener {
  // Note: we are performing most of the work in the listener function itself
  // to optimize listener registration.
  return function wrapListenerIn_markDirtyAndPreventDefault(e: Event) {
    // In order to be backwards compatible with View Engine, events on component host nodes
    // must also mark the component view itself dirty (i.e. the view that it owns).
    const startView =
        tNode.flags & TNodeFlags.isComponent ? getComponentViewByIndex(tNode.index, lView) : lView;

    // See interfaces/view.ts for more on LViewFlags.ManualOnPush
    if ((lView[FLAGS] & LViewFlags.ManualOnPush) === 0) {
      markViewDirty(startView);
    }

    try {
      const result = listenerFn(e);
      if (wrapWithPreventDefault && result === false) {
        e.preventDefault();
        // Necessary for legacy browsers that don't support preventDefault (e.g. IE)
        e.returnValue = false;
      }
      return result;
    } catch (error) {
      handleError(lView, error);
    }
  };
}
