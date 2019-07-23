/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectorRef as ViewEngine_ChangeDetectorRef} from '../change_detection/change_detector_ref';
import {Injector} from '../di/injector';
import {ComponentFactory as viewEngine_ComponentFactory, ComponentRef as viewEngine_ComponentRef} from '../linker/component_factory';
import {ElementRef as ViewEngine_ElementRef} from '../linker/element_ref';
import {NgModuleRef as viewEngine_NgModuleRef} from '../linker/ng_module_factory';
import {TemplateRef as ViewEngine_TemplateRef} from '../linker/template_ref';
import {ViewContainerRef as ViewEngine_ViewContainerRef} from '../linker/view_container_ref';
import {EmbeddedViewRef as viewEngine_EmbeddedViewRef, ViewRef as viewEngine_ViewRef} from '../linker/view_ref';
import {Renderer2} from '../render/api';
import {addToArray, removeFromArray} from '../util/array_utils';
import {assertDefined, assertGreaterThan, assertLessThan} from '../util/assert';
import {assertLContainer} from './assert';
import {NodeInjector, getParentInjectorLocation} from './di';
import {addToViewTree, createEmbeddedViewAndNode, createLContainer, renderEmbeddedTemplate} from './instructions/shared';
import {ACTIVE_INDEX, CONTAINER_HEADER_OFFSET, LContainer, VIEW_REFS} from './interfaces/container';
import {TContainerNode, TElementContainerNode, TElementNode, TNode, TNodeType, TViewNode} from './interfaces/node';
import {RComment, RElement, isProceduralRenderer} from './interfaces/renderer';

import {isComponent, isLContainer, isLView, isRootView} from './interfaces/type_checks';
import {CONTEXT, DECLARATION_LCONTAINER, LView, QUERIES, RENDERER, TView, T_HOST} from './interfaces/view';

import {assertNodeOfPossibleTypes} from './node_assert';
import {addRemoveViewFromContainer, appendChild, detachView, getBeforeNodeForView, insertView, nativeInsertBefore, nativeNextSibling, nativeParentNode, removeView} from './node_manipulation';
import {getParentInjectorTNode} from './node_util';
import {getLView, getPreviousOrParentTNode} from './state';
import {getParentInjectorView, hasParentInjector} from './util/injector_utils';
import {findComponentView} from './util/view_traversal_utils';
import {getComponentViewByIndex, getNativeByTNode, unwrapRNode, viewAttachedToContainer} from './util/view_utils';
import {ViewRef} from './view_ref';



/**
 * Creates an ElementRef from the most recent node.
 *
 * @returns The ElementRef instance to use
 */
export function injectElementRef(ElementRefToken: typeof ViewEngine_ElementRef):
    ViewEngine_ElementRef {
  return createElementRef(ElementRefToken, getPreviousOrParentTNode(), getLView());
}

let R3ElementRef: {new (native: RElement | RComment): ViewEngine_ElementRef};

/**
 * Creates an ElementRef given a node.
 *
 * @param ElementRefToken The ElementRef type
 * @param tNode The node for which you'd like an ElementRef
 * @param view The view to which the node belongs
 * @returns The ElementRef instance to use
 */
export function createElementRef(
    ElementRefToken: typeof ViewEngine_ElementRef, tNode: TNode,
    view: LView): ViewEngine_ElementRef {
  if (!R3ElementRef) {
    // TODO: Fix class name, should be ElementRef, but there appears to be a rollup bug
    R3ElementRef = class ElementRef_ extends ElementRefToken {};
  }
  return new R3ElementRef(getNativeByTNode(tNode, view) as RElement);
}

let R3TemplateRef: {
  new (_declarationParentView: LView, hostTNode: TContainerNode, elementRef: ViewEngine_ElementRef):
      ViewEngine_TemplateRef<any>
};

/**
 * Creates a TemplateRef given a node.
 *
 * @returns The TemplateRef instance to use
 */
export function injectTemplateRef<T>(
    TemplateRefToken: typeof ViewEngine_TemplateRef,
    ElementRefToken: typeof ViewEngine_ElementRef): ViewEngine_TemplateRef<T>|null {
  return createTemplateRef<T>(
      TemplateRefToken, ElementRefToken, getPreviousOrParentTNode(), getLView());
}

/**
 * Creates a TemplateRef and stores it on the injector.
 *
 * @param TemplateRefToken The TemplateRef type
 * @param ElementRefToken The ElementRef type
 * @param hostTNode The node on which a TemplateRef is requested
 * @param hostView The view to which the node belongs
 * @returns The TemplateRef instance or null if we can't create a TemplateRef on a given node type
 */
export function createTemplateRef<T>(
    TemplateRefToken: typeof ViewEngine_TemplateRef, ElementRefToken: typeof ViewEngine_ElementRef,
    hostTNode: TNode, hostView: LView): ViewEngine_TemplateRef<T>|null {
  if (!R3TemplateRef) {
    // TODO: Fix class name, should be TemplateRef, but there appears to be a rollup bug
    R3TemplateRef = class TemplateRef_<T> extends TemplateRefToken<T> {
      constructor(
          private _declarationView: LView, private _declarationTContainer: TContainerNode,
          readonly elementRef: ViewEngine_ElementRef) {
        super();
      }

      createEmbeddedView(context: T): viewEngine_EmbeddedViewRef<T> {
        const embeddedTView = this._declarationTContainer.tViews as TView;
        const lView = createEmbeddedViewAndNode(
            embeddedTView, context, this._declarationView,
            this._declarationTContainer.injectorIndex);

        const declarationLContainer = this._declarationView[this._declarationTContainer.index];
        ngDevMode && assertLContainer(declarationLContainer);
        lView[DECLARATION_LCONTAINER] = declarationLContainer;

        const declarationViewLQueries = this._declarationView[QUERIES];
        if (declarationViewLQueries !== null) {
          lView[QUERIES] = declarationViewLQueries.createEmbeddedView(embeddedTView);
        }

        renderEmbeddedTemplate(lView, embeddedTView, context);
        const viewRef = new ViewRef(lView, context, -1);
        viewRef._tViewNode = lView[T_HOST] as TViewNode;
        return viewRef;
      }
    };
  }

  if (hostTNode.type === TNodeType.Container) {
    ngDevMode && assertDefined(hostTNode.tViews, 'TView must be allocated');
    return new R3TemplateRef(
        hostView, hostTNode as TContainerNode,
        createElementRef(ElementRefToken, hostTNode, hostView));
  } else {
    return null;
  }
}

let R3ViewContainerRef: {
  new (
      lContainer: LContainer, hostTNode: TElementNode | TContainerNode | TElementContainerNode,
      hostView: LView): ViewEngine_ViewContainerRef
};

/**
 * Creates a ViewContainerRef and stores it on the injector. Or, if the ViewContainerRef
 * already exists, retrieves the existing ViewContainerRef.
 *
 * @returns The ViewContainerRef instance to use
 */
export function injectViewContainerRef(
    ViewContainerRefToken: typeof ViewEngine_ViewContainerRef,
    ElementRefToken: typeof ViewEngine_ElementRef): ViewEngine_ViewContainerRef {
  const previousTNode =
      getPreviousOrParentTNode() as TElementNode | TElementContainerNode | TContainerNode;
  return createContainerRef(ViewContainerRefToken, ElementRefToken, previousTNode, getLView());
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
    ElementRefToken: typeof ViewEngine_ElementRef,
    hostTNode: TElementNode|TContainerNode|TElementContainerNode,
    hostView: LView): ViewEngine_ViewContainerRef {
  if (!R3ViewContainerRef) {
    // TODO: Fix class name, should be ViewContainerRef, but there appears to be a rollup bug
    R3ViewContainerRef = class ViewContainerRef_ extends ViewContainerRefToken {
      constructor(
          private _lContainer: LContainer,
          private _hostTNode: TElementNode|TContainerNode|TElementContainerNode,
          private _hostView: LView) {
        super();
      }

      get element(): ViewEngine_ElementRef {
        return createElementRef(ElementRefToken, this._hostTNode, this._hostView);
      }

      get injector(): Injector { return new NodeInjector(this._hostTNode, this._hostView); }

      /** @deprecated No replacement */
      get parentInjector(): Injector {
        const parentLocation = getParentInjectorLocation(this._hostTNode, this._hostView);
        const parentView = getParentInjectorView(parentLocation, this._hostView);
        const parentTNode = getParentInjectorTNode(parentLocation, this._hostView, this._hostTNode);

        return !hasParentInjector(parentLocation) || parentTNode == null ?
            new NodeInjector(null, this._hostView) :
            new NodeInjector(parentTNode, parentView);
      }

      clear(): void {
        while (this.length > 0) {
          this.remove(this.length - 1);
        }
      }

      get(index: number): viewEngine_ViewRef|null {
        return this._lContainer[VIEW_REFS] !== null && this._lContainer[VIEW_REFS] ![index] || null;
      }

      get length(): number { return this._lContainer.length - CONTAINER_HEADER_OFFSET; }

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
          ngModuleRef = contextInjector.get(viewEngine_NgModuleRef, null);
        }

        const componentRef =
            componentFactory.create(contextInjector, projectableNodes, undefined, ngModuleRef);
        this.insert(componentRef.hostView, index);
        return componentRef;
      }

      insert(viewRef: viewEngine_ViewRef, index?: number): viewEngine_ViewRef {
        if (viewRef.destroyed) {
          throw new Error('Cannot insert a destroyed View in a ViewContainer!');
        }
        this.allocateContainerIfNeeded();
        const lView = (viewRef as ViewRef<any>)._lView !;
        const adjustedIdx = this._adjustIndex(index);

        if (viewAttachedToContainer(lView)) {
          // If view is already attached, fall back to move() so we clean up
          // references appropriately.
          return this.move(viewRef, adjustedIdx);
        }

        insertView(lView, this._lContainer, adjustedIdx);

        const beforeNode = getBeforeNodeForView(adjustedIdx, this._lContainer);
        addRemoveViewFromContainer(lView, true, beforeNode);

        (viewRef as ViewRef<any>).attachToViewContainerRef(this);
        addToArray(this._lContainer[VIEW_REFS] !, adjustedIdx, viewRef);

        return viewRef;
      }

      move(viewRef: viewEngine_ViewRef, newIndex: number): viewEngine_ViewRef {
        if (viewRef.destroyed) {
          throw new Error('Cannot move a destroyed View in a ViewContainer!');
        }
        const index = this.indexOf(viewRef);
        if (index !== -1) this.detach(index);
        this.insert(viewRef, newIndex);
        return viewRef;
      }

      indexOf(viewRef: viewEngine_ViewRef): number {
        return this._lContainer[VIEW_REFS] !== null ?
            this._lContainer[VIEW_REFS] !.indexOf(viewRef) :
            0;
      }

      remove(index?: number): void {
        this.allocateContainerIfNeeded();
        const adjustedIdx = this._adjustIndex(index, -1);
        removeView(this._lContainer, adjustedIdx);
        removeFromArray(this._lContainer[VIEW_REFS] !, adjustedIdx);
      }

      detach(index?: number): viewEngine_ViewRef|null {
        this.allocateContainerIfNeeded();
        const adjustedIdx = this._adjustIndex(index, -1);
        const view = detachView(this._lContainer, adjustedIdx);

        const wasDetached =
            view && removeFromArray(this._lContainer[VIEW_REFS] !, adjustedIdx) != null;
        return wasDetached ? new ViewRef(view !, view ![CONTEXT], -1) : null;
      }

      private _adjustIndex(index?: number, shift: number = 0) {
        if (index == null) {
          return this.length + shift;
        }
        if (ngDevMode) {
          assertGreaterThan(index, -1, 'index must be positive');
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

  ngDevMode && assertNodeOfPossibleTypes(
                   hostTNode, TNodeType.Container, TNodeType.Element, TNodeType.ElementContainer);

  let lContainer: LContainer;
  const slotValue = hostView[hostTNode.index];
  if (isLContainer(slotValue)) {
    // If the host is a container, we don't need to create a new LContainer
    lContainer = slotValue;
    lContainer[ACTIVE_INDEX] = -1;
  } else {
    let commentNode: RComment;
    // If the host is an element container, the native host element is guaranteed to be a
    // comment and we can reuse that comment as anchor element for the new LContainer.
    if (hostTNode.type === TNodeType.ElementContainer) {
      commentNode = unwrapRNode(slotValue) as RComment;
    } else {
      ngDevMode && ngDevMode.rendererCreateComment++;
      commentNode = hostView[RENDERER].createComment(ngDevMode ? 'container' : '');
    }

    // A container can be created on the root (topmost / bootstrapped) component and in this case we
    // can't use LTree to insert container's marker node (both parent of a comment node and the
    // commend node itself is located outside of elements hold by LTree). In this specific case we
    // use low-level DOM manipulation to insert container's marker (comment) node.
    if (isRootView(hostView)) {
      const renderer = hostView[RENDERER];
      const hostNative = getNativeByTNode(hostTNode, hostView) !;
      const parentOfHostNative = nativeParentNode(renderer, hostNative);
      nativeInsertBefore(
          renderer, parentOfHostNative !, commentNode, nativeNextSibling(renderer, hostNative));
    } else {
      appendChild(commentNode, hostTNode, hostView);
    }

    hostView[hostTNode.index] = lContainer =
        createLContainer(slotValue, hostView, commentNode, hostTNode, true);

    addToViewTree(hostView, lContainer);
  }

  return new R3ViewContainerRef(lContainer, hostTNode, hostView);
}


/** Returns a ChangeDetectorRef (a.k.a. a ViewRef) */
export function injectChangeDetectorRef(isPipe = false): ViewEngine_ChangeDetectorRef {
  return createViewRef(getPreviousOrParentTNode(), getLView(), isPipe);
}

/**
 * Creates a ViewRef and stores it on the injector as ChangeDetectorRef (public alias).
 *
 * @param hostTNode The node that is requesting a ChangeDetectorRef
 * @param hostView The view to which the node belongs
 * @param isPipe Whether the view is being injected into a pipe.
 * @returns The ChangeDetectorRef to use
 */
function createViewRef(
    hostTNode: TNode, hostView: LView, isPipe: boolean): ViewEngine_ChangeDetectorRef {
  if (isComponent(hostTNode) && !isPipe) {
    const componentIndex = hostTNode.directiveStart;
    const componentView = getComponentViewByIndex(hostTNode.index, hostView);
    return new ViewRef(componentView, null, componentIndex);
  } else if (
      hostTNode.type === TNodeType.Element || hostTNode.type === TNodeType.Container ||
      hostTNode.type === TNodeType.ElementContainer) {
    const hostComponentView = findComponentView(hostView);
    return new ViewRef(hostComponentView, hostComponentView[CONTEXT], -1);
  }
  return null !;
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
  const tNode = getPreviousOrParentTNode();
  const nodeAtIndex = getComponentViewByIndex(tNode.index, lView);
  return getOrCreateRenderer2(isLView(nodeAtIndex) ? nodeAtIndex : lView);
}
