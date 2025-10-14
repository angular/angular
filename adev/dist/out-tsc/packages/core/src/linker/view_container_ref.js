/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {EnvironmentInjector} from '../di/r3_injector';
import {validateMatchingNode} from '../hydration/error_handling';
import {CONTAINERS} from '../hydration/interfaces';
import {isInSkipHydrationBlock} from '../hydration/skip_hydration';
import {
  getSegmentHead,
  isDisconnectedNode,
  markRNodeAsClaimedByHydration,
} from '../hydration/utils';
import {findMatchingDehydratedView, locateDehydratedViewsInContainer} from '../hydration/views';
import {isType} from '../interface/type';
import {assertNodeInjector} from '../render3/assert';
import {ComponentFactory as R3ComponentFactory} from '../render3/component_ref';
import {getComponentDef} from '../render3/def_getters';
import {getParentInjectorLocation, NodeInjector} from '../render3/di';
import {
  CONTAINER_HEADER_OFFSET,
  DEHYDRATED_VIEWS,
  NATIVE,
  VIEW_REFS,
} from '../render3/interfaces/container';
import {isLContainer} from '../render3/interfaces/type_checks';
import {
  HEADER_OFFSET,
  HYDRATION,
  PARENT,
  RENDERER,
  T_HOST,
  TVIEW,
} from '../render3/interfaces/view';
import {assertTNodeType} from '../render3/node_assert';
import {destroyLView} from '../render3/node_manipulation';
import {nativeInsertBefore} from '../render3/dom_node_manipulation';
import {getCurrentTNode, getLView} from '../render3/state';
import {
  getParentInjectorIndex,
  getParentInjectorView,
  hasParentInjector,
} from '../render3/util/injector_utils';
import {getNativeByTNode, unwrapRNode, viewAttachedToContainer} from '../render3/util/view_utils';
import {shouldAddViewToDom} from '../render3/view_manipulation';
import {ViewRef as R3ViewRef} from '../render3/view_ref';
import {addToArray, removeFromArray} from '../util/array_utils';
import {
  assertDefined,
  assertEqual,
  assertGreaterThan,
  assertLessThan,
  throwError,
} from '../util/assert';
import {createElementRef} from './element_ref';
import {addLViewToLContainer, createLContainer, detachView} from '../render3/view/container';
import {addToEndOfViewTree} from '../render3/view/construction';
/**
 * Represents a container where one or more views can be attached to a component.
 *
 * Can contain *host views* (created by instantiating a
 * component with the `createComponent()` method), and *embedded views*
 * (created by instantiating a `TemplateRef` with the `createEmbeddedView()` method).
 *
 * A view container instance can contain other view containers,
 * creating a view hierarchy.
 *
 * @usageNotes
 *
 * The example below demonstrates how the `createComponent` function can be used
 * to create an instance of a ComponentRef dynamically and attach it to an ApplicationRef,
 * so that it gets included into change detection cycles.
 *
 * Note: the example uses standalone components, but the function can also be used for
 * non-standalone components (declared in an NgModule) as well.
 *
 * ```angular-ts
 * @Component({
 *   selector: 'dynamic',
 *   template: `<span>This is a content of a dynamic component.</span>`,
 * })
 * class DynamicComponent {
 *   vcr = inject(ViewContainerRef);
 * }
 *
 * @Component({
 *   selector: 'app',
 *   template: `<main>Hi! This is the main content.</main>`,
 * })
 * class AppComponent {
 *   vcr = inject(ViewContainerRef);
 *
 *   ngAfterViewInit() {
 *     const compRef = this.vcr.createComponent(DynamicComponent);
 *     compRef.changeDetectorRef.detectChanges();
 *   }
 * }
 * ```
 *
 * @see {@link ComponentRef}
 * @see {@link EmbeddedViewRef}
 *
 * @publicApi
 */
export class ViewContainerRef {
  /**
   * @internal
   * @nocollapse
   */
  static __NG_ELEMENT_ID__ = injectViewContainerRef;
}
/**
 * Creates a ViewContainerRef and stores it on the injector. Or, if the ViewContainerRef
 * already exists, retrieves the existing ViewContainerRef.
 *
 * @returns The ViewContainerRef instance to use
 */
export function injectViewContainerRef() {
  const previousTNode = getCurrentTNode();
  return createContainerRef(previousTNode, getLView());
}
const VE_ViewContainerRef = ViewContainerRef;
// TODO(alxhub): cleaning up this indirection triggers a subtle bug in Closure in g3. Once the fix
// for that lands, this can be cleaned up.
const R3ViewContainerRef = class ViewContainerRef extends VE_ViewContainerRef {
  _lContainer;
  _hostTNode;
  _hostLView;
  constructor(_lContainer, _hostTNode, _hostLView) {
    super();
    this._lContainer = _lContainer;
    this._hostTNode = _hostTNode;
    this._hostLView = _hostLView;
  }
  get element() {
    return createElementRef(this._hostTNode, this._hostLView);
  }
  get injector() {
    return new NodeInjector(this._hostTNode, this._hostLView);
  }
  /** @deprecated No replacement */
  get parentInjector() {
    const parentLocation = getParentInjectorLocation(this._hostTNode, this._hostLView);
    if (hasParentInjector(parentLocation)) {
      const parentView = getParentInjectorView(parentLocation, this._hostLView);
      const injectorIndex = getParentInjectorIndex(parentLocation);
      ngDevMode && assertNodeInjector(parentView, injectorIndex);
      const parentTNode = parentView[TVIEW].data[injectorIndex + 8 /* NodeInjectorOffset.TNODE */];
      return new NodeInjector(parentTNode, parentView);
    } else {
      return new NodeInjector(null, this._hostLView);
    }
  }
  clear() {
    while (this.length > 0) {
      this.remove(this.length - 1);
    }
  }
  get(index) {
    const viewRefs = getViewRefs(this._lContainer);
    return (viewRefs !== null && viewRefs[index]) || null;
  }
  get length() {
    return this._lContainer.length - CONTAINER_HEADER_OFFSET;
  }
  createEmbeddedView(templateRef, context, indexOrOptions) {
    let index;
    let injector;
    if (typeof indexOrOptions === 'number') {
      index = indexOrOptions;
    } else if (indexOrOptions != null) {
      index = indexOrOptions.index;
      injector = indexOrOptions.injector;
    }
    const dehydratedView = findMatchingDehydratedView(this._lContainer, templateRef.ssrId);
    const viewRef = templateRef.createEmbeddedViewImpl(context || {}, injector, dehydratedView);
    this.insertImpl(viewRef, index, shouldAddViewToDom(this._hostTNode, dehydratedView));
    return viewRef;
  }
  createComponent(
    componentFactoryOrType,
    indexOrOptions,
    injector,
    projectableNodes,
    environmentInjector,
    directives,
    bindings,
  ) {
    const isComponentFactory = componentFactoryOrType && !isType(componentFactoryOrType);
    let index;
    // This function supports 2 signatures and we need to handle options correctly for both:
    //   1. When first argument is a Component type. This signature also requires extra
    //      options to be provided as object (more ergonomic option).
    //   2. First argument is a Component factory. In this case extra options are represented as
    //      positional arguments. This signature is less ergonomic and will be deprecated.
    if (isComponentFactory) {
      if (ngDevMode) {
        assertEqual(
          typeof indexOrOptions !== 'object',
          true,
          'It looks like Component factory was provided as the first argument ' +
            'and an options object as the second argument. This combination of arguments ' +
            'is incompatible. You can either change the first argument to provide Component ' +
            'type or change the second argument to be a number (representing an index at ' +
            "which to insert the new component's host view into this container)",
        );
      }
      index = indexOrOptions;
    } else {
      if (ngDevMode) {
        assertDefined(
          getComponentDef(componentFactoryOrType),
          `Provided Component class doesn't contain Component definition. ` +
            `Please check whether provided class has @Component decorator.`,
        );
        assertEqual(
          typeof indexOrOptions !== 'number',
          true,
          'It looks like Component type was provided as the first argument ' +
            "and a number (representing an index at which to insert the new component's " +
            'host view into this container as the second argument. This combination of arguments ' +
            'is incompatible. Please use an object as the second argument instead.',
        );
      }
      const options = indexOrOptions || {};
      if (ngDevMode && options.environmentInjector && options.ngModuleRef) {
        throwError(
          `Cannot pass both environmentInjector and ngModuleRef options to createComponent().`,
        );
      }
      index = options.index;
      injector = options.injector;
      projectableNodes = options.projectableNodes;
      environmentInjector = options.environmentInjector || options.ngModuleRef;
      directives = options.directives;
      bindings = options.bindings;
    }
    const componentFactory = isComponentFactory
      ? componentFactoryOrType
      : new R3ComponentFactory(getComponentDef(componentFactoryOrType));
    const contextInjector = injector || this.parentInjector;
    // If an `NgModuleRef` is not provided explicitly, try retrieving it from the DI tree.
    if (!environmentInjector && componentFactory.ngModule == null) {
      // For the `ComponentFactory` case, entering this logic is very unlikely, since we expect that
      // an instance of a `ComponentFactory`, resolved via `ComponentFactoryResolver` would have an
      // `ngModule` field. This is possible in some test scenarios and potentially in some JIT-based
      // use-cases. For the `ComponentFactory` case we preserve backwards-compatibility and try
      // using a provided injector first, then fall back to the parent injector of this
      // `ViewContainerRef` instance.
      //
      // For the factory-less case, it's critical to establish a connection with the module
      // injector tree (by retrieving an instance of an `NgModuleRef` and accessing its injector),
      // so that a component can use DI tokens provided in MgModules. For this reason, we can not
      // rely on the provided injector, since it might be detached from the DI tree (for example, if
      // it was created via `Injector.create` without specifying a parent injector, or if an
      // injector is retrieved from an `NgModuleRef` created via `createNgModule` using an
      // NgModule outside of a module tree). Instead, we always use `ViewContainerRef`'s parent
      // injector, which is normally connected to the DI tree, which includes module injector
      // subtree.
      const _injector = isComponentFactory ? contextInjector : this.parentInjector;
      // DO NOT REFACTOR. The code here used to have a `injector.get(NgModuleRef, null) ||
      // undefined` expression which seems to cause internal google apps to fail. This is documented
      // in the following internal bug issue: go/b/142967802
      const result = _injector.get(EnvironmentInjector, null);
      if (result) {
        environmentInjector = result;
      }
    }
    const componentDef = getComponentDef(componentFactory.componentType ?? {});
    const dehydratedView = findMatchingDehydratedView(this._lContainer, componentDef?.id ?? null);
    const rNode = dehydratedView?.firstChild ?? null;
    const componentRef = componentFactory.create(
      contextInjector,
      projectableNodes,
      rNode,
      environmentInjector,
      directives,
      bindings,
    );
    this.insertImpl(
      componentRef.hostView,
      index,
      shouldAddViewToDom(this._hostTNode, dehydratedView),
    );
    return componentRef;
  }
  insert(viewRef, index) {
    return this.insertImpl(viewRef, index, true);
  }
  insertImpl(viewRef, index, addToDOM) {
    const lView = viewRef._lView;
    if (ngDevMode && viewRef.destroyed) {
      throw new Error('Cannot insert a destroyed View in a ViewContainer!');
    }
    if (viewAttachedToContainer(lView)) {
      // If view is already attached, detach it first so we clean up references appropriately.
      const prevIdx = this.indexOf(viewRef);
      // A view might be attached either to this or a different container. The `prevIdx` for
      // those cases will be:
      // equal to -1 for views attached to this ViewContainerRef
      // >= 0 for views attached to a different ViewContainerRef
      if (prevIdx !== -1) {
        this.detach(prevIdx);
      } else {
        const prevLContainer = lView[PARENT];
        ngDevMode &&
          assertEqual(
            isLContainer(prevLContainer),
            true,
            'An attached view should have its PARENT point to a container.',
          );
        // We need to re-create a R3ViewContainerRef instance since those are not stored on
        // LView (nor anywhere else).
        const prevVCRef = new R3ViewContainerRef(
          prevLContainer,
          prevLContainer[T_HOST],
          prevLContainer[PARENT],
        );
        prevVCRef.detach(prevVCRef.indexOf(viewRef));
      }
    }
    // Logical operation of adding `LView` to `LContainer`
    const adjustedIdx = this._adjustIndex(index);
    const lContainer = this._lContainer;
    addLViewToLContainer(lContainer, lView, adjustedIdx, addToDOM);
    viewRef.attachToViewContainerRef();
    addToArray(getOrCreateViewRefs(lContainer), adjustedIdx, viewRef);
    return viewRef;
  }
  move(viewRef, newIndex) {
    if (ngDevMode && viewRef.destroyed) {
      throw new Error('Cannot move a destroyed View in a ViewContainer!');
    }
    return this.insert(viewRef, newIndex);
  }
  indexOf(viewRef) {
    const viewRefsArr = getViewRefs(this._lContainer);
    return viewRefsArr !== null ? viewRefsArr.indexOf(viewRef) : -1;
  }
  remove(index) {
    const adjustedIdx = this._adjustIndex(index, -1);
    const detachedView = detachView(this._lContainer, adjustedIdx);
    if (detachedView) {
      // Before destroying the view, remove it from the container's array of `ViewRef`s.
      // This ensures the view container length is updated before calling
      // `destroyLView`, which could recursively call view container methods that
      // rely on an accurate container length.
      // (e.g. a method on this view container being called by a child directive's OnDestroy
      // lifecycle hook)
      removeFromArray(getOrCreateViewRefs(this._lContainer), adjustedIdx);
      destroyLView(detachedView[TVIEW], detachedView);
    }
  }
  detach(index) {
    const adjustedIdx = this._adjustIndex(index, -1);
    const view = detachView(this._lContainer, adjustedIdx);
    const wasDetached =
      view && removeFromArray(getOrCreateViewRefs(this._lContainer), adjustedIdx) != null;
    return wasDetached ? new R3ViewRef(view) : null;
  }
  _adjustIndex(index, shift = 0) {
    if (index == null) {
      return this.length + shift;
    }
    if (ngDevMode) {
      assertGreaterThan(index, -1, `ViewRef index must be positive, got ${index}`);
      // +1 because it's legal to insert at the end.
      assertLessThan(index, this.length + 1 + shift, 'index');
    }
    return index;
  }
};
function getViewRefs(lContainer) {
  return lContainer[VIEW_REFS];
}
function getOrCreateViewRefs(lContainer) {
  return lContainer[VIEW_REFS] || (lContainer[VIEW_REFS] = []);
}
/**
 * Creates a ViewContainerRef and stores it on the injector.
 *
 * @param hostTNode The node that is requesting a ViewContainerRef
 * @param hostLView The view to which the node belongs
 * @returns The ViewContainerRef instance to use
 */
export function createContainerRef(hostTNode, hostLView) {
  ngDevMode &&
    assertTNodeType(hostTNode, 12 /* TNodeType.AnyContainer */ | 3 /* TNodeType.AnyRNode */);
  let lContainer;
  const slotValue = hostLView[hostTNode.index];
  if (isLContainer(slotValue)) {
    // If the host is a container, we don't need to create a new LContainer
    lContainer = slotValue;
  } else {
    // An LContainer anchor can not be `null`, but we set it here temporarily
    // and update to the actual value later in this function (see
    // `_locateOrCreateAnchorNode`).
    lContainer = createLContainer(slotValue, hostLView, null, hostTNode);
    hostLView[hostTNode.index] = lContainer;
    addToEndOfViewTree(hostLView, lContainer);
  }
  _locateOrCreateAnchorNode(lContainer, hostLView, hostTNode, slotValue);
  return new R3ViewContainerRef(lContainer, hostTNode, hostLView);
}
/**
 * Creates and inserts a comment node that acts as an anchor for a view container.
 *
 * If the host is a regular element, we have to insert a comment node manually which will
 * be used as an anchor when inserting elements. In this specific case we use low-level DOM
 * manipulation to insert it.
 */
function insertAnchorNode(hostLView, hostTNode) {
  const renderer = hostLView[RENDERER];
  const commentNode = renderer.createComment(ngDevMode ? 'container' : '');
  const hostNative = getNativeByTNode(hostTNode, hostLView);
  const parentOfHostNative = renderer.parentNode(hostNative);
  nativeInsertBefore(
    renderer,
    parentOfHostNative,
    commentNode,
    renderer.nextSibling(hostNative),
    false,
  );
  return commentNode;
}
let _locateOrCreateAnchorNode = createAnchorNode;
let _populateDehydratedViewsInLContainer = () => false; // noop by default
/**
 * Looks up dehydrated views that belong to a given LContainer and populates
 * this information into the `LContainer[DEHYDRATED_VIEWS]` slot. When running
 * in client-only mode, this function is a noop.
 *
 * @param lContainer LContainer that should be populated.
 * @param tNode Corresponding TNode.
 * @param hostLView LView that hosts LContainer.
 * @returns a boolean flag that indicates whether a populating operation
 *   was successful. The operation might be unsuccessful in case is has completed
 *   previously, we are rendering in client-only mode or this content is located
 *   in a skip hydration section.
 */
export function populateDehydratedViewsInLContainer(lContainer, tNode, hostLView) {
  return _populateDehydratedViewsInLContainer(lContainer, tNode, hostLView);
}
/**
 * Regular creation mode: an anchor is created and
 * assigned to the `lContainer[NATIVE]` slot.
 */
function createAnchorNode(lContainer, hostLView, hostTNode, slotValue) {
  // We already have a native element (anchor) set, return.
  if (lContainer[NATIVE]) return;
  let commentNode;
  // If the host is an element container, the native host element is guaranteed to be a
  // comment and we can reuse that comment as anchor element for the new LContainer.
  // The comment node in question is already part of the DOM structure so we don't need to append
  // it again.
  if (hostTNode.type & 8 /* TNodeType.ElementContainer */) {
    commentNode = unwrapRNode(slotValue);
  } else {
    commentNode = insertAnchorNode(hostLView, hostTNode);
  }
  lContainer[NATIVE] = commentNode;
}
/**
 * Hydration logic that looks up all dehydrated views in this container
 * and puts them into `lContainer[DEHYDRATED_VIEWS]` slot.
 *
 * @returns a boolean flag that indicates whether a populating operation
 *   was successful. The operation might be unsuccessful in case is has completed
 *   previously, we are rendering in client-only mode or this content is located
 *   in a skip hydration section.
 */
function populateDehydratedViewsInLContainerImpl(lContainer, tNode, hostLView) {
  // We already have a native element (anchor) set and the process
  // of finding dehydrated views happened (so the `lContainer[DEHYDRATED_VIEWS]`
  // is not null), exit early.
  if (lContainer[NATIVE] && lContainer[DEHYDRATED_VIEWS]) {
    return true;
  }
  const hydrationInfo = hostLView[HYDRATION];
  const noOffsetIndex = tNode.index - HEADER_OFFSET;
  const isNodeCreationMode =
    !hydrationInfo ||
    isInSkipHydrationBlock(tNode) ||
    isDisconnectedNode(hydrationInfo, noOffsetIndex);
  // Regular creation mode.
  if (isNodeCreationMode) {
    return false;
  }
  // Hydration mode, looking up an anchor node and dehydrated views in DOM.
  const currentRNode = getSegmentHead(hydrationInfo, noOffsetIndex);
  const serializedViews = hydrationInfo.data[CONTAINERS]?.[noOffsetIndex];
  ngDevMode &&
    assertDefined(
      serializedViews,
      'Unexpected state: no hydration info available for a given TNode, ' +
        'which represents a view container.',
    );
  const [commentNode, dehydratedViews] = locateDehydratedViewsInContainer(
    currentRNode,
    serializedViews,
  );
  if (ngDevMode) {
    validateMatchingNode(commentNode, Node.COMMENT_NODE, null, hostLView, tNode, true);
    // Do not throw in case this node is already claimed (thus `false` as a second
    // argument). If this container is created based on an `<ng-template>`, the comment
    // node would be already claimed from the `template` instruction. If an element acts
    // as an anchor (e.g. <div #vcRef>), a separate comment node would be created/located,
    // so we need to claim it here.
    markRNodeAsClaimedByHydration(commentNode, false);
  }
  lContainer[NATIVE] = commentNode;
  lContainer[DEHYDRATED_VIEWS] = dehydratedViews;
  return true;
}
function locateOrCreateAnchorNode(lContainer, hostLView, hostTNode, slotValue) {
  if (!_populateDehydratedViewsInLContainer(lContainer, hostTNode, hostLView)) {
    // Populating dehydrated views operation returned `false`, which indicates
    // that the logic was running in client-only mode, this an anchor comment
    // node should be created for this container.
    createAnchorNode(lContainer, hostLView, hostTNode, slotValue);
  }
}
export function enableLocateOrCreateContainerRefImpl() {
  _locateOrCreateAnchorNode = locateOrCreateAnchorNode;
  _populateDehydratedViewsInLContainer = populateDehydratedViewsInLContainerImpl;
}
//# sourceMappingURL=view_container_ref.js.map
