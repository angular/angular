/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectorRef as ViewEngine_ChangeDetectorRef} from '../change_detection/change_detector_ref';
import {Injector} from '../di/injector';
import {ComponentFactory as viewEngine_ComponentFactory, ComponentRef as viewEngine_ComponentRef} from '../linker/component_factory';
import {createElementRef, ElementRef as ViewEngine_ElementRef} from '../linker/element_ref';
import {NgModuleRef as viewEngine_NgModuleRef} from '../linker/ng_module_factory';
import {TemplateRef as ViewEngine_TemplateRef} from '../linker/template_ref';
import {ViewContainerRef as ViewEngine_ViewContainerRef} from '../linker/view_container_ref';
import {EmbeddedViewRef as viewEngine_EmbeddedViewRef, ViewRef as viewEngine_ViewRef} from '../linker/view_ref';
import {Renderer2} from '../render/api';
import {addToArray, removeFromArray} from '../util/array_utils';
import {assertEqual, assertGreaterThan, assertLessThan} from '../util/assert';

import {assertNodeInjector} from './assert';
import {getParentInjectorLocation, NodeInjector} from './di';
import {addToViewTree, createLContainer} from './instructions/shared';
import {CONTAINER_HEADER_OFFSET, LContainer, NATIVE, VIEW_REFS} from './interfaces/container';
import {NodeInjectorOffset} from './interfaces/injector';
import {TContainerNode, TDirectiveHostNode, TElementContainerNode, TElementNode, TNode, TNodeType} from './interfaces/node';
import {isProceduralRenderer, RComment, RElement} from './interfaces/renderer';
import {isComponentHost, isLContainer, isLView} from './interfaces/type_checks';
import {DECLARATION_COMPONENT_VIEW, LView, PARENT, RENDERER, T_HOST, TVIEW} from './interfaces/view';
import {assertTNodeType} from './node_assert';
import {addViewToContainer, destroyLView, detachView, getBeforeNodeForView, insertView, nativeInsertBefore, nativeNextSibling, nativeParentNode} from './node_manipulation';
import {getCurrentTNode, getLView} from './state';
import {getParentInjectorIndex, getParentInjectorView, hasParentInjector} from './util/injector_utils';
import {getComponentLViewByIndex, getNativeByTNode, unwrapRNode, viewAttachedToContainer} from './util/view_utils';
import {ViewRef} from './view_ref';



let R3ViewContainerRef: {
  new (
      lContainer: LContainer, hostTNode: TElementNode|TContainerNode|TElementContainerNode,
      hostView: LView): ViewEngine_ViewContainerRef
};

/**
 * Creates a ViewContainerRef and stores it on the injector. Or, if the ViewContainerRef
 * already exists, retrieves the existing ViewContainerRef.
 *
 * @returns The ViewContainerRef instance to use
 */
export function injectViewContainerRef(ViewContainerRefToken: typeof ViewEngine_ViewContainerRef):
    ViewEngine_ViewContainerRef {
  const previousTNode = getCurrentTNode() as TElementNode | TElementContainerNode | TContainerNode;
  return createContainerRef(ViewContainerRefToken, previousTNode, getLView());
}

/**
 * Creates a ViewContainerRef and stores it on the injector.
 *
 * @param ViewContainerRefToken The ViewContainerRef type
 * @param ElementRefToken The ElementRef type
 * @param hostTNode The node that is requesting a ViewContainerRef
 * @param hostView The view to which the node belongs
 * @returns The ViewContainerRef instance to use
 */
export function createContainerRef(
    ViewContainerRefToken: typeof ViewEngine_ViewContainerRef,
    hostTNode: TElementNode|TContainerNode|TElementContainerNode,
    hostView: LView): ViewEngine_ViewContainerRef {
  if (!R3ViewContainerRef) {
    R3ViewContainerRef = class ViewContainerRef extends ViewContainerRefToken {
      constructor(
          private _lContainer: LContainer,
          private _hostTNode: TElementNode|TContainerNode|TElementContainerNode,
          private _hostView: LView) {
        super();
      }

      get element(): ViewEngine_ElementRef {
        return createElementRef(this._hostTNode, this._hostView);
      }

      get injector(): Injector {
        return new NodeInjector(this._hostTNode, this._hostView);
      }

      /** @deprecated No replacement */
      get parentInjector(): Injector {
        const parentLocation = getParentInjectorLocation(this._hostTNode, this._hostView);
        if (hasParentInjector(parentLocation)) {
          const parentView = getParentInjectorView(parentLocation, this._hostView);
          const injectorIndex = getParentInjectorIndex(parentLocation);
          ngDevMode && assertNodeInjector(parentView, injectorIndex);
          const parentTNode =
              parentView[TVIEW].data[injectorIndex + NodeInjectorOffset.TNODE] as TElementNode;
          return new NodeInjector(parentTNode, parentView);
        } else {
          return new NodeInjector(null, this._hostView);
        }
      }

      clear(): void {
        while (this.length > 0) {
          this.remove(this.length - 1);
        }
      }

      get(index: number): viewEngine_ViewRef|null {
        return this._lContainer[VIEW_REFS] !== null && this._lContainer[VIEW_REFS]![index] || null;
      }

      get length(): number {
        return this._lContainer.length - CONTAINER_HEADER_OFFSET;
      }

      createEmbeddedView<C>(templateRef: ViewEngine_TemplateRef<C>, context?: C, index?: number):
          viewEngine_EmbeddedViewRef<C> {
        const viewRef = templateRef.createEmbeddedView(context || <any>{});
        this.insert(viewRef, index);
        return viewRef;
      }

      createComponent<C>(
          componentFactory: viewEngine_ComponentFactory<C>, index?: number|undefined,
          injector?: Injector|undefined, projectableNodes?: any[][]|undefined,
          ngModuleRef?: viewEngine_NgModuleRef<any>|undefined): viewEngine_ComponentRef<C> {
        const contextInjector = injector || this.parentInjector;
        if (!ngModuleRef && (componentFactory as any).ngModule == null && contextInjector) {
          // DO NOT REFACTOR. The code here used to have a `value || undefined` expression
          // which seems to cause internal google apps to fail. This is documented in the
          // following internal bug issue: go/b/142967802
          const result = contextInjector.get(viewEngine_NgModuleRef, null);
          if (result) {
            ngModuleRef = result;
          }
        }

        const componentRef =
            componentFactory.create(contextInjector, projectableNodes, undefined, ngModuleRef);
        this.insert(componentRef.hostView, index);
        return componentRef;
      }

      insert(viewRef: viewEngine_ViewRef, index?: number): viewEngine_ViewRef {
        const lView = (viewRef as ViewRef<any>)._lView!;
        const tView = lView[TVIEW];

        if (viewRef.destroyed) {
          throw new Error('Cannot insert a destroyed View in a ViewContainer!');
        }

        this.allocateContainerIfNeeded();

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
            const prevLContainer = lView[PARENT] as LContainer;
            ngDevMode &&
                assertEqual(
                    isLContainer(prevLContainer), true,
                    'An attached view should have its PARENT point to a container.');


            // We need to re-create a R3ViewContainerRef instance since those are not stored on
            // LView (nor anywhere else).
            const prevVCRef = new R3ViewContainerRef(
                prevLContainer, prevLContainer[T_HOST] as TDirectiveHostNode,
                prevLContainer[PARENT]);

            prevVCRef.detach(prevVCRef.indexOf(viewRef));
          }
        }

        // Logical operation of adding `LView` to `LContainer`
        const adjustedIdx = this._adjustIndex(index);
        const lContainer = this._lContainer;
        insertView(tView, lView, lContainer, adjustedIdx);

        // Physical operation of adding the DOM nodes.
        const beforeNode = getBeforeNodeForView(adjustedIdx, lContainer);
        const renderer = lView[RENDERER];
        const parentRNode = nativeParentNode(renderer, lContainer[NATIVE] as RElement | RComment);
        if (parentRNode !== null) {
          addViewToContainer(tView, lContainer[T_HOST], renderer, lView, parentRNode, beforeNode);
        }

        (viewRef as ViewRef<any>).attachToViewContainerRef(this);
        addToArray(lContainer[VIEW_REFS]!, adjustedIdx, viewRef);

        return viewRef;
      }

      move(viewRef: viewEngine_ViewRef, newIndex: number): viewEngine_ViewRef {
        if (viewRef.destroyed) {
          throw new Error('Cannot move a destroyed View in a ViewContainer!');
        }
        return this.insert(viewRef, newIndex);
      }

      indexOf(viewRef: viewEngine_ViewRef): number {
        const viewRefsArr = this._lContainer[VIEW_REFS];
        return viewRefsArr !== null ? viewRefsArr.indexOf(viewRef) : -1;
      }

      remove(index?: number): void {
        this.allocateContainerIfNeeded();
        const adjustedIdx = this._adjustIndex(index, -1);
        const detachedView = detachView(this._lContainer, adjustedIdx);

        if (detachedView) {
          // Before destroying the view, remove it from the container's array of `ViewRef`s.
          // This ensures the view container length is updated before calling
          // `destroyLView`, which could recursively call view container methods that
          // rely on an accurate container length.
          // (e.g. a method on this view container being called by a child directive's OnDestroy
          // lifecycle hook)
          removeFromArray(this._lContainer[VIEW_REFS]!, adjustedIdx);
          destroyLView(detachedView[TVIEW], detachedView);
        }
      }

      detach(index?: number): viewEngine_ViewRef|null {
        this.allocateContainerIfNeeded();
        const adjustedIdx = this._adjustIndex(index, -1);
        const view = detachView(this._lContainer, adjustedIdx);

        const wasDetached =
            view && removeFromArray(this._lContainer[VIEW_REFS]!, adjustedIdx) != null;
        return wasDetached ? new ViewRef(view!) : null;
      }

      private _adjustIndex(index?: number, shift: number = 0) {
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

      private allocateContainerIfNeeded(): void {
        if (this._lContainer[VIEW_REFS] === null) {
          this._lContainer[VIEW_REFS] = [];
        }
      }
    };
  }

  ngDevMode && assertTNodeType(hostTNode, TNodeType.AnyContainer | TNodeType.AnyRNode);

  let lContainer: LContainer;
  const slotValue = hostView[hostTNode.index];
  if (isLContainer(slotValue)) {
    // If the host is a container, we don't need to create a new LContainer
    lContainer = slotValue;
  } else {
    let commentNode: RComment;
    // If the host is an element container, the native host element is guaranteed to be a
    // comment and we can reuse that comment as anchor element for the new LContainer.
    // The comment node in question is already part of the DOM structure so we don't need to append
    // it again.
    if (hostTNode.type & TNodeType.ElementContainer) {
      commentNode = unwrapRNode(slotValue) as RComment;
    } else {
      // If the host is a regular element, we have to insert a comment node manually which will
      // be used as an anchor when inserting elements. In this specific case we use low-level DOM
      // manipulation to insert it.
      const renderer = hostView[RENDERER];
      ngDevMode && ngDevMode.rendererCreateComment++;
      commentNode = renderer.createComment(ngDevMode ? 'container' : '');

      const hostNative = getNativeByTNode(hostTNode, hostView)!;
      const parentOfHostNative = nativeParentNode(renderer, hostNative);
      nativeInsertBefore(
          renderer, parentOfHostNative!, commentNode, nativeNextSibling(renderer, hostNative),
          false);
    }

    hostView[hostTNode.index] = lContainer =
        createLContainer(slotValue, hostView, commentNode, hostTNode);

    addToViewTree(hostView, lContainer);
  }

  return new R3ViewContainerRef(lContainer, hostTNode, hostView);
}


/** Returns a ChangeDetectorRef (a.k.a. a ViewRef) */
export function injectChangeDetectorRef(isPipe = false): ViewEngine_ChangeDetectorRef {
  return createViewRef(getCurrentTNode()!, getLView(), isPipe);
}

/**
 * Creates a ViewRef and stores it on the injector as ChangeDetectorRef (public alias).
 *
 * @param tNode The node that is requesting a ChangeDetectorRef
 * @param lView The view to which the node belongs
 * @param isPipe Whether the view is being injected into a pipe.
 * @returns The ChangeDetectorRef to use
 */
function createViewRef(tNode: TNode, lView: LView, isPipe: boolean): ViewEngine_ChangeDetectorRef {
  // `isComponentView` will be true for Component and Directives (but not for Pipes).
  // See https://github.com/angular/angular/pull/33072 for proper fix
  const isComponentView = !isPipe && isComponentHost(tNode);
  if (isComponentView) {
    // The LView represents the location where the component is declared.
    // Instead we want the LView for the component View and so we need to look it up.
    const componentView = getComponentLViewByIndex(tNode.index, lView);  // look down
    return new ViewRef(componentView, componentView);
  } else if (tNode.type & (TNodeType.AnyRNode | TNodeType.AnyContainer | TNodeType.Icu)) {
    // The LView represents the location where the injection is requested from.
    // We need to locate the containing LView (in case where the `lView` is an embedded view)
    const hostComponentView = lView[DECLARATION_COMPONENT_VIEW];  // look up
    return new ViewRef(hostComponentView, lView);
  }
  return null!;
}

/** Returns a Renderer2 (or throws when application was bootstrapped with Renderer3) */
function getOrCreateRenderer2(view: LView): Renderer2 {
  const renderer = view[RENDERER];
  if (isProceduralRenderer(renderer)) {
    return renderer as Renderer2;
  } else {
    throw new Error('Cannot inject Renderer2 when the application uses Renderer3!');
  }
}

/** Injects a Renderer2 for the current component. */
export function injectRenderer2(): Renderer2 {
  // We need the Renderer to be based on the component that it's being injected into, however since
  // DI happens before we've entered its view, `getLView` will return the parent view instead.
  const lView = getLView();
  const tNode = getCurrentTNode()!;
  const nodeAtIndex = getComponentLViewByIndex(tNode.index, lView);
  return getOrCreateRenderer2(isLView(nodeAtIndex) ? nodeAtIndex : lView);
}
