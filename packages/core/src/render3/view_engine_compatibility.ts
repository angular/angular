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
import {assertDefined, assertGreaterThan, assertLessThan} from '../util/assert';

import {NodeInjector, getParentInjectorLocation} from './di';
import {createLContainer} from './instructions';
import {ACTIVE_INDEX, LContainer, VIEWS} from './interfaces/container';
import {TContainerNode, TElementContainerNode, TElementNode, TNode, TNodeType} from './interfaces/node';
import {RElement, RNode, isProceduralRenderer} from './interfaces/renderer';
import {CONTEXT, EmbeddedViewFactoryInternal, LView, RENDERER, ViewContainer} from './interfaces/view';
import {assertNodeOfPossibleTypes} from './node_assert';
import {appendChild, appendChildView, nativeInsertBefore, nativeNextSibling, nativeParentNode} from './node_manipulation';
import {getParentInjectorTNode} from './node_util';
import {getLView, getPreviousOrParentTNode} from './state';
import {getParentInjectorView, hasParentInjector} from './util/injector_utils';
import {findComponentView} from './util/view_traversal_utils';
import {getComponentViewByIndex, getNativeByTNode, isComponent, isLContainer, isRootView, lContainerToViewContainer, lViewToView, viewContainerToLContainer, viewToLView} from './util/view_utils';
import {getEmbeddedViewFactoryInternal, viewContainerGet, viewContainerInsertAfter, viewContainerRemove, viewDestroy} from './view';
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

let R3ElementRef: {new (native: RNode): ViewEngine_ElementRef};

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
  new<T>(elemenRef: ViewEngine_ElementRef, embeddedViewFactory: EmbeddedViewFactoryInternal<T>):
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

interface IvyTemplateRef<T> {
  createEmbeddedView(context?: T): viewEngine_EmbeddedViewRef<T>;
}

/**
 * Creates a TemplateRef and stores it on the injector.
 *
 * @param TemplateRefToken The TemplateRef type
 * @param ElementRefToken The ElementRef type
 * @param declarationTNode The node that is requesting a TemplateRef
 * @param declarationLView The view to which the node belongs
 * @returns The TemplateRef instance to use
 */
export function createTemplateRef<T>(
    TemplateRefToken: typeof ViewEngine_TemplateRef, ElementRefToken: typeof ViewEngine_ElementRef,
    declarationTNode: TNode, declarationLView: LView): ViewEngine_TemplateRef<T>|null {
  if (!R3TemplateRef) {
    // TODO: Fix class name, should be TemplateRef, but there appears to be a rollup bug
    R3TemplateRef = class TemplateRef_<T> extends TemplateRefToken<T> implements IvyTemplateRef<T> {
      constructor(
          readonly elementRef: ViewEngine_ElementRef,
          private readonly embeddedViewFactory: EmbeddedViewFactoryInternal<T>) {
        super();
      }

      createEmbeddedView(context: T): viewEngine_EmbeddedViewRef<T> {
        // Legacy behavior dictates that some sort of context should exist if none was provided.
        if (context === undefined) {
          context = {} as T;
        }
        return new ViewRef(lViewToView(this.embeddedViewFactory(context)), context, -1);
      }
    };
  }

  if (declarationTNode.type === TNodeType.Container) {
    ngDevMode && assertDefined(declarationTNode.tViews, 'TView must be allocated');
    ngDevMode && assertNodeOfPossibleTypes(declarationTNode, TNodeType.Container);
    return new R3TemplateRef(
        createElementRef(ElementRefToken, declarationTNode, declarationLView),
        getEmbeddedViewFactoryInternal(declarationTNode, declarationLView) !);
  } else {
    return null;
  }
}

let R3ViewContainerRef: {
  new (
      viewContainer: ViewContainer,
      hostTNode: TElementNode | TContainerNode | TElementContainerNode, hostView: LView):
      ViewEngine_ViewContainerRef
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
      private _viewRefs: viewEngine_ViewRef[] = [];

      constructor(
          private _viewContainer: ViewContainer,
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
        const lContainer = viewContainerToLContainer(this._viewContainer);
        const views = lContainer[VIEWS];
        while (views.length > 0) {
          this.remove(0);
        }
      }

      get(index: number): viewEngine_ViewRef|null { return this._viewRefs[index] || null; }

      get length(): number { return viewContainerToLContainer(this._viewContainer)[VIEWS].length; }

      createEmbeddedView<C>(templateRef: ViewEngine_TemplateRef<C>, context?: C, index?: number):
          viewEngine_EmbeddedViewRef<C> {
        const viewRef = (templateRef as IvyTemplateRef<C>).createEmbeddedView(context);
        (viewRef as ViewRef<any>).attachToViewContainerRef(this);
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

      insert(viewRef: viewEngine_ViewRef, insertionIndex?: number): viewEngine_ViewRef {
        if (viewRef.destroyed) {
          throw new Error('Cannot insert a destroyed View in a ViewContainer!');
        }
        const viewToInsert = (viewRef as ViewRef<any>)._view;
        const refIndex = this._viewRefs.indexOf(viewRef);
        if (refIndex >= 0) {
          this.detach(refIndex);
        }
        const adjustedInsertionIndex = this._defaultToViewCount(insertionIndex, 0);
        const viewContainer = this._viewContainer;

        const afterView = adjustedInsertionIndex === 0 ?
            null :
            viewContainerGet(viewContainer, adjustedInsertionIndex - 1);
        viewContainerInsertAfter(viewContainer, viewToInsert, afterView);
        (viewRef as ViewRef<any>).attachToViewContainerRef(this);
        this._viewRefs.splice(adjustedInsertionIndex, 0, viewRef);

        return viewRef;
      }

      move(viewRef: viewEngine_ViewRef, newIndex: number): viewEngine_ViewRef {
        if (viewRef.destroyed) {
          throw new Error('Cannot move a destroyed View in a ViewContainer!');
        }
        const index = this.indexOf(viewRef);
        if (index !== -1) this.detach(index);
        this.insert(viewRef, this._defaultToViewCount(newIndex, 0));
        return viewRef;
      }

      indexOf(viewRef: viewEngine_ViewRef): number { return this._viewRefs.indexOf(viewRef); }

      remove(removeIndex: number): void {
        const adjustedIdx = this._defaultToViewCount(removeIndex, -1);
        const viewToRemove = this._viewRefs[adjustedIdx] as ViewRef<any>;
        viewContainerRemove(this._viewContainer, viewToRemove._view, true);
        this._viewRefs.splice(adjustedIdx, 1);
      }

      detach(removeIndex?: number): viewEngine_ViewRef|null {
        const adjustedIdx = this._defaultToViewCount(removeIndex, -1);
        const viewToRemove = this._viewRefs[adjustedIdx] as ViewRef<any>;
        const view = viewToRemove._view;
        const _lView = viewToLView(view);
        viewContainerRemove(this._viewContainer, view, false);
        const wasDetached = !!(this._viewRefs.splice(adjustedIdx, 1)[0]);
        return wasDetached ? new ViewRef(view, _lView[CONTEXT], -1) : null;
      }

      /**
       * When index is not specified we need to return the last
       */
      private _defaultToViewCount(index: number|undefined|null, offsetFromLast: number) {
        const lContainer = viewContainerToLContainer(this._viewContainer);
        const views = lContainer[VIEWS];
        if (index == null) {
          return views.length + offsetFromLast;
        }
        if (ngDevMode) {
          assertGreaterThan(index, -1, 'index must be positive');
          // +1 because it's legal to insert at the end.
          assertLessThan(index, views.length + 1, 'index');
        }
        return index;
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
    const commentNode = hostView[RENDERER].createComment(ngDevMode ? 'container' : '');
    ngDevMode && ngDevMode.rendererCreateComment++;

    // A container can be created on the root (topmost / bootstrapped) component and in this case we
    // can't use LTree to insert container's marker node (both parent of a comment node and the
    // comment node itself are located outside of elements held by LTree). In this specific case we
    // use low-level DOM manipulation to insert container's marker (comment) node.
    if (isRootView(hostView)) {
      const renderer = hostView[RENDERER];
      const hostNative = getNativeByTNode(hostTNode, hostView) !;
      const parentOfHostNative = nativeParentNode(renderer, hostNative);
      if (parentOfHostNative) {
        nativeInsertBefore(
            renderer, parentOfHostNative !, commentNode, nativeNextSibling(renderer, hostNative));
      }
    } else {
      appendChild(commentNode, hostTNode, hostView);
    }

    hostView[hostTNode.index] = lContainer =
        createLContainer(slotValue, hostView, commentNode, true);

    appendChildView(hostView, lContainer);
  }

  return new R3ViewContainerRef(lContainerToViewContainer(lContainer), hostTNode, hostView);
}


/** Returns a ChangeDetectorRef (a.k.a. a ViewRef) */
export function injectChangeDetectorRef(): ViewEngine_ChangeDetectorRef {
  return createViewRef(getPreviousOrParentTNode(), getLView(), null);
}

/**
 * Creates a ViewRef and stores it on the injector as ChangeDetectorRef (public alias).
 *
 * @param hostTNode The node that is requesting a ChangeDetectorRef
 * @param hostView The view to which the node belongs
 * @param context The context for this change detector ref
 * @returns The ChangeDetectorRef to use
 */
export function createViewRef(
    hostTNode: TNode, hostView: LView, context: any): ViewEngine_ChangeDetectorRef {
  if (isComponent(hostTNode)) {
    const componentIndex = hostTNode.directiveStart;
    const componentView = getComponentViewByIndex(hostTNode.index, hostView);
    return new ViewRef(lViewToView(componentView), context, componentIndex);
  } else if (hostTNode.type === TNodeType.Element || hostTNode.type === TNodeType.Container) {
    const hostComponentView = findComponentView(hostView);
    return new ViewRef(lViewToView(hostComponentView), hostComponentView[CONTEXT], -1);
  }
  return null !;
}

function getOrCreateRenderer2(view: LView): Renderer2 {
  const renderer = view[RENDERER];
  if (isProceduralRenderer(renderer)) {
    return renderer as Renderer2;
  } else {
    throw new Error('Cannot inject Renderer2 when the application uses Renderer3!');
  }
}

/** Returns a Renderer2 (or throws when application was bootstrapped with Renderer3) */
export function injectRenderer2(): Renderer2 {
  return getOrCreateRenderer2(getLView());
}
