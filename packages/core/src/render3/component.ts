/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// We are temporarily importing the existing viewEngine from core so we can be sure we are
// correctly implementing its interfaces for backwards compatibility.
import {Injector} from '../di/injector';
import {ComponentRef as viewEngine_ComponentRef} from '../linker/component_factory';
import {EmbeddedViewRef as viewEngine_EmbeddedViewRef} from '../linker/view_ref';

import {assertNotNull} from './assert';
import {NG_HOST_SYMBOL, createError, createLView, createTView, directiveCreate, enterView, getDirectiveInstance, hostElement, leaveView, locateHostElement, renderComponentOrTemplate} from './instructions';
import {ComponentDef, ComponentType} from './interfaces/definition';
import {LElementNode} from './interfaces/node';
import {RElement, Renderer3, RendererFactory3, domRendererFactory3} from './interfaces/renderer';
import {notImplemented, stringify} from './util';



/** Options that control how the component should be bootstrapped. */
export interface CreateComponentOptions {
  /** Which renderer factory to use. */
  rendererFactory?: RendererFactory3;

  /**
   * Host element on which the component will be bootstrapped. If not specified,
   * the component definition's `tag` is used to query the existing DOM for the
   * element to bootstrap.
   */
  host?: RElement|string;

  /** Module injector for the component. If unspecified, the injector will be NULL_INJECTOR. */
  injector?: Injector;

  /**
   * List of features to be applied to the created component. Features are simply
   * functions that decorate a component with a certain behavior.
   *
   * Example: PublicFeature is a function that makes the component public to the DI system.
   */
  features?: (<T>(component: T, componentDef: ComponentDef<T>) => void)[];
}


/**
 * Bootstraps a component, then creates and returns a `ComponentRef` for that component.
 *
 * @param componentType Component to bootstrap
 * @param options Optional parameters which control bootstrapping
 */
export function createComponentRef<T>(
    componentType: ComponentType<T>, opts: CreateComponentOptions): viewEngine_ComponentRef<T> {
  const component = renderComponent(componentType, opts);
  const hostView = createViewRef(() => detectChanges(component), component);
  return {
    location: {nativeElement: getHostElement(component)},
    injector: opts.injector || NULL_INJECTOR,
    instance: component,
    hostView: hostView,
    changeDetectorRef: hostView,
    componentType: componentType,
    // TODO: implement destroy and onDestroy
    destroy: () => {},
    onDestroy: (cb: Function) => {}
  };
}

/**
 * Creates an EmbeddedViewRef.
 *
 * @param detectChanges The detectChanges function for this view
 * @param context The context for this view
 * @returns The EmbeddedViewRef
 */
function createViewRef<T>(detectChanges: () => void, context: T): EmbeddedViewRef<T> {
  return addDestroyable(new EmbeddedViewRef(detectChanges), context);
}

class EmbeddedViewRef<T> implements viewEngine_EmbeddedViewRef<T> {
  // TODO: rootNodes should be replaced when properly implemented
  rootNodes = null !;
  context: T;
  destroyed: boolean;

  constructor(public detectChanges: () => void) {}

  // inherited from core/ChangeDetectorRef
  markForCheck() {
    if (ngDevMode) {
      throw notImplemented();
    }
  }
  detach() {
    if (ngDevMode) {
      throw notImplemented();
    }
  }

  checkNoChanges() {
    if (ngDevMode) {
      throw notImplemented();
    }
  }

  reattach() {
    if (ngDevMode) {
      throw notImplemented();
    }
  }

  destroy(): void {}

  onDestroy(cb: Function): void {}
}

/** Interface for destroy logic. Implemented by addDestroyable. */
interface DestroyRef<T> {
  context: T;
  /** Whether or not this object has been destroyed */
  destroyed: boolean;
  /** Destroy the instance and call all onDestroy callbacks. */
  destroy(): void;
  /** Register callbacks that should be called onDestroy */
  onDestroy(cb: Function): void;
}

/**
 * Decorates an object with destroy logic (implementing the DestroyRef interface)
 * and returns the enhanced object.
 *
 * @param obj The object to decorate
 * @returns The object with destroy logic
 */
function addDestroyable<T, C>(obj: any, context: C): T&DestroyRef<C> {
  let destroyFn: Function[]|null = null;
  obj.destroyed = false;
  obj.destroy = function() {
    destroyFn && destroyFn.forEach((fn) => fn());
    this.destroyed = true;
  };
  obj.onDestroy = (fn: Function) => (destroyFn || (destroyFn = [])).push(fn);
  obj.context = context;
  return obj;
}


// TODO: A hack to not pull in the NullInjector from @angular/core.
export const NULL_INJECTOR: Injector = {
  get: (token: any, notFoundValue?: any) => {
    throw new Error('NullInjector: Not found: ' + stringify(token));
  }
};


/**
 * Bootstraps a Component into an existing host element and returns an instance
 * of the component.
 *
 * @param componentType Component to bootstrap
 * @param options Optional parameters which control bootstrapping
 */
export function renderComponent<T>(
    componentType: ComponentType<T>, opts: CreateComponentOptions = {}): T {
  const rendererFactory = opts.rendererFactory || domRendererFactory3;
  const componentDef = componentType.ngComponentDef as ComponentDef<T>;
  if (componentDef.type != componentType) componentDef.type = componentType;
  let component: T;
  const hostNode = locateHostElement(rendererFactory, opts.host || componentDef.tag);
  const oldView = enterView(
      createLView(
          -1, rendererFactory.createRenderer(hostNode, componentDef.rendererType), createTView()),
      null !);
  try {
    // Create element node at index 0 in data array
    hostElement(hostNode, componentDef);
    // Create directive instance with n() and store at index 1 in data array (el is 0)
    component = getDirectiveInstance(directiveCreate(1, componentDef.n(), componentDef));
  } finally {
    leaveView(oldView);
  }

  opts.features && opts.features.forEach((feature) => feature(component, componentDef));
  detectChanges(component);
  return component;
}

export function detectChanges<T>(component: T) {
  ngDevMode && assertNotNull(component, 'component');
  const hostNode = (component as any)[NG_HOST_SYMBOL] as LElementNode;
  if (ngDevMode && !hostNode) {
    createError('Not a directive instance', component);
  }
  ngDevMode && assertNotNull(hostNode.data, 'hostNode.data');
  renderComponentOrTemplate(hostNode, hostNode.view, component);
  isDirty = false;
}

let isDirty = false;
export function markDirty<T>(
    component: T, scheduler: (fn: () => void) => void = requestAnimationFrame) {
  ngDevMode && assertNotNull(component, 'component');
  if (!isDirty) {
    isDirty = true;
    scheduler(() => detectChanges(component));
  }
}

export function getHostElement<T>(component: T): RElement {
  return ((component as any)[NG_HOST_SYMBOL] as LElementNode).native;
}
