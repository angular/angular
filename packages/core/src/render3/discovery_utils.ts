/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Injector} from '../di/injector';

import {assertDefined} from './assert';
import {discoverDirectives, discoverLocalRefs, getContext, isComponentInstance} from './context_discovery';
import {LContext} from './interfaces/context';
import {TElementNode, TNode, TNodeFlags} from './interfaces/node';
import {CONTEXT, FLAGS, LViewData, LViewFlags, PARENT, RootContext, TVIEW} from './interfaces/view';
import {getComponentViewByIndex, readPatchedLViewData} from './util';
import {NodeInjector} from './view_engine_compatibility';



/**
 * NOTE: The following functions might not be ideal for core usage in Angular...
 *
 * Each function below is designed
 */

/**
 * Returns the component instance associated with the target.
 *
 * If a DOM is used then it will return the component that
 *    owns the view where the element is situated.
 * If a component instance is used then it will return the
 *    instance of the parent component depending on where
 *    the component instance is exists in a template.
 * If a directive instance is used then it will return the
 *    component that contains that directive in it's template.
 *
 * @publicApi
 */
export function getComponent<T = {}>(target: {}): T|null {
  const context = loadContext(target) !;

  if (context.component === undefined) {
    let lViewData: LViewData|null = context.lViewData;
    while (lViewData) {
      const ctx = lViewData ![CONTEXT] !as{};
      if (ctx && isComponentInstance(ctx)) {
        context.component = ctx;
        break;
      }
      lViewData = lViewData[FLAGS] & LViewFlags.IsRoot ? null : lViewData ![PARENT] !;
    }
    if (context.component === undefined) {
      context.component = null;
    }
  }

  return context.component as T;
}

/**
 * Returns the host component instance associated with the target.
 *
 * This will only return a component instance of the DOM node
 * contains an instance of a component on it.
 *
 * @publicApi
 */
export function getHostComponent<T = {}>(target: {}): T|null {
  const context = loadContext(target);
  const tNode = context.lViewData[TVIEW].data[context.nodeIndex] as TNode;
  if (tNode.flags & TNodeFlags.isComponent) {
    const componentView = getComponentViewByIndex(context.nodeIndex, context.lViewData);
    return componentView[CONTEXT] as any as T;
  }
  return null;
}

/**
 * Returns the `RootContext` instance that is associated with
 * the application where the target is situated.
 *
 * @publicApi
 */
export function getRootContext(target: LViewData | {}): RootContext {
  const lViewData = Array.isArray(target) ? target : loadContext(target) !.lViewData;
  const rootLViewData = getRootView(lViewData);
  return rootLViewData[CONTEXT] as RootContext;
}

/**
 * Returns a list of all the components in the application
 * that are have been bootstrapped.
 *
 * @publicApi
 */
export function getRootComponents(target: {}): any[] {
  return [...getRootContext(target).components];
}

/**
 * Returns the injector instance that is associated with
 * the element, component or directive.
 *
 * @publicApi
 */
export function getInjector(target: {}): Injector {
  const context = loadContext(target);
  const tNode = context.lViewData[TVIEW].data[context.nodeIndex] as TElementNode;

  return new NodeInjector(tNode, context.lViewData);
}

/**
 * Returns a list of all the directives that are associated
 * with the underlying target element.
 *
 * @publicApi
 */
export function getDirectives(target: {}): Array<{}> {
  const context = loadContext(target) !;

  if (context.directives === undefined) {
    context.directives = discoverDirectives(context.nodeIndex, context.lViewData, false);
  }

  return context.directives || [];
}

/**
 * Returns LContext associated with a target passed as an argument.
 * Throws if a given target doesn't have associated LContext.
 *
 * @publicApi
 */
export function loadContext(target: {}): LContext {
  const context = getContext(target);
  if (!context) {
    throw new Error(
        ngDevMode ? 'Unable to find the given context data for the given target' :
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
 * @publicApi
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
 *  Retrieve map of local references (local reference name => element or directive instance).
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
