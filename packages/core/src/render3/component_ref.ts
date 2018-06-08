/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectorRef} from '../change_detection/change_detector_ref';
import {InjectionToken} from '../di/injection_token';
import {Injector, inject} from '../di/injector';
import {ComponentFactory as viewEngine_ComponentFactory, ComponentRef as viewEngine_ComponentRef} from '../linker/component_factory';
import {ComponentFactoryResolver as viewEngine_ComponentFactoryResolver} from '../linker/component_factory_resolver';
import {ElementRef} from '../linker/element_ref';
import {NgModuleRef as viewEngine_NgModuleRef} from '../linker/ng_module_factory';
import {RendererFactory2} from '../render/api';
import {Type} from '../type';

import {assertComponentType, assertDefined} from './assert';
import {createRootContext} from './component';
import {baseDirectiveCreate, createLViewData, createTView, enterView, hostElement, initChangeDetectorIfExisting, locateHostElement} from './instructions';
import {ComponentDef, ComponentType} from './interfaces/definition';
import {LElementNode} from './interfaces/node';
import {RElement} from './interfaces/renderer';
import {INJECTOR, LViewData, LViewFlags, RootContext} from './interfaces/view';
import {ViewRef} from './view_ref';

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
export const SCHEDULER = new InjectionToken<((fn: () => void) => void)>(
    'SCHEDULER_TOKEN', {providedIn: 'root', factory: () => requestAnimationFrame.bind(window)});

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

  constructor(private componentDef: ComponentDef<any>) {
    super();
    this.componentType = componentDef.type;
    this.selector = componentDef.selectors[0][0] as string;
    this.ngContentSelectors = [];
  }

  create(
      parentComponentInjector: Injector, projectableNodes?: any[][]|undefined,
      rootSelectorOrNode?: any,
      ngModule?: viewEngine_NgModuleRef<any>|undefined): viewEngine_ComponentRef<T> {
    ngDevMode && assertDefined(ngModule, 'ngModule should always be defined');

    const rendererFactory = ngModule ? ngModule.injector.get(RendererFactory2) : document;
    const hostNode = locateHostElement(rendererFactory, rootSelectorOrNode);

    // The first index of the first selector is the tag name.
    const componentTag = this.componentDef.selectors ![0] ![0] as string;

    const rootContext: RootContext = ngModule !.injector.get(ROOT_CONTEXT);

    // Create the root view. Uses empty TView and ContentTemplate.
    const rootView: LViewData = createLViewData(
        rendererFactory.createRenderer(hostNode, this.componentDef.rendererType),
        createTView(-1, null, null, null), null,
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
      rootContext.components.push(
          component = baseDirectiveCreate(0, this.componentDef.factory(), this.componentDef) as T);
      initChangeDetectorIfExisting(elementNode.nodeInjector, component, elementNode.data !);

    } finally {
      enterView(oldView, null);
      if (rendererFactory.end) rendererFactory.end();
    }

    // TODO(misko): this is the wrong injector here.
    return new ComponentRef(
        this.componentType, component, rootView, ngModule !.injector, hostNode !);
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
  location: ElementRef<any>;
  injector: Injector;
  instance: T;
  hostView: ViewRef<T>;
  changeDetectorRef: ChangeDetectorRef;
  componentType: Type<T>;

  constructor(
      componentType: Type<T>, instance: T, rootView: LViewData, injector: Injector,
      hostNode: RElement) {
    super();
    this.instance = instance;
    /* TODO(jasonaden): This is incomplete, to be adjusted in follow-up PR. Notes from Kara:When
     * ViewRef.detectChanges is called from ApplicationRef.tick, it will call detectChanges at the
     * component instance level. I suspect this means that lifecycle hooks and host bindings on the
     * given component won't work (as these are always called at the level above a component).
     *
     * In render2, ViewRef.detectChanges uses the root view instance for view checks, not the
     * component instance. So passing in the root view (1 level above the component) is sufficient.
     * We might  want to think about creating a fake component for the top level? Or overwrite
     * detectChanges with a function that calls tickRootContext? */
    this.hostView = this.changeDetectorRef = new ViewRef(rootView, instance);
    this.injector = injector;
    this.location = new ElementRef(hostNode);
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
