/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertDomNode, assertEqual} from '../util/assert';

import {assertLContainer, assertLView, assertLViewOrUndefined} from './assert';
import {getLContext} from './context_discovery';
import {assignTViewNodeToLView, createLContainer, createLView, renderEmbeddedTemplate} from './instructions';
import {ACTIVE_INDEX, LContainer, NATIVE, VIEWS} from './interfaces/container';
import {TNode, TNodeType} from './interfaces/node';
import {RComment, RElement, RNode} from './interfaces/renderer';
import {DECLARATION_VIEW, EmbeddedViewFactory, EmbeddedViewFactoryInternal, HOST, LView, LViewFlags, QUERIES, RENDERER, TVIEW, View, ViewContainer} from './interfaces/view';
import {addRemoveViewFromContainer, destroyLView, detachView, insertLContainerIntoParentLView, insertView, nativeNextSibling} from './node_manipulation';
import {getAddingEmbeddedRootChild, getIsParent, getPreviousOrParentTNode, setAddingEmbeddedRootChild, setIsParent, setPreviousOrParentTNode, shouldUseIvyAnimationCheck} from './state';
import {getLastRootElementFromView, lContainerToViewContainer, unwrapLContainer, unwrapRNode, viewContainerToLContainer, viewToLView} from './util/view_utils';



// TODO: The example below needs to be put in a proper `{@example}`.

/**
 * Gets an {@link EmbeddedViewFactory} that will produce an embedded view.
 * The DOM node that is provided should be a comment looking like `<!-- container -->`.
 * This is rendered to the DOM for an instruction such as `<ng-template>`.
 *
 * For example, given the following template:
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
 * You can select the container's anchor node, and retrieve an embedded view factory like so:
 *
 * ```ts
 * const foo = document.querySelector('#foo');
 * const containerComment = foo.firstChild;
 * const embeddedViewFactory = getEmbeddedViewFactory(containerComment);
 * ```
 *
 * From there you can get an embedded {@link View} by calling the factory with any valid context for that view.
 *
 * ```ts
 * const embeddedView: View = embeddedViewFactory({ foo: 'bar' });
 * ```
 *
 * To insert or review this embedded view, you would use {@link getViewContainer} to get a {@link ViewContainer}.
 * Then use {@link viewContainerInsertAfter} to insert the `embeddedView` into the `ViewContainer` instance.
 *
 * You retrieve a `ViewContainer` similarly from a `<!-- container -->` comment node.
 * In this example we can just reuse the one comment node we already have:
 *
 * ```ts
 * const viewContainer = getViewContainer(containerComment);
 * ```
 *
 * ...now we can insert the embedded view's DOM like so:
 *
 * ```ts
 * // Append the view to the container.
 * viewContainerInsertAfter(viewContainer, embeddedView, null);
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
 * @see viewContainerInsertAfter
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
 * The internal implementation for {@link getEmbeddedViewFactory}.
 *
 * @param declarationTNode The template node where the embedded template was declared
 * @param declarationLView The local view where the embedded template was declared
 */
export function getEmbeddedViewFactoryInternal<T extends{}>(
    declarationTNode: TNode, declarationLView: LView): EmbeddedViewFactoryInternal<T>|null {
  const templateTView = declarationTNode.tViews;
  if (templateTView) {
    if (Array.isArray(templateTView)) {
      throw new Error('Array of TViews not supported');
    }

    return function embeddedViewFactory(context: T) {
      const _isParent = getIsParent();
      const _previousOrParentTNode = getPreviousOrParentTNode();
      const _useIvyAnimationCheck = shouldUseIvyAnimationCheck();
      const _addingEmbeddedRootChild = _useIvyAnimationCheck && getAddingEmbeddedRootChild();
      try {
        setIsParent(true);
        setPreviousOrParentTNode(null !);
        setAddingEmbeddedRootChild(true);
        const lView = createLView(
            declarationLView, templateTView, context, LViewFlags.CheckAlways, null, null);
        lView[DECLARATION_VIEW] = declarationLView;

        // TODO: Because the embedded view is always embedded into a container, this should be
        // always true. Perhaps the declarationTNode type should be adjusted to be TContainerNode
        if (declarationTNode.type === TNodeType.Container) {
          const declarationContainer = unwrapLContainer(declarationLView[declarationTNode.index]) !;
          ngDevMode && assertLContainer(declarationContainer);
          const declarationQueries = declarationContainer[QUERIES];
          if (declarationQueries) {
            lView[QUERIES] = declarationQueries.createView();
          }
        }

        assignTViewNodeToLView(templateTView, null, -1, lView);

        if (templateTView.firstTemplatePass) {
          templateTView.node !.injectorIndex = declarationTNode.injectorIndex;
        }

        renderEmbeddedTemplate(lView, templateTView, context);

        return lView;
      } finally {
        _useIvyAnimationCheck && setAddingEmbeddedRootChild(_addingEmbeddedRootChild);
        setIsParent(_isParent);
        setPreviousOrParentTNode(_previousOrParentTNode);
      }
    };
  }
  return null;
}

/**
 * Gets a {@link ViewContainer} instance from a container comment DOM node (`<!-- container -->`),
 * this is something generally added to the DOM by template instructions and other mechanisms that
 * use embedded views such as {@link ngIf} or {@link ngForOf}.
 * @param containerComment The DOM node to use to find the view container instance.
 */
export function getViewContainer(containerComment: RComment): ViewContainer|null {
  ngDevMode && assertDomNode(containerComment);
  const lContext = getLContext(containerComment);
  let viewContainer: ViewContainer|null = null;
  if (lContext) {
    const lView = lContext.lView;
    const nodeIndex = lContext.nodeIndex;
    const lViewContainerOrElement: LContainer|RNode = lView[nodeIndex];
    let lContainer = unwrapLContainer(lViewContainerOrElement);
    if (!lContainer) {
      lContainer = lView[nodeIndex] = createLContainer(
          lViewContainerOrElement as RElement | RComment, lView,
          lViewContainerOrElement as RComment, true);
      insertLContainerIntoParentLView(lView, lContainer);
      const queries = lView[QUERIES];
      if (queries) {
        lContainer[QUERIES] = queries.container();
      }
    }
    viewContainer = lContainerToViewContainer(lContainer);
  }
  return viewContainer;
}


/**
 * Inserts or appends a {@link View} into a {@link ViewContainer}.
 *
 * @param viewContainer The container to insert the view into.
 * @param view The view to insert into the container.
 * @param insertAfterView The view in the container the inserted view should be inserted after. If
 * `null`, this will just append the `view` as the last view in the `viewContainer`.
 */
export function viewContainerInsertAfter(
    viewContainer: ViewContainer, view: View, insertAfterView: View | null): void {
  ngDevMode && assertLContainer(viewContainer);
  ngDevMode && assertLView(view);
  ngDevMode && assertLViewOrUndefined(insertAfterView);

  return viewContainerInsertAfterInternal(
      viewContainerToLContainer(viewContainer), viewToLView(view),
      insertAfterView as any as LView | null);
}

/**
 * The internal implementation of {@link viewContainerInsertAfter}.
 *
 * @param lContainer The container to insert the view into
 * @param lView The view to insert into the container
 * @param insertAfterLView The optional view in the container that the inserted view should be
 * inserted behind. If `null`, we will insert the view at the end of the container.
 */
function viewContainerInsertAfterInternal(
    lContainer: LContainer, lView: LView, insertAfterLView: LView | null) {
  const _inContainer = getAddingEmbeddedRootChild();
  try {
    setAddingEmbeddedRootChild(true);
    const commentNode = lContainer[NATIVE];

    // Because we're dynamically adding a view to the container, we reset the ACTIVE_INDEX to ensure
    // the container is updated.
    lContainer[ACTIVE_INDEX] = -1;

    const insertAfterNode =
        insertAfterLView ? getLastRootElementFromView(insertAfterLView) : commentNode;
    ngDevMode && assertDomNode(insertAfterNode);
    const tView = lView[TVIEW];
    let tNode = tView.firstChild;

    const index =
        insertAfterLView ? viewContainerIndexOfInternal(lContainer, insertAfterLView) + 1 : 0;
    insertView(lView, lContainer, index);

    const renderer = lView[RENDERER];
    const beforeNode = nativeNextSibling(renderer, insertAfterNode);
    ngDevMode && assertEqual(tNode && tNode.parent, null, 'tNode parent should be null');

    addRemoveViewFromContainer(lView, true, beforeNode);
  } finally {
    setAddingEmbeddedRootChild(_inContainer);
  }
}

/**
 * Searches the `viewContainer` for a the first instance of a given `view` and returns its index
 * within the container, if the `view` is not found, it returns `-1`.
 * @param viewContainer The container to search
 * @param view The view to search for
 */
export function viewContainerIndexOf(viewContainer: ViewContainer, view: View): number {
  ngDevMode && assertLContainer(viewContainer);
  ngDevMode && assertLView(view);

  return viewContainerIndexOfInternal(viewContainer as any, view as any);
}

function viewContainerIndexOfInternal(lContainer: LContainer, lView: LView) {
  const views = lContainer[VIEWS] as LView[];
  if (views) {
    for (let i = 0; i < views.length; i++) {
      if (lView === views[i]) return i;
    }
  }
  return -1;
}

/**
 * Used to remove (embedded) views from a container. Will detach the view and destroy it, and will
 * also remove all DOM nodes associated with the view.
 *
 * @param viewContainer The container to remove the view from
 * @param view The view to remove from the container
 * @param shouldDestroy Whether or not the view should be destroyed in the process.
 */
export function viewContainerRemove(
    viewContainer: ViewContainer, view: View, shouldDestroy: boolean = true): void {
  viewContainerRemoveInternal(
      viewContainerToLContainer(viewContainer), viewToLView(view), shouldDestroy);
}

/**
 * The internal implementation of {@link viewContainerRemove}
 * @param lContainer The container to remove the view from
 * @param lView The view to remove
 * @param shouldDestroy Whether or not the view should be destroyed in the process.
 */
export function viewContainerRemoveInternal(
    lContainer: LContainer, lView: LView, shouldDestroy: boolean): void {
  const index = viewContainerIndexOfInternal(lContainer, lView);
  if (index >= 0) {
    detachView(lContainer, index);
    shouldDestroy && destroyLView(lView);
  }
}

/**
 * Gets the number of views in the container.
 * @param viewContainer The view container examine for length.
 */
export function viewContainerLength(viewContainer: ViewContainer): number {
  ngDevMode && assertLContainer(viewContainer);
  return viewContainerLengthInternal(viewContainer as any);
}

function viewContainerLengthInternal(lContainer: LContainer): number {
  const views = lContainer[VIEWS];
  return Array.isArray(views) ? views.length : 0;
}

/**
 * Retrieves a view from a container by index.
 * @param viewContainer The container to get the view from
 * @param index The index of the view to retrieve within the container.
 */
export function viewContainerGet(viewContainer: ViewContainer, index: number): View|null {
  ngDevMode && assertLContainer(viewContainer);
  const lView = viewContainerGetInternal(viewContainer as any, index);
  return lView as any;
}

function viewContainerGetInternal(lContainer: LContainer, index: number): LView|null {
  return lContainer[VIEWS][index] || null;
}

/**
 * Destroys the view and cleans up accompanying data structures Ivy uses to optimize
 * performance.
 *
 * @param view The view to destroy.
 */
export function viewDestroy(view: View): void {
  destroyLView(viewToLView(view));
}
