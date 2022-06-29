/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// We are temporarily importing the existing viewEngine from core so we can be sure we are
// correctly implementing its interfaces for backwards compatibility.
import {Injector} from '../di/injector';
import {Renderer2, RendererFactory2} from '../render';
import {Sanitizer} from '../sanitization/sanitizer';
import {assertDefined, assertIndexInRange} from '../util/assert';

import {diPublicInInjector, getOrCreateNodeInjectorForNode} from './di';
import {throwProviderNotFoundError} from './errors_di';
import {registerPostOrderHooks} from './hooks';
import {addToViewTree, CLEAN_PROMISE, createLView, getOrCreateTComponentView, getOrCreateTNode, initTNodeFlags, instantiateRootComponent, invokeHostBindingsInCreationMode, locateHostElement, markAsComponentHost, refreshView, registerHostBindingOpCodes, renderView} from './instructions/shared';
import {ComponentDef, RenderFlags} from './interfaces/definition';
import {TElementNode, TNodeType} from './interfaces/node';
import {PlayerHandler} from './interfaces/player';
import {RElement} from './interfaces/renderer_dom';
import {CONTEXT, HEADER_OFFSET, LView, LViewFlags, RootContext, RootContextFlags, TVIEW} from './interfaces/view';
import {writeDirectClass, writeDirectStyle} from './node_manipulation';
import {getCurrentTNode, getLView, setSelectedIndex} from './state';
import {computeStaticStyling} from './styling/static_styling';
import {setUpAttributes} from './util/attrs_utils';
import {defaultScheduler} from './util/misc_utils';
import {getRootContext} from './util/view_traversal_utils';

/** See CreateComponentOptions.hostFeatures */
type HostFeature = (<T>(component: T, componentDef: ComponentDef<T>) => void);

// TODO: A hack to not pull in the NullInjector from @angular/core.
export const NULL_INJECTOR: Injector = {
  get: (token: any, notFoundValue?: any) => {
    throwProviderNotFoundError(token, 'NullInjector');
  }
};

/**
 * Creates the root component view and the root component node.
 *
 * @param rNode Render host element.
 * @param def ComponentDef
 * @param rootView The parent view where the host node is stored
 * @param rendererFactory Factory to be used for creating child renderers.
 * @param hostRenderer The current renderer
 * @param sanitizer The sanitizer, if provided
 *
 * @returns Component view created
 */
export function createRootComponentView(
    rNode: RElement|null, def: ComponentDef<any>, rootView: LView,
    rendererFactory: RendererFactory2, hostRenderer: Renderer2, sanitizer?: Sanitizer|null): LView {
  const tView = rootView[TVIEW];
  const index = HEADER_OFFSET;
  ngDevMode && assertIndexInRange(rootView, index);
  rootView[index] = rNode;
  // '#host' is added here as we don't know the real host DOM name (we don't want to read it) and at
  // the same time we want to communicate the debug `TNode` that this is a special `TNode`
  // representing a host element.
  const tNode: TElementNode = getOrCreateTNode(tView, index, TNodeType.Element, '#host', null);
  const mergedAttrs = tNode.mergedAttrs = def.hostAttrs;
  if (mergedAttrs !== null) {
    computeStaticStyling(tNode, mergedAttrs, true);
    if (rNode !== null) {
      setUpAttributes(hostRenderer, rNode, mergedAttrs);
      if (tNode.classes !== null) {
        writeDirectClass(hostRenderer, rNode, tNode.classes);
      }
      if (tNode.styles !== null) {
        writeDirectStyle(hostRenderer, rNode, tNode.styles);
      }
    }
  }

  const viewRenderer = rendererFactory.createRenderer(rNode, def);
  const componentView = createLView(
      rootView, getOrCreateTComponentView(def), null,
      def.onPush ? LViewFlags.Dirty : LViewFlags.CheckAlways, rootView[index], tNode,
      rendererFactory, viewRenderer, sanitizer || null, null, null);

  if (tView.firstCreatePass) {
    diPublicInInjector(getOrCreateNodeInjectorForNode(tNode, rootView), tView, def.type);
    markAsComponentHost(tView, tNode);
    initTNodeFlags(tNode, rootView.length, 1);
  }

  addToViewTree(rootView, componentView);

  // Store component view at node index, with node as the HOST
  return rootView[index] = componentView;
}

/**
 * Creates a root component and sets it up with features and host bindings. Shared by
 * renderComponent() and ViewContainerRef.createComponent().
 */
export function createRootComponent<T>(
    componentView: LView, componentDef: ComponentDef<T>, rootLView: LView, rootContext: RootContext,
    hostFeatures: HostFeature[]|null): any {
  const tView = rootLView[TVIEW];
  // Create directive instance with factory() and store at next index in viewData
  const component = instantiateRootComponent(tView, rootLView, componentDef);

  rootContext.components.push(component);
  componentView[CONTEXT] = component;

  if (hostFeatures !== null) {
    for (const feature of hostFeatures) {
      feature(component, componentDef);
    }
  }

  // We want to generate an empty QueryList for root content queries for backwards
  // compatibility with ViewEngine.
  if (componentDef.contentQueries) {
    const tNode = getCurrentTNode()!;
    ngDevMode && assertDefined(tNode, 'TNode expected');
    componentDef.contentQueries(RenderFlags.Create, component, tNode.directiveStart);
  }

  const rootTNode = getCurrentTNode()!;
  ngDevMode && assertDefined(rootTNode, 'tNode should have been already created');
  if (tView.firstCreatePass &&
      (componentDef.hostBindings !== null || componentDef.hostAttrs !== null)) {
    setSelectedIndex(rootTNode.index);

    const rootTView = rootLView[TVIEW];
    registerHostBindingOpCodes(
        rootTView, rootTNode, rootLView, rootTNode.directiveStart, rootTNode.directiveEnd,
        componentDef);

    invokeHostBindingsInCreationMode(componentDef, component);
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
 * renderComponent(AppComponent, {hostFeatures: [LifecycleHooksFeature]});
 * ```
 */
export function LifecycleHooksFeature(): void {
  const tNode = getCurrentTNode()!;
  ngDevMode && assertDefined(tNode, 'TNode is required');
  registerPostOrderHooks(getLView()[TVIEW], tNode);
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
