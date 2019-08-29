/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector} from '../../di/injector';
import {assertLView} from '../assert';
import {discoverLocalRefs, getComponentAtNodeIndex, getDirectivesAtNodeIndex, getLContext} from '../context_discovery';
import {NodeInjector} from '../di';
import {LContext} from '../interfaces/context';
import {DirectiveDef} from '../interfaces/definition';
import {TElementNode, TNode, TNodeProviderIndexes} from '../interfaces/node';
import {CLEANUP, CONTEXT, FLAGS, HOST, LView, LViewFlags, TVIEW} from '../interfaces/view';

import {stringifyForError} from './misc_utils';
import {getLViewParent, getRootContext} from './view_traversal_utils';
import {unwrapRNode} from './view_utils';



/**
 * Returns the component instance associated with a given DOM host element.
 * Elements which don't represent components return `null`.
 *
 * @param element Host DOM element from which the component should be retrieved.
 *
 * ```
 * <my-app>
 *   #VIEW
 *     <div>
 *       <child-comp></child-comp>
 *     </div>
 * </mp-app>
 *
 * expect(getComponent(<child-comp>) instanceof ChildComponent).toBeTruthy();
 * expect(getComponent(<my-app>) instanceof MyApp).toBeTruthy();
 * ```
 *
 * @publicApi
 */
export function getComponent<T = {}>(element: Element): T|null {
  const context = loadLContextFromNode(element);

  if (context.component === undefined) {
    context.component = getComponentAtNodeIndex(context.nodeIndex, context.lView);
  }

  return context.component as T;
}

/**
 * Returns the component instance associated with a given DOM host element.
 * Elements which don't represent components return `null`.
 *
 * @param element Host DOM element from which the component should be retrieved.
 *
 * ```
 * <my-app>
 *   #VIEW
 *     <div>
 *       <child-comp></child-comp>
 *     </div>
 * </mp-app>
 *
 * expect(getComponent(<child-comp>) instanceof ChildComponent).toBeTruthy();
 * expect(getComponent(<my-app>) instanceof MyApp).toBeTruthy();
 * ```
 *
 * @publicApi
 */
export function getContext<T = {}>(element: Element): T|null {
  const context = loadLContextFromNode(element) !;
  return context.lView[CONTEXT] as T;
}

/**
 * Returns the component instance associated with view which owns the DOM element (`null`
 * otherwise).
 *
 * @param element DOM element which is owned by an existing component's view.
 *
 * ```
 * <my-app>
 *   #VIEW
 *     <div>
 *       <child-comp></child-comp>
 *     </div>
 * </mp-app>
 *
 * expect(getViewComponent(<child-comp>) instanceof MyApp).toBeTruthy();
 * expect(getViewComponent(<my-app>)).toEqual(null);
 * ```
 *
 * @publicApi
 */
export function getViewComponent<T = {}>(element: Element | {}): T|null {
  const context = loadLContext(element) !;
  let lView = context.lView;
  let parent: LView|null;
  ngDevMode && assertLView(lView);
  while (lView[HOST] === null && (parent = getLViewParent(lView) !)) {
    // As long as lView[HOST] is null we know we are part of sub-template such as `*ngIf`
    lView = parent;
  }
  return lView[FLAGS] & LViewFlags.IsRoot ? null : lView[CONTEXT] as T;
}

/**
 * Retrieve all root components.
 *
 * Root components are those which have been bootstrapped by Angular.
 *
 * @param target A DOM element, component or directive instance.
 *
 * @publicApi
 */
export function getRootComponents(target: {}): any[] {
  return [...getRootContext(target).components];
}

/**
 * Retrieves an `Injector` associated with the element, component or directive.
 *
 * @param target A DOM element, component or directive instance.
 *
 * @publicApi
 */
export function getInjector(target: {}): Injector {
  const context = loadLContext(target);
  const tNode = context.lView[TVIEW].data[context.nodeIndex] as TElementNode;
  return new NodeInjector(tNode, context.lView);
}

/**
 * Retrieve a set of injection tokens at a given DOM node.
 *
 * @param element Element for which the injection tokens should be retrieved.
 * @publicApi
 */
export function getInjectionTokens(element: Element): any[] {
  const context = loadLContext(element, false);
  if (!context) return [];
  const lView = context.lView;
  const tView = lView[TVIEW];
  const tNode = tView.data[context.nodeIndex] as TNode;
  const providerTokens: any[] = [];
  const startIndex = tNode.providerIndexes & TNodeProviderIndexes.ProvidersStartIndexMask;
  const endIndex = tNode.directiveEnd;
  for (let i = startIndex; i < endIndex; i++) {
    let value = tView.data[i];
    if (isDirectiveDefHack(value)) {
      // The fact that we sometimes store Type and sometimes DirectiveDef in this location is a
      // design flaw.  We should always store same type so that we can be monomorphic. The issue
      // is that for Components/Directives we store the def instead the type. The correct behavior
      // is that we should always be storing injectable type in this location.
      value = value.type;
    }
    providerTokens.push(value);
  }
  return providerTokens;
}

/**
 * Retrieves directives associated with a given DOM host element.
 *
 * @param target A DOM element, component or directive instance.
 *
 * @publicApi
 */
export function getDirectives(target: {}): Array<{}> {
  const context = loadLContext(target) !;

  if (context.directives === undefined) {
    context.directives = getDirectivesAtNodeIndex(context.nodeIndex, context.lView, false);
  }

  return context.directives || [];
}

/**
 * Returns LContext associated with a target passed as an argument.
 * Throws if a given target doesn't have associated LContext.
 *
 */
export function loadLContext(target: {}): LContext;
export function loadLContext(target: {}, throwOnNotFound: false): LContext|null;
export function loadLContext(target: {}, throwOnNotFound: boolean = true): LContext|null {
  const context = getLContext(target);
  if (!context && throwOnNotFound) {
    throw new Error(
        ngDevMode ? `Unable to find context associated with ${stringifyForError(target)}` :
                    'Invalid ng target');
  }
  return context;
}

/**
 * Retrieve map of local references.
 *
 * The references are retrieved as a map of local reference name to element or directive instance.
 *
 * @param target A DOM element, component or directive instance.
 *
 * @publicApi
 */
export function getLocalRefs(target: {}): {[key: string]: any} {
  const context = loadLContext(target) !;

  if (context.localRefs === undefined) {
    context.localRefs = discoverLocalRefs(context.lView, context.nodeIndex);
  }

  return context.localRefs || {};
}

/**
 * Retrieve the host element of the component.
 *
 * Use this function to retrieve the host element of the component. The host
 * element is the element which the component is associated with.
 *
 * @param directive Component or Directive for which the host element should be retrieved.
 *
 * @publicApi
 */
export function getHostElement<T>(directive: T): Element {
  return getLContext(directive) !.native as never as Element;
}

/**
 * Retrieves the rendered text for a given component.
 *
 * This function retrieves the host element of a component and
 * and then returns the `textContent` for that element. This implies
 * that the text returned will include re-projected content of
 * the component as well.
 *
 * @param component The component to return the content text for.
 */
export function getRenderedText(component: any): string {
  const hostElement = getHostElement(component);
  return hostElement.textContent || '';
}

export function loadLContextFromNode(node: Node): LContext {
  if (!(node instanceof Node)) throw new Error('Expecting instance of DOM Node');
  return loadLContext(node) !;
}

export interface Listener {
  name: string;
  element: Element;
  callback: (value: any) => any;
  useCapture: boolean|null;
}

export function isBrowserEvents(listener: Listener): boolean {
  // Browser events are those which don't have `useCapture` as boolean.
  return typeof listener.useCapture === 'boolean';
}


/**
 * Retrieves a list of DOM listeners.
 *
 * ```
 * <my-app>
 *   #VIEW
 *     <div (click)="doSomething()">
 *     </div>
 * </mp-app>
 *
 * expect(getListeners(<div>)).toEqual({
 *   name: 'click',
 *   element: <div>,
 *   callback: () => doSomething(),
 *   useCapture: false
 * });
 * ```
 *
 * @param element Element for which the DOM listeners should be retrieved.
 * @publicApi
 */
export function getListeners(element: Element): Listener[] {
  const lContext = loadLContextFromNode(element);
  const lView = lContext.lView;
  const tView = lView[TVIEW];
  const lCleanup = lView[CLEANUP];
  const tCleanup = tView.cleanup;
  const listeners: Listener[] = [];
  if (tCleanup && lCleanup) {
    for (let i = 0; i < tCleanup.length;) {
      const firstParam = tCleanup[i++];
      const secondParam = tCleanup[i++];
      if (typeof firstParam === 'string') {
        const name: string = firstParam;
        const listenerElement = unwrapRNode(lView[secondParam]) as any as Element;
        const callback: (value: any) => any = lCleanup[tCleanup[i++]];
        const useCaptureOrIndx = tCleanup[i++];
        // if useCaptureOrIndx is boolean then report it as is.
        // if useCaptureOrIndx is positive number then it in unsubscribe method
        // if useCaptureOrIndx is negative number then it is a Subscription
        const useCapture = typeof useCaptureOrIndx === 'boolean' ?
            useCaptureOrIndx :
            (useCaptureOrIndx >= 0 ? false : null);
        if (element == listenerElement) {
          listeners.push({element, name, callback, useCapture});
        }
      }
    }
  }
  listeners.sort(sortListeners);
  return listeners;
}

function sortListeners(a: Listener, b: Listener) {
  if (a.name == b.name) return 0;
  return a.name < b.name ? -1 : 1;
}

/**
 * This function should not exist because it is megamorphic and only mostly correct.
 *
 * See call site for more info.
 */
function isDirectiveDefHack(obj: any): obj is DirectiveDef<any> {
  return obj.type !== undefined && obj.template !== undefined && obj.declaredInputs !== undefined;
}
