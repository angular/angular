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
import {LifecycleHooksFeature, createRootContext} from './component';
import {adjustBlueprintForNewNode, baseDirectiveCreate, createLNode, createLViewData, createTView, elementCreate, enterView, hostElement, initChangeDetectorIfExisting, locateHostElement, renderEmbeddedTemplate} from './instructions';
import {ComponentDefInternal, ComponentType, RenderFlags} from './interfaces/definition';
import {LElementNode, TNode, TNodeType} from './interfaces/node';
import {RElement, RendererFactory3, domRendererFactory3} from './interfaces/renderer';
import {BINDING_INDEX, CONTEXT, FLAGS, INJECTOR, LViewData, LViewFlags, RootContext, TVIEW} from './interfaces/view';
import {RootViewRef, ViewRef} from './view_ref';

export class ComponentFactoryResolver extends viewEngine_ComponentFactoryResolver {
  resolveComponentFactory<T>(component: Type<T>): viewEngine_ComponentFactory<T> {
    ngDevMode && assertComponentType(component);
    const componentDef = (component as ComponentType<T>).ngComponentDef;
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

    const rootContext: RootContext = ngModule && !isInternalRootView ?
        ngModule.injector.get(ROOT_CONTEXT) :
        createRootContext(requestAnimationFrame.bind(window));

    // Create the root view. Uses empty TView and ContentTemplate.
    const rootView: LViewData = createLViewData(
        rendererFactory.createRenderer(hostNode, this.componentDef),
        createTView(-1, null, 1, 0, null, null, null), rootContext,
        this.componentDef.onPush ? LViewFlags.Dirty : LViewFlags.CheckAlways);
    rootView[INJECTOR] = ngModule && ngModule.injector || null;

    // rootView is the parent when bootstrapping
    const oldView = enterView(rootView, null !);

    let component: T;
    let elementNode: LElementNode;
    try {
      if (rendererFactory.begin) rendererFactory.begin();

      // Create element node at index 0 in data array
      elementNode = hostElement(componentTag, hostNode, this.componentDef);

      // Create directive instance with factory() and store at index 0 in directives array
      component = baseDirectiveCreate(0, this.componentDef.factory(), this.componentDef);
      rootContext.components.push(component);
      initChangeDetectorIfExisting(elementNode.nodeInjector, component, elementNode.data !);
      (elementNode.data as LViewData)[CONTEXT] = component;
      // TODO: should LifecycleHooksFeature and other host features be generated by the compiler and
      // executed here?
      // Angular 5 reference: https://stackblitz.com/edit/lifecycle-hooks-vcref
      LifecycleHooksFeature(component, this.componentDef);

      // Transform the arrays of native nodes into a LNode structure that can be consumed by the
      // projection instruction. This is needed to support the reprojection of these nodes.
      if (projectableNodes) {
        let index = 0;
        const projection: TNode[] = elementNode.tNode.projection = [];
        for (let i = 0; i < projectableNodes.length; i++) {
          const nodeList = projectableNodes[i];
          let firstTNode: TNode|null = null;
          let previousTNode: TNode|null = null;
          for (let j = 0; j < nodeList.length; j++) {
            adjustBlueprintForNewNode(rootView);
            const lNode =
                createLNode(++index, TNodeType.Element, nodeList[j] as RElement, null, null);
            if (previousTNode) {
              previousTNode.next = lNode.tNode;
            } else {
              firstTNode = lNode.tNode;
            }
            previousTNode = lNode.tNode;
          }
          projection.push(firstTNode !);
        }
      }

      // Execute the template in creation mode only, and then turn off the CreationMode flag
      renderEmbeddedTemplate(elementNode, elementNode.data ![TVIEW], component, RenderFlags.Create);
      elementNode.data ![FLAGS] &= ~LViewFlags.CreationMode;
    } finally {
      enterView(oldView, null);
      if (rendererFactory.end) rendererFactory.end();
    }

    const componentRef =
        new ComponentRef(this.componentType, component, rootView, injector, hostNode !);
    if (isInternalRootView) {
      // The host element of the internal root view is attached to the component's host view node
      componentRef.hostView._lViewNode !.tNode.child = elementNode.tNode;
    }
    return componentRef;
  }
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
  location: viewEngine_ElementRef<any>;
  injector: Injector;
  instance: T;
  hostView: ViewRef<T>;
  changeDetectorRef: ViewEngine_ChangeDetectorRef;
  componentType: Type<T>;

  constructor(
      componentType: Type<T>, instance: T, rootView: LViewData, injector: Injector,
      hostNode: RElement) {
    super();
    this.instance = instance;
    this.hostView = this.changeDetectorRef = new RootViewRef<T>(rootView);
    this.hostView._lViewNode = createLNode(-1, TNodeType.View, null, null, null, rootView);
    this.injector = injector;
    this.location = new viewEngine_ElementRef(hostNode);
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
