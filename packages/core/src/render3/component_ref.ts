/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectorRef as ViewEngine_ChangeDetectorRef} from '../change_detection/change_detector_ref';
import {InjectionToken} from '../di/injection_token';
import {Injector, inject} from '../di/injector';
import {ComponentFactory as viewEngine_ComponentFactory, ComponentRef as viewEngine_ComponentRef} from '../linker/component_factory';
import {ComponentFactoryResolver as viewEngine_ComponentFactoryResolver} from '../linker/component_factory_resolver';
import {ElementRef as viewEngine_ElementRef} from '../linker/element_ref';
import {NgModuleRef as viewEngine_NgModuleRef} from '../linker/ng_module_factory';
import {RendererFactory2} from '../render/api';
import {Type} from '../type';

import {assertComponentType, assertDefined} from './assert';
import {LifecycleHooksFeature, createRootComponent, createRootContext} from './component';
import {getComponentDef} from './definition';
import {adjustBlueprintForNewNode, createLViewData, createNodeAtIndex, createTView, elementCreate, enterView, getTNode, hostElement, locateHostElement, renderEmbeddedTemplate} from './instructions';
import {ComponentDefInternal, RenderFlags} from './interfaces/definition';
import {LElementNode, TElementNode, TNode, TNodeType, TViewNode} from './interfaces/node';
import {RElement, RendererFactory3, domRendererFactory3} from './interfaces/renderer';
import {FLAGS, INJECTOR, LViewData, LViewFlags, RootContext, TVIEW} from './interfaces/view';
import {createElementRef} from './view_engine_compatibility';
import {RootViewRef, ViewRef} from './view_ref';

export class ComponentFactoryResolver extends viewEngine_ComponentFactoryResolver {
  resolveComponentFactory<T>(component: Type<T>): viewEngine_ComponentFactory<T> {
    ngDevMode && assertComponentType(component);
    const componentDef = getComponentDef(component) !;
    return new ComponentFactory(componentDef);
  }
}

function toRefArray(map: {[key: string]: string}): {propName: string; templateName: string;}[] {
  const array: {propName: string; templateName: string;}[] = [];
  for (let nonMinified in map) {
    if (map.hasOwnProperty(nonMinified)) {
      const minified = map[nonMinified];
      array.push({propName: minified, templateName: nonMinified});
    }
  }
  return array;
}

/**
 * Default {@link RootContext} for all components rendered with {@link renderComponent}.
 */
export const ROOT_CONTEXT = new InjectionToken<RootContext>(
    'ROOT_CONTEXT_TOKEN',
    {providedIn: 'root', factory: () => createRootContext(inject(SCHEDULER))});

/**
 * A change detection scheduler token for {@link RootContext}. This token is the default value used
 * for the default `RootContext` found in the {@link ROOT_CONTEXT} token.
 */
export const SCHEDULER = new InjectionToken<((fn: () => void) => void)>('SCHEDULER_TOKEN', {
  providedIn: 'root',
  factory: () => {
    const useRaf = typeof requestAnimationFrame !== 'undefined' && typeof window !== 'undefined';
    return useRaf ? requestAnimationFrame.bind(window) : setTimeout;
  },
});

/**
 * A function used to wrap the `RendererFactory2`.
 * Used in tests to change the `RendererFactory2` into a `DebugRendererFactory2`.
 */
export const WRAP_RENDERER_FACTORY2 =
    new InjectionToken<(rf: RendererFactory2) => RendererFactory2>('WRAP_RENDERER_FACTORY2');

/**
 * Render3 implementation of {@link viewEngine_ComponentFactory}.
 */
export class ComponentFactory<T> extends viewEngine_ComponentFactory<T> {
  selector: string;
  componentType: Type<any>;
  ngContentSelectors: string[];

  get inputs(): {propName: string; templateName: string;}[] {
    return toRefArray(this.componentDef.inputs);
  }

  get outputs(): {propName: string; templateName: string;}[] {
    return toRefArray(this.componentDef.outputs);
  }

  constructor(private componentDef: ComponentDefInternal<any>) {
    super();
    this.componentType = componentDef.type;
    this.selector = componentDef.selectors[0][0] as string;
    this.ngContentSelectors = [];
  }

  create(
      injector: Injector, projectableNodes?: any[][]|undefined, rootSelectorOrNode?: any,
      ngModule?: viewEngine_NgModuleRef<any>|undefined): viewEngine_ComponentRef<T> {
    const isInternalRootView = rootSelectorOrNode === undefined;

    let rendererFactory: RendererFactory3;

    if (ngModule) {
      const wrapper = ngModule.injector.get(WRAP_RENDERER_FACTORY2, (v: RendererFactory2) => v);
      rendererFactory = wrapper(ngModule.injector.get(RendererFactory2)) as RendererFactory3;
    } else {
      rendererFactory = domRendererFactory3;
    }

    const hostNode = isInternalRootView ?
        elementCreate(this.selector, rendererFactory.createRenderer(null, this.componentDef)) :
        locateHostElement(rendererFactory, rootSelectorOrNode);

    // The first index of the first selector is the tag name.
    const componentTag = this.componentDef.selectors ![0] ![0] as string;

    const rootFlags = this.componentDef.onPush ? LViewFlags.Dirty | LViewFlags.IsRoot :
                                                 LViewFlags.CheckAlways | LViewFlags.IsRoot;
    const rootContext: RootContext = ngModule && !isInternalRootView ?
        ngModule.injector.get(ROOT_CONTEXT) :
        createRootContext(requestAnimationFrame.bind(window));

    // Create the root view. Uses empty TView and ContentTemplate.
    const rootView: LViewData = createLViewData(
        rendererFactory.createRenderer(hostNode, this.componentDef),
        createTView(-1, null, 1, 0, null, null, null), rootContext, rootFlags);
    rootView[INJECTOR] = ngModule && ngModule.injector || null;

    // rootView is the parent when bootstrapping
    const oldView = enterView(rootView, null);

    let component: T;
    let elementNode: LElementNode;
    let tElementNode: TElementNode;
    try {
      if (rendererFactory.begin) rendererFactory.begin();

      // Create element node at index 0 in data array
      elementNode = hostElement(componentTag, hostNode, this.componentDef);

      // TODO: should LifecycleHooksFeature and other host features be generated by the compiler and
      // executed here?
      // Angular 5 reference: https://stackblitz.com/edit/lifecycle-hooks-vcref
      component = createRootComponent(
          elementNode, this.componentDef, rootView, rootContext, [LifecycleHooksFeature]);

      tElementNode = getTNode(0) as TElementNode;

      // Transform the arrays of native nodes into a LNode structure that can be consumed by the
      // projection instruction. This is needed to support the reprojection of these nodes.
      if (projectableNodes) {
        let index = 0;
        const projection: TNode[] = tElementNode.projection = [];
        for (let i = 0; i < projectableNodes.length; i++) {
          const nodeList = projectableNodes[i];
          let firstTNode: TNode|null = null;
          let previousTNode: TNode|null = null;
          for (let j = 0; j < nodeList.length; j++) {
            adjustBlueprintForNewNode(rootView);
            const tNode =
                createNodeAtIndex(++index, TNodeType.Element, nodeList[j] as RElement, null, null);
            previousTNode ? (previousTNode.next = tNode) : (firstTNode = tNode);
            previousTNode = tNode;
          }
          projection.push(firstTNode !);
        }
      }

      // Execute the template in creation mode only, and then turn off the CreationMode flag
      const componentView = elementNode.data as LViewData;
      renderEmbeddedTemplate(componentView, componentView[TVIEW], component, RenderFlags.Create);
      componentView[FLAGS] &= ~LViewFlags.CreationMode;
    } finally {
      enterView(oldView, null);
      if (rendererFactory.end) rendererFactory.end();
    }

    const componentRef = new ComponentRef(
        this.componentType, component, rootView, injector,
        createElementRef(viewEngine_ElementRef, tElementNode, rootView));

    if (isInternalRootView) {
      // The host element of the internal root view is attached to the component's host view node
      componentRef.hostView._tViewNode !.child = tElementNode;
    }
    return componentRef;
  }
}

const componentFactoryResolver: ComponentFactoryResolver = new ComponentFactoryResolver();

/**
 * Creates a ComponentFactoryResolver and stores it on the injector. Or, if the
 * ComponentFactoryResolver
 * already exists, retrieves the existing ComponentFactoryResolver.
 *
 * @returns The ComponentFactoryResolver instance to use
 */
export function injectComponentFactoryResolver(): viewEngine_ComponentFactoryResolver {
  return componentFactoryResolver;
}

/**
 * Represents an instance of a Component created via a {@link ComponentFactory}.
 *
 * `ComponentRef` provides access to the Component Instance as well other objects related to this
 * Component Instance and allows you to destroy the Component Instance via the {@link #destroy}
 * method.
 *
 */
export class ComponentRef<T> extends viewEngine_ComponentRef<T> {
  destroyCbs: (() => void)[]|null = [];
  injector: Injector;
  instance: T;
  hostView: ViewRef<T>;
  changeDetectorRef: ViewEngine_ChangeDetectorRef;
  componentType: Type<T>;

  constructor(
      componentType: Type<T>, instance: T, rootView: LViewData, injector: Injector,
      public location: viewEngine_ElementRef) {
    super();
    this.instance = instance;
    this.hostView = this.changeDetectorRef = new RootViewRef<T>(rootView);
    this.hostView._tViewNode = createNodeAtIndex(-1, TNodeType.View, null, null, null, rootView);
    this.injector = injector;
    this.componentType = componentType;
  }

  destroy(): void {
    ngDevMode && assertDefined(this.destroyCbs, 'NgModule already destroyed');
    this.destroyCbs !.forEach(fn => fn());
    this.destroyCbs = null;
  }
  onDestroy(callback: () => void): void {
    ngDevMode && assertDefined(this.destroyCbs, 'NgModule already destroyed');
    this.destroyCbs !.push(callback);
  }
}
