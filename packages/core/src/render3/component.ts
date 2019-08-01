/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// We are temporarily importing the existing viewEngine from core so we can be sure we are
// correctly implementing its interfaces for backwards compatibility.
import {Type} from '../core';
import {Injector} from '../di/injector';
import {Sanitizer} from '../sanitization/security';
import {assertDataInRange} from '../util/assert';

import {assertComponentType} from './assert';
import {getComponentDef} from './definition';
import {diPublicInInjector, getOrCreateNodeInjectorForNode} from './di';
import {registerPostOrderHooks, registerPreOrderHooks} from './hooks';
import {CLEAN_PROMISE, addToViewTree, createLView, createTView, getOrCreateTNode, getOrCreateTView, initNodeFlags, instantiateRootComponent, invokeHostBindingsInCreationMode, locateHostElement, markAsComponentHost, refreshDescendantViews} from './instructions/shared';
import {ComponentDef, ComponentType, RenderFlags} from './interfaces/definition';
import {TElementNode, TNode, TNodeType} from './interfaces/node';
import {PlayerHandler} from './interfaces/player';
import {RElement, Renderer3, RendererFactory3, domRendererFactory3} from './interfaces/renderer';
import {CONTEXT, FLAGS, HEADER_OFFSET, LView, LViewFlags, RootContext, RootContextFlags, TVIEW} from './interfaces/view';
import {enterView, getPreviousOrParentTNode, leaveView, resetComponentState, setActiveHostElement} from './state';
import {publishDefaultGlobalUtils} from './util/global_utils';
import {defaultScheduler, stringifyForError} from './util/misc_utils';
import {getRootContext} from './util/view_traversal_utils';
import {readPatchedLView, resetPreOrderHookFlags} from './util/view_utils';



/** Options that control how the component should be bootstrapped. */
export interface CreateComponentOptions {
  /** Which renderer factory to use. */
  rendererFactory?: RendererFactory3;

  /** A custom sanitizer instance */
  sanitizer?: Sanitizer;

  /** A custom animation player handler */
  playerHandler?: PlayerHandler;

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
   * Typically, the features in this list are features that cannot be added to the
   * other features list in the component definition because they rely on other factors.
   *
   * Example: `LifecycleHooksFeature` is a function that adds lifecycle hook capabilities
   * to root components in a tree-shakable way. It cannot be added to the component
   * features list because there's no way of knowing when the component will be used as
   * a root component.
   */
  hostFeatures?: HostFeature[];

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

/** See CreateComponentOptions.hostFeatures */
type HostFeature = (<T>(component: T, componentDef: ComponentDef<T>) => void);

// TODO: A hack to not pull in the NullInjector from @angular/core.
export const NULL_INJECTOR: Injector = {
  get: (token: any, notFoundValue?: any) => {
    throw new Error('NullInjector: Not found: ' + stringifyForError(token));
  }
};

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
    componentType: ComponentType<T>|
        Type<T>/* Type as workaround for: Microsoft/TypeScript/issues/4881 */
    ,
    opts: CreateComponentOptions = {}): T {
  ngDevMode && publishDefaultGlobalUtils();
  ngDevMode && assertComponentType(componentType);

  // this is preemptively set to avoid having test and debug code accidentally
  // read data from a previous application state...
  setActiveHostElement(null);

  const rendererFactory = opts.rendererFactory || domRendererFactory3;
  const sanitizer = opts.sanitizer || null;
  const componentDef = getComponentDef<T>(componentType) !;
  if (componentDef.type != componentType) componentDef.type = componentType;

  // The first index of the first selector is the tag name.
  const componentTag = componentDef.selectors ![0] ![0] as string;
  const hostRNode = locateHostElement(rendererFactory, opts.host || componentTag);
  const rootFlags = componentDef.onPush ? LViewFlags.Dirty | LViewFlags.IsRoot :
                                          LViewFlags.CheckAlways | LViewFlags.IsRoot;
  const rootContext = createRootContext(opts.scheduler, opts.playerHandler);

  const renderer = rendererFactory.createRenderer(hostRNode, componentDef);
  const rootView: LView = createLView(
      null, createTView(-1, null, 1, 0, null, null, null, null), rootContext, rootFlags, null, null,
      rendererFactory, renderer, undefined, opts.injector || null);

  const oldView = enterView(rootView, null);
  let component: T;

  // Will become true if the `try` block executes with no errors.
  let safeToRunHooks = false;
  try {
    if (rendererFactory.begin) rendererFactory.begin();
    const componentView = createRootComponentView(
        hostRNode, componentDef, rootView, rendererFactory, renderer, sanitizer);
    component = createRootComponent(
        componentView, componentDef, rootView, rootContext, opts.hostFeatures || null);

    refreshDescendantViews(rootView);  // creation mode pass
    rootView[FLAGS] &= ~LViewFlags.CreationMode;
    resetPreOrderHookFlags(rootView);
    refreshDescendantViews(rootView);  // update mode pass
    safeToRunHooks = true;
  } finally {
    leaveView(oldView, safeToRunHooks);
    if (rendererFactory.end) rendererFactory.end();
  }

  return component;
}

/**
 * Creates the root component view and the root component node.
 *
 * @param rNode Render host element.
 * @param def ComponentDef
 * @param rootView The parent view where the host node is stored
 * @param renderer The current renderer
 * @param sanitizer The sanitizer, if provided
 *
 * @returns Component view created
 */
export function createRootComponentView(
    rNode: RElement | null, def: ComponentDef<any>, rootView: LView,
    rendererFactory: RendererFactory3, renderer: Renderer3, sanitizer?: Sanitizer | null): LView {
  resetComponentState();
  const tView = rootView[TVIEW];
  ngDevMode && assertDataInRange(rootView, 0 + HEADER_OFFSET);
  rootView[0 + HEADER_OFFSET] = rNode;
  const tNode: TElementNode = getOrCreateTNode(tView, null, 0, TNodeType.Element, null, null);
  const componentView = createLView(
      rootView, getOrCreateTView(def), null, def.onPush ? LViewFlags.Dirty : LViewFlags.CheckAlways,
      rootView[HEADER_OFFSET], tNode, rendererFactory, renderer, sanitizer);

  if (tView.firstTemplatePass) {
    diPublicInInjector(getOrCreateNodeInjectorForNode(tNode, rootView), tView, def.type);
    markAsComponentHost(tView, tNode);
    initNodeFlags(tNode, rootView.length, 1);
  }

  addToViewTree(rootView, componentView);

  // Store component view at node index, with node as the HOST
  return rootView[HEADER_OFFSET] = componentView;
}

/**
 * Creates a root component and sets it up with features and host bindings. Shared by
 * renderComponent() and ViewContainerRef.createComponent().
 */
export function createRootComponent<T>(
    componentView: LView, componentDef: ComponentDef<T>, rootView: LView, rootContext: RootContext,
    hostFeatures: HostFeature[] | null): any {
  const tView = rootView[TVIEW];
  // Create directive instance with factory() and store at next index in viewData
  const component = instantiateRootComponent(tView, rootView, componentDef);

  rootContext.components.push(component);
  componentView[CONTEXT] = component;

  hostFeatures && hostFeatures.forEach((feature) => feature(component, componentDef));

  // We want to generate an empty QueryList for root content queries for backwards
  // compatibility with ViewEngine.
  if (componentDef.contentQueries) {
    componentDef.contentQueries(RenderFlags.Create, component, rootView.length - 1);
  }

  const rootTNode = getPreviousOrParentTNode();
  if (tView.firstTemplatePass && componentDef.hostBindings) {
    const elementIndex = rootTNode.index - HEADER_OFFSET;
    setActiveHostElement(elementIndex);

    const expando = tView.expandoInstructions !;
    invokeHostBindingsInCreationMode(
        componentDef, expando, component, rootTNode, tView.firstTemplatePass);

    setActiveHostElement(null);
  }

  return component;
}


export function createRootContext(
    scheduler?: (workFn: () => void) => void, playerHandler?: PlayerHandler|null): RootContext {
  return {
    components: [],
    scheduler: scheduler || defaultScheduler,
    clean: CLEAN_PROMISE,
    playerHandler: playerHandler || null,
    flags: RootContextFlags.Empty
  };
}

/**
 * Used to enable lifecycle hooks on the root component.
 *
 * Include this feature when calling `renderComponent` if the root component
 * you are rendering has lifecycle hooks defined. Otherwise, the hooks won't
 * be called properly.
 *
 * Example:
 *
 * ```
 * renderComponent(AppComponent, {features: [RootLifecycleHooks]});
 * ```
 */
export function LifecycleHooksFeature(component: any, def: ComponentDef<any>): void {
  const rootTView = readPatchedLView(component) ![TVIEW];
  const dirIndex = rootTView.data.length - 1;

  registerPreOrderHooks(dirIndex, def, rootTView, -1, -1, -1);
  // TODO(misko): replace `as TNode` with createTNode call. (needs refactoring to lose dep on
  // LNode).
  registerPostOrderHooks(
      rootTView, { directiveStart: dirIndex, directiveEnd: dirIndex + 1 } as TNode);
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
