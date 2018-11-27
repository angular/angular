/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Injector} from '../di/injector';

import {assertDefined} from './assert';
import {discoverLocalRefs, getComponentAtNodeIndex, getContext, getDirectivesAtNodeIndex} from './context_discovery';
import {LContext} from './interfaces/context';
import {TElementNode} from './interfaces/node';
import {CONTEXT, FLAGS, HOST, LViewData, LViewFlags, PARENT, RootContext, TVIEW} from './interfaces/view';
import {readPatchedLViewData, stringify} from './util';
import {NodeInjector} from './view_engine_compatibility';


/**
 * Returns the component instance associated with a given DOM host element.
 * Elements which don't represent components return `null`.
 *
 * @param element Host DOM element from which the component should be retrieved for.
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
  if (!(element instanceof Node)) throw new Error('Expecting instance of DOM Node');

  const context = loadContext(element) !;

  if (context.component === undefined) {
    context.component = getComponentAtNodeIndex(context.nodeIndex, context.lViewData);
  }

  return context.component as T;
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
  const context = loadContext(element) !;
  let lView: LViewData = context.lViewData;
  while (lView[PARENT] && lView[HOST] === null) {
    // As long as lView[HOST] is null we know we are part of sub-template such as `*ngIf`
    lView = lView[PARENT] !;
  }

  return lView[FLAGS] & LViewFlags.IsRoot ? null : lView[CONTEXT] as T;
}



/**
 * Returns the `RootContext` instance that is associated with
 * the application where the target is situated.
 *
 */
export function getRootContext(target: LViewData | {}): RootContext {
  const lViewData = Array.isArray(target) ? target : loadContext(target) !.lViewData;
  const rootLViewData = getRootView(lViewData);
  return rootLViewData[CONTEXT] as RootContext;
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
  const context = loadContext(target);
  const tNode = context.lViewData[TVIEW].data[context.nodeIndex] as TElementNode;

  return new NodeInjector(tNode, context.lViewData);
}

/**
 * Retrieves directives associated with a given DOM host element.
 *
 * @param target A DOM element, component or directive instance.
 *
 * @publicApi
 */
export function getDirectives(target: {}): Array<{}> {
  const context = loadContext(target) !;

  if (context.directives === undefined) {
    context.directives = getDirectivesAtNodeIndex(context.nodeIndex, context.lViewData, false);
  }

  return context.directives || [];
}

/**
 * Returns LContext associated with a target passed as an argument.
 * Throws if a given target doesn't have associated LContext.
 *
 */
export function loadContext(target: {}): LContext {
  const context = getContext(target);
  if (!context) {
    throw new Error(
        ngDevMode ? `Unable to find context associated with ${stringify(target)}` :
                    'Invalid ng target');
  }
  return context;
}

/**
 * Retrieve the root view from any component by walking the parent `LViewData` until
 * reaching the root `LViewData`.
 *
 * @param componentOrView any component or view
 *
 */
export function getRootView(componentOrView: LViewData | {}): LViewData {
  let lViewData: LViewData;
  if (Array.isArray(componentOrView)) {
    ngDevMode && assertDefined(componentOrView, 'lViewData');
    lViewData = componentOrView as LViewData;
  } else {
    ngDevMode && assertDefined(componentOrView, 'component');
    lViewData = readPatchedLViewData(componentOrView) !;
  }
  while (lViewData && !(lViewData[FLAGS] & LViewFlags.IsRoot)) {
    lViewData = lViewData[PARENT] !;
  }
  return lViewData;
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
  const context = loadContext(target) !;

  if (context.localRefs === undefined) {
    context.localRefs = discoverLocalRefs(context.lViewData, context.nodeIndex);
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
  return getContext(directive) !.native as never as Element;
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