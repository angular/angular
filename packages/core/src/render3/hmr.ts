/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Type} from '../interface/type';
import {assertDefined, assertNotEqual} from '../util/assert';
import {assertLView} from './assert';
import {getComponentDef} from './def_getters';
import {assertComponentDef} from './errors';
import {refreshView} from './instructions/change_detection';
import {renderView} from './instructions/render';
import {
  createLView,
  getInitialLViewFlagsFromDef,
  getOrCreateComponentTView,
} from './instructions/shared';
import {CONTAINER_HEADER_OFFSET} from './interfaces/container';
import {ComponentDef} from './interfaces/definition';
import {getTrackedLViews} from './interfaces/lview_tracking';
import {isTNodeShape, TElementNode, TNodeFlags, TNodeType} from './interfaces/node';
import {isLContainer, isLView} from './interfaces/type_checks';
import {
  CHILD_HEAD,
  CHILD_TAIL,
  CONTEXT,
  ENVIRONMENT,
  FLAGS,
  HEADER_OFFSET,
  HOST,
  INJECTOR,
  LView,
  LViewFlags,
  NEXT,
  PARENT,
  RENDERER,
  T_HOST,
  TVIEW,
} from './interfaces/view';
import {assertTNodeType} from './node_assert';
import {destroyLView, removeViewFromDOM} from './node_manipulation';
import {RendererFactory} from './interfaces/renderer';
import {NgZone} from '../zone';
import {ViewEncapsulation} from '../metadata/view';

/**
 * Replaces the metadata of a component type and re-renders all live instances of the component.
 * @param type Class whose metadata will be replaced.
 * @param applyMetadata Callback that will apply a new set of metadata on the `type` when invoked.
 * @param environment Syntehtic namespace imports that need to be passed along to the callback.
 * @param locals Local symbols from the source location that have to be exposed to the callback.
 * @codeGenApi
 */
export function ɵɵreplaceMetadata(
  type: Type<unknown>,
  applyMetadata: (...args: [Type<unknown>, unknown[], ...unknown[]]) => void,
  namespaces: unknown[],
  locals: unknown[],
) {
  ngDevMode && assertComponentDef(type);
  const oldDef = getComponentDef(type)!;

  // The reason `applyMetadata` is a callback that is invoked (almost) immediately is because
  // the compiler usually produces more code than just the component definition, e.g. there
  // can be functions for embedded views, the variables for the constant pool and `setClassMetadata`
  // calls. The callback allows us to keep them isolate from the rest of the app and to invoke
  // them at the right time.
  applyMetadata.apply(null, [type, namespaces, ...locals]);

  // If a `tView` hasn't been created yet, it means that this component hasn't been instantianted
  // before. In this case there's nothing left for us to do aside from patching it in.
  if (oldDef.tView) {
    const trackedViews = getTrackedLViews().values();
    for (const root of trackedViews) {
      // Note: we have the additional check, because `IsRoot` can also indicate
      // a component created through something like `createComponent`.
      if (root[FLAGS] & LViewFlags.IsRoot && root[PARENT] === null) {
        recreateMatchingLViews(oldDef, root);
      }
    }
  }
}

/**
 * Finds all LViews matching a specific component definition and recreates them.
 * @param oldDef Component definition to search for.
 * @param rootLView View from which to start the search.
 */
function recreateMatchingLViews(oldDef: ComponentDef<unknown>, rootLView: LView): void {
  ngDevMode &&
    assertDefined(
      oldDef.tView,
      'Expected a component definition that has been instantiated at least once',
    );

  const tView = rootLView[TVIEW];

  // Use `tView` to match the LView since `instanceof` can
  // produce false positives when using inheritance.
  if (tView === oldDef.tView) {
    ngDevMode && assertComponentDef(oldDef.type);
    recreateLView(getComponentDef(oldDef.type)!, oldDef, rootLView);
    return;
  }

  for (let i = HEADER_OFFSET; i < tView.bindingStartIndex; i++) {
    const current = rootLView[i];

    if (isLContainer(current)) {
      // The host can be an LView if a component is injecting `ViewContainerRef`.
      if (isLView(current[HOST])) {
        recreateMatchingLViews(oldDef, current[HOST]);
      }

      for (let j = CONTAINER_HEADER_OFFSET; j < current.length; j++) {
        recreateMatchingLViews(oldDef, current[j]);
      }
    } else if (isLView(current)) {
      recreateMatchingLViews(oldDef, current);
    }
  }
}

/**
 * Removes any cached renderers from the factory for the provided type.
 * This is currently used by the HMR logic to ensure Renderers are kept
 * synchronized with any definition metadata updates.
 * @param factory A RendererFactory2 instance.
 * @param def A ComponentDef instance.
 */
function clearRendererCache(factory: RendererFactory, def: ComponentDef<unknown>) {
  // Cast to read a private field.
  // NOTE: This must be kept synchronized with the renderer factory implementation in
  // platform-browser and platform-browser/animations.
  (factory as {componentReplaced?: (id: string) => void}).componentReplaced?.(def.id);
}

/**
 * Recreates an LView in-place from a new component definition.
 * @param newDef Definition from which to recreate the view.
 * @param oldDef Previous component definition being swapped out.
 * @param lView View to be recreated.
 */
function recreateLView(
  newDef: ComponentDef<unknown>,
  oldDef: ComponentDef<unknown>,
  lView: LView<unknown>,
): void {
  const instance = lView[CONTEXT];
  let host = lView[HOST]! as HTMLElement;
  // In theory the parent can also be an LContainer, but it appears like that's
  // only the case for embedded views which we won't be replacing here.
  const parentLView = lView[PARENT] as LView;
  ngDevMode && assertLView(parentLView);
  const tNode = lView[T_HOST] as TElementNode;
  ngDevMode && assertTNodeType(tNode, TNodeType.Element);
  ngDevMode && assertNotEqual(newDef, oldDef, 'Expected different component definition');
  const zone = lView[INJECTOR].get(NgZone, null);
  const recreate = () => {
    // If we're recreating a component with shadow DOM encapsulation, it will have attached a
    // shadow root. The browser will throw if we attempt to attach another one and there's no way
    // to detach it. Our only option is to make a clone only of the root node, replace the node
    // with the clone and use it for the newly-created LView.
    if (oldDef.encapsulation === ViewEncapsulation.ShadowDom) {
      const newHost = host.cloneNode(false) as HTMLElement;
      host.replaceWith(newHost);
      host = newHost;
    }

    // Recreate the TView since the template might've changed.
    const newTView = getOrCreateComponentTView(newDef);

    // Create a new LView from the new TView, but reusing the existing TNode and DOM node.
    const newLView = createLView(
      parentLView,
      newTView,
      instance,
      getInitialLViewFlagsFromDef(newDef),
      host,
      tNode,
      null,
      null, // The renderer will be created a bit further down once the old one is destroyed.
      null,
      null,
      null,
    );

    // Detach the LView from its current place in the tree so we don't
    // start traversing any siblings and modifying their structure.
    replaceLViewInTree(parentLView, lView, newLView, tNode.index);

    // Destroy the detached LView.
    destroyLView(lView[TVIEW], lView);

    // Always force the creation of a new renderer to ensure state captured during construction
    // stays consistent with the new component definition by clearing any old ached factories.
    const rendererFactory = lView[ENVIRONMENT].rendererFactory;
    clearRendererCache(rendererFactory, oldDef);

    // Patch a brand-new renderer onto the new view only after the old
    // view is destroyed so that the runtime doesn't try to reuse it.
    newLView[RENDERER] = rendererFactory.createRenderer(host, newDef);

    // Remove the nodes associated with the destroyed LView. This removes the
    // descendants, but not the host which we want to stay in place.
    removeViewFromDOM(lView[TVIEW], lView);

    // Reset the content projection state of the TNode before the first render.
    // Note that this has to happen after the LView has been destroyed or we
    // risk some projected nodes not being removed correctly.
    resetProjectionState(tNode);

    // Creation pass for the new view.
    renderView(newTView, newLView, instance);

    // Update pass for the new view.
    refreshView(newTView, newLView, newTView.template, instance);
  };

  // The callback isn't guaranteed to be inside the Zone so we need to bring it in ourselves.
  if (zone === null) {
    recreate();
  } else {
    zone.run(recreate);
  }
}

/**
 * Replaces one LView in the tree with another one.
 * @param parentLView Parent of the LView being replaced.
 * @param oldLView LView being replaced.
 * @param newLView Replacement LView to be inserted.
 * @param index Index at which the LView should be inserted.
 */
function replaceLViewInTree(
  parentLView: LView,
  oldLView: LView,
  newLView: LView,
  index: number,
): void {
  // Update the sibling whose `NEXT` pointer refers to the old view.
  for (let i = HEADER_OFFSET; i < parentLView[TVIEW].bindingStartIndex; i++) {
    const current = parentLView[i];

    if ((isLView(current) || isLContainer(current)) && current[NEXT] === oldLView) {
      current[NEXT] = newLView;
      break;
    }
  }

  // Set the new view as the head, if the old view was first.
  if (parentLView[CHILD_HEAD] === oldLView) {
    parentLView[CHILD_HEAD] = newLView;
  }

  // Set the new view as the tail, if the old view was last.
  if (parentLView[CHILD_TAIL] === oldLView) {
    parentLView[CHILD_TAIL] = newLView;
  }

  // Update the `NEXT` pointer to the same as the old view.
  newLView[NEXT] = oldLView[NEXT];

  // Clear out the `NEXT` of the old view.
  oldLView[NEXT] = null;

  // Insert the new LView at the correct index.
  parentLView[index] = newLView;
}

/**
 * Child nodes mutate the `projection` state of their parent node as they're being projected.
 * This function resets the `project` back to its initial state.
 * @param tNode
 */
function resetProjectionState(tNode: TElementNode): void {
  // The `projection` is mutated by child nodes as they're being projected. We need to
  // reset it to the initial state so projection works after the template is swapped out.
  if (tNode.projection !== null) {
    for (const current of tNode.projection) {
      if (isTNodeShape(current)) {
        // Reset `projectionNext` since it can affect the traversal order during projection.
        current.projectionNext = null;
        current.flags &= ~TNodeFlags.isProjected;
      }
    }
    tNode.projection = null;
  }
}
