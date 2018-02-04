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
import {RootContext} from './interfaces/view';
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

  /**
   * A function which is used to schedule change detection work in the future.
   *
   * When marking components as dirty, it is necessary to schedule the work of
   * change detection in the future. This is done to coalesce multiple
   * {@link markDirty} calls into a single changed detection processing.
   *
   * The default value of the scheduler is the `requestAnimationFrame` function.
   *
   * It is also useful to override this function for testing purposes.
   */
  scheduler?: (work: () => void) => void;
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
 * A permanent marker promise which signifies that the current CD tree is
 * clean.
 */
const CLEAN_PROMISE = Promise.resolve(null);

/**
 * Bootstraps a Component into an existing host element and returns an instance
 * of the component.
 *
 * Use this function to bootstrap a component into the DOM tree. Each invocation
 * of this function will create a separate tree of components, injectors and
 * change detection cycles and lifetimes. To dynamically insert a new component
 * into an existing tree such that it shares the same injection, change detection
 * and object lifetime, use {@link ViewContainer#createComponent}.
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
  const rootContext: RootContext = {
    // Incomplete initialization due to circular reference.
    component: null !,
    scheduler: opts.scheduler || requestAnimationFrame,
    clean: CLEAN_PROMISE,
  };
  const oldView = enterView(
      createLView(
          -1, rendererFactory.createRenderer(hostNode, componentDef.rendererType), createTView(),
          null, rootContext),
      null !);
  try {
    // Create element node at index 0 in data array
    hostElement(hostNode, componentDef);
    // Create directive instance with n() and store at index 1 in data array (el is 0)
    component = rootContext.component =
        getDirectiveInstance(directiveCreate(1, componentDef.n(), componentDef));
  } finally {
    leaveView(oldView);
  }

  opts.features && opts.features.forEach((feature) => feature(component, componentDef));
  detectChanges(component);
  return component;
}

/**
 * Synchronously perform change detection on a component (and possibly its sub-components).
 *
 * This function triggers change detection in a synchronous way on a component. There should
 * be very little reason to call this function directly since a preferred way to do change
 * detection is to {@link markDirty} the component and wait for the scheduler to call this method
 * at some future point in time. This is because a single user action often results in many
 * components being invalidated and calling change detection on each component synchronously
 * would be inefficient. It is better to wait until all components are marked as dirty and
 * then perform single change detection across all of the components
 *
 * @param component The component which the change detection should be performed on.
 */
export function detectChanges<T>(component: T): void {
  const hostNode = _getComponentHostLElementNode(component);
  ngDevMode && assertNotNull(hostNode.data, 'Component host node should be attached to an LView');
  renderComponentOrTemplate(hostNode, hostNode.view, component);
}

/**
 * Mark the component as dirty (needing change detection).
 *
 * Marking a component dirty will schedule a change detection on this
 * component at some point in the future. Marking an already dirty
 * component as dirty is a noop. Only one outstanding change detection
 * can be scheduled per component tree. (Two components bootstrapped with
 * separate `renderComponent` will have separate schedulers)
 *
 * When the root component is bootstrapped with `renderComponent` a scheduler
 * can be provided.
 *
 * @param component Component to mark as dirty.
 */
export function markDirty<T>(component: T) {
  const rootContext = getRootContext(component);
  if (rootContext.clean == CLEAN_PROMISE) {
    let res: null|((val: null) => void);
    rootContext.clean = new Promise<null>((r) => res = r);
    rootContext.scheduler(() => {
      detectChanges(rootContext.component);
      res !(null);
      rootContext.clean = CLEAN_PROMISE;
    });
  }
}

/**
 * Retrieve the root component of any component by walking the parent `LView` until
 * reaching the root `LView`.
 *
 * @param component any component
 */
function getRootContext(component: any): RootContext {
  ngDevMode && assertNotNull(component, 'component');
  const lElementNode = _getComponentHostLElementNode(component);
  let lView = lElementNode.view;
  while (lView.parent) {
    lView = lView.parent;
  }
  const rootContext = lView.context as RootContext;
  ngDevMode && assertNotNull(rootContext, 'rootContext');
  return rootContext;
}

function _getComponentHostLElementNode<T>(component: T): LElementNode {
  ngDevMode && assertNotNull(component, 'expecting component got null');
  const lElementNode = (component as any)[NG_HOST_SYMBOL] as LElementNode;
  ngDevMode && assertNotNull(component, 'object is not a component');
  return lElementNode;
}

/**
 * Retrieve the host element of the component.
 *
 * Use this function to retrieve the host element of the component. The host
 * element is the element which the component is associated with.
 *
 * @param component Component for which the host element should be retrieved.
 */
export function getHostElement<T>(component: T): HTMLElement {
  return _getComponentHostLElementNode(component).native as any;
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

/**
 * Wait on component until it is rendered.
 *
 * This function returns a `Promise` which is resolved when the component's
 * change detection is executed. This is determined by finding the scheduler
 * associated with the `component`'s render tree and waiting until the scheduler
 * flushes. If nothing is scheduled, the function returns a resolved promise.
 *
 * Example:
 * ```
 * await whenRendered(myComponent);
 * ```
 *
 * @param component Component to wait upon
 * @returns Promise which resolves when the component is rendered.
 */
export function whenRendered(component: any): Promise<null> {
  return getRootContext(component).clean;
}
