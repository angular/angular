/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {assertDomNode} from '../../util/assert';
import {assertLContainer, assertLView, assertLViewOrUndefined} from '../assert';
import {getLContext} from '../context_discovery';
import {TNode} from '../interfaces/node';
import {RComment, RElement} from '../interfaces/renderer';
import {LView, TVIEW} from '../interfaces/view';
import {destroyLView} from '../node_manipulation';
import {lContainerToViewContainer, viewContainerToLContainer, viewToLView} from '../util/view_utils';
import {getEmbeddedViewFactoryInternal, getLContainerViewIndex, getLContainerViewsCount, getLViewFromLContainerAt, getOrPromoteLViewChildToLContainer, insertLViewIntoLContainerBefore, removeLViewFromLContainer} from '../view';
import {EmbeddedViewFactory, View, ViewContainer} from './view_interface';

// TODO: The example below needs to be put in a proper `{@example}`.

/**
 * Gets an {@link EmbeddedViewFactory} that will produce an embedded view.
 * The DOM node that is provided should be a comment looking like `<!-- container -->`.
 * This is rendered to the DOM for an instruction such as `<ng-template>`.
 *
 * For example, given the following template...
 *
 * ```html
 * <div id="foo">
 *   <ng-template>I am from a template</ng-template>
 *   <span>{{someText}}</span>
 * </div>
 * ```
 *
 * ... you might have the following rendered DOM (represented here in HTML):
 *
 * ```html
 * <div id="foo">
 *  <!-- container -->
 *  <span>some text</span>
 * </div>
 * ```
 *
 * You can select the container's anchor node, and retrieve an embedded view factory:
 *
 * ```ts
 * const foo = document.querySelector('#foo');
 * const containerComment = foo.firstChild;
 * const embeddedViewFactory = getEmbeddedViewFactory(containerComment);
 * ```
 *
 * From there you can create a {@link View} by calling the factory with any valid
 * context for that view.
 *
 * ```ts
 * const view: View = viewFactory({ foo: 'bar' });
 * ```
 *
 * To insert this view, you would use {@link getViewContainer} to get a {@link ViewContainer}.
 * Then use {@link viewContainerInsertBefore} to insert the `view` into the `ViewContainer` instance.
 *
 * You retrieve a `ViewContainer` by getting passing a DOM element or comment to `getViewContainer`.
 * This will either retrieve an existing `ViewContainer` from that node, or attach a
 * new `ViewContainer` to that node and return that.
 *
 * Note that an element may already have a container sitting on it, and directives that are accessing
 * that container. Directives may access containers for the purpose of adding and removing views.
 *
 * Below we are just reusing the `containerComment` and attaching a new `ViewContainer` to it.
 *
 * ```ts
 * const viewContainer = getViewContainer(containerComment);
 * ```
 * Now we can insert the `View` into the `ViewContainer` with {@link viewContainerInsertBefore}.
 * This will insert all DOM for that view. Below we are appending the `view` as the
 * last view in `viewContainer`. Note that `viewContainer` was empty, but we're inserting
 * before `null`, which acts as an append.
 *
 * ```ts
 * // Append the view to the container.
 * viewContainerInsertBefore(viewContainer, view, null);
 * ```
 *
 * The resulting rendered DOM will look as follows (shown in HTML):
 *
 * ```html
 * <div id="foo">
 *   I am from a template.
 *   <span>some text</span>
 * </div>
 * ```
 *
 * @see viewContainerInsertBefore
 * @see getViewContainer
 * @see viewContainerRemove
 *
 * @param containerComment The DOM node to get the embedded view factory for.
 * @returns A function that will produce an embedded view.
 */
export function getEmbeddedViewFactory<T extends{}>(containerComment: RComment):
    EmbeddedViewFactory<T>|null {
  ngDevMode && assertDomNode(containerComment);
  const lContext = getLContext(containerComment);
  if (lContext) {
    const declarationLView = lContext.lView;
    const declarationTView = declarationLView[TVIEW];
    const declarationTNode = declarationTView.data[lContext.nodeIndex] as TNode;
    return getEmbeddedViewFactoryInternal<T>(declarationTNode, declarationLView) as any;
  }
  return null;
}

/**
 * Gets or creates an Angular view container from a DOM node
 *
 * Gets or creates a {@link ViewContainer} instance from a DOM node (e,g. `<!-- container -->`),
 * this is something generally added to the DOM by template instructions and other mechanisms that
 * use embedded views such as {@link ngIf} or {@link ngForOf}.
 * @param containerNative The DOM node to use to find the view container instance.
 */
export function getViewContainer(containerNative: RElement | RComment): ViewContainer|null {
  ngDevMode && assertDomNode(containerNative);
  const lContext = getLContext(containerNative);
  let viewContainer: ViewContainer|null = null;
  if (lContext) {
    const lView = lContext.lView;
    const nodeIndex = lContext.nodeIndex;
    const lContainer = getOrPromoteLViewChildToLContainer(lView, nodeIndex, containerNative);
    viewContainer = lContainerToViewContainer(lContainer);
  }
  return viewContainer;
}

/**
 * Inserts or appends a {@link View} into a {@link ViewContainer}.
 *
 * @param viewContainer The container to insert the view into.
 * @param view The view to insert into the container.
 * @param insertBeforeView The view in the container the inserted view should be inserted before. If
 * `null`, this will just append the `view` as the first view in the `viewContainer`.
 */
export function viewContainerInsertBefore(
    viewContainer: ViewContainer, view: View, insertBeforeView: View | null): void {
  ngDevMode && assertLContainer(viewContainer);
  ngDevMode && assertLView(view);
  ngDevMode && assertLViewOrUndefined(insertBeforeView);

  return insertLViewIntoLContainerBefore(
      viewContainerToLContainer(viewContainer), viewToLView(view),
      insertBeforeView as any as LView | null);
}

/**
 * Finds the index of an Angular view in an Angular view container.
 *
 * Searches the `viewContainer` for a given `view` and returns its index
 * within the container, if the `view` is not found, it returns `-1`.
 * @param viewContainer The container to search
 * @param view The view to search for
 * @returns The index of the view, or -1 if it's not found.
 */
export function viewContainerIndexOf(viewContainer: ViewContainer, view: View): number {
  ngDevMode && assertLContainer(viewContainer);
  ngDevMode && assertLView(view);
  return getLContainerViewIndex(viewContainer as any, view as any);
}

/**
 * Gets the number of Angular views in an Angular view Container
 *
 * Given a {@link ViewContainer}, will analyze the container and return the number of {@link View}s
 * it contains.
 *
 * @param viewContainer The view container to examine for length.
 */
export function viewContainerLength(viewContainer: ViewContainer): number {
  ngDevMode && assertLContainer(viewContainer);
  return getLContainerViewsCount(viewContainer as any);
}

/**
 * Retrieves an Angular view from an Angular view container by index.
 *
 * Gets an instance of an Angular {@link View} from an Angular {@link ViewContainer}
 * that exists at a given index within the container. If no view is found at that index,
 * will return `null`.
 *
 * @param viewContainer The container to get the view from
 * @param index The index of the view to retrieve within the container.
 * @returns The view at the index, or null if the index is out of range or no view is found.
 */
export function viewContainerGetAt(viewContainer: ViewContainer, index: number): View|null {
  ngDevMode && assertLContainer(viewContainer);
  return getLViewFromLContainerAt(viewContainer as any, index) as any;
}


/**
 * Removes an Angular view from an Angular view container
 *
 * Used to remove (embedded) views from a container. Will detach the view and destroy it, and will
 * also remove all DOM nodes associated with the view.
 *
 * By default, this will execute destruction logic for the view. This includes executing `onDestroy`
 * hooks associated with the view. To remove the view without executing destruction logic, pass
 * `false` to `shouldDestroy`. You may wish to do this if you are removing the view as part of the
 * process of simply moving the view to a new location in the view container.
 *
 * @param viewContainer The container to remove the view from
 * @param view The view to remove from the container
 * @param shouldDestroy Whether or not the view should be destroyed in the process.
 */
export function viewContainerRemove(
    viewContainer: ViewContainer, view: View, shouldDestroy: boolean): void {
  ngDevMode && assertLContainer(viewContainer);
  ngDevMode && assertLView(view);
  removeLViewFromLContainer(
      viewContainerToLContainer(viewContainer), viewToLView(view), shouldDestroy);
}

/**
 * Execute destruction logic for an Angular View
 *
 * Destroys the view and cleans up accompanying data structures Ivy uses to optimize
 * performance. Will also execute associated `onDestroy` hooks.
 *
 * @param view The view to destroy.
 */
export function viewDestroy(view: View): void {
  destroyLView(viewToLView(view));
}
