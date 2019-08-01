/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectorRef as ViewEngine_ChangeDetectorRef} from '../change_detection/change_detector_ref';
import {InjectionToken} from '../di/injection_token';
import {Injector} from '../di/injector';
import {InjectFlags} from '../di/interface/injector';
import {Type} from '../interface/type';
import {ComponentFactory as viewEngine_ComponentFactory, ComponentRef as viewEngine_ComponentRef} from '../linker/component_factory';
import {ComponentFactoryResolver as viewEngine_ComponentFactoryResolver} from '../linker/component_factory_resolver';
import {ElementRef as viewEngine_ElementRef} from '../linker/element_ref';
import {NgModuleRef as viewEngine_NgModuleRef} from '../linker/ng_module_factory';
import {RendererFactory2} from '../render/api';
import {Sanitizer} from '../sanitization/security';
import {VERSION} from '../version';
import {NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR} from '../view/provider';

import {assertComponentType} from './assert';
import {LifecycleHooksFeature, createRootComponent, createRootComponentView, createRootContext} from './component';
import {getComponentDef} from './definition';
import {NodeInjector} from './di';
import {addToViewTree, assignTViewNodeToLView, createLView, createTView, elementCreate, locateHostElement, refreshDescendantViews} from './instructions/shared';
import {ComponentDef} from './interfaces/definition';
import {TContainerNode, TElementContainerNode, TElementNode} from './interfaces/node';
import {RNode, RendererFactory3, domRendererFactory3, isProceduralRenderer} from './interfaces/renderer';
import {LView, LViewFlags, TVIEW} from './interfaces/view';
import {enterView, leaveView, namespaceHTMLInternal} from './state';
import {defaultScheduler} from './util/misc_utils';
import {getTNode} from './util/view_utils';
import {createElementRef} from './view_engine_compatibility';
import {RootViewRef, ViewRef} from './view_ref';

export class ComponentFactoryResolver extends viewEngine_ComponentFactoryResolver {
  /**
   * @param ngModule The NgModuleRef to which all resolved factories are bound.
   */
  constructor(private ngModule?: viewEngine_NgModuleRef<any>) { super(); }

  resolveComponentFactory<T>(component: Type<T>): viewEngine_ComponentFactory<T> {
    ngDevMode && assertComponentType(component);
    const componentDef = getComponentDef(component) !;
    return new ComponentFactory(componentDef, this.ngModule);
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
 * A change detection scheduler token for {@link RootContext}. This token is the default value used
 * for the default `RootContext` found in the {@link ROOT_CONTEXT} token.
 */
export const SCHEDULER = new InjectionToken<((fn: () => void) => void)>('SCHEDULER_TOKEN', {
  providedIn: 'root',
  factory: () => defaultScheduler,
});

function createChainedInjector(rootViewInjector: Injector, moduleInjector: Injector): Injector {
  return {
    get: <T>(token: Type<T>| InjectionToken<T>, notFoundValue?: T, flags?: InjectFlags): T => {
      const value = rootViewInjector.get(token, NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR as T, flags);

      if (value !== NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR ||
          notFoundValue === NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR) {
        // Return the value from the root element injector when
        // - it provides it
        //   (value !== NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR)
        // - the module injector should not be checked
        //   (notFoundValue === NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR)
        return value;
      }

      return moduleInjector.get(token, notFoundValue, flags);
    }
  };
}

/**
 * Render3 implementation of {@link viewEngine_ComponentFactory}.
 */
export class ComponentFactory<T> extends viewEngine_ComponentFactory<T> {
  selector: string;
  componentType: Type<any>;
  ngContentSelectors: string[];
  isBoundToModule: boolean;

  get inputs(): {propName: string; templateName: string;}[] {
    return toRefArray(this.componentDef.inputs);
  }

  get outputs(): {propName: string; templateName: string;}[] {
    return toRefArray(this.componentDef.outputs);
  }

  /**
   * @param componentDef The component definition.
   * @param ngModule The NgModuleRef to which the factory is bound.
   */
  constructor(
      private componentDef: ComponentDef<any>, private ngModule?: viewEngine_NgModuleRef<any>) {
    super();
    this.componentType = componentDef.type;

    // default to 'div' in case this component has an attribute selector
    this.selector = componentDef.selectors[0][0] as string || 'div';
    this.ngContentSelectors =
        componentDef.ngContentSelectors ? componentDef.ngContentSelectors : [];
    this.isBoundToModule = !!ngModule;
  }

  create(
      injector: Injector, projectableNodes?: any[][]|undefined, rootSelectorOrNode?: any,
      ngModule?: viewEngine_NgModuleRef<any>|undefined): viewEngine_ComponentRef<T> {
    ngModule = ngModule || this.ngModule;

    const rootViewInjector =
        ngModule ? createChainedInjector(injector, ngModule.injector) : injector;

    const rendererFactory =
        rootViewInjector.get(RendererFactory2, domRendererFactory3) as RendererFactory3;
    const sanitizer = rootViewInjector.get(Sanitizer, null);

    // Ensure that the namespace for the root node is correct,
    // otherwise the browser might not render out the element properly.
    namespaceHTMLInternal();
    const hostRNode = rootSelectorOrNode ?
        locateHostElement(rendererFactory, rootSelectorOrNode) :
        elementCreate(this.selector, rendererFactory.createRenderer(null, this.componentDef));

    const rootFlags = this.componentDef.onPush ? LViewFlags.Dirty | LViewFlags.IsRoot :
                                                 LViewFlags.CheckAlways | LViewFlags.IsRoot;

    // Check whether this Component needs to be isolated from other components, i.e. whether it
    // should be placed into its own (empty) root context or existing root context should be used.
    // Note: this is internal-only convention and might change in the future, so it should not be
    // relied upon externally.
    const isIsolated = typeof rootSelectorOrNode === 'string' &&
        /^#root-ng-internal-isolated-\d+/.test(rootSelectorOrNode);

    const rootContext = createRootContext();
    const renderer = rendererFactory.createRenderer(hostRNode, this.componentDef);

    if (rootSelectorOrNode && hostRNode) {
      ngDevMode && ngDevMode.rendererSetAttribute++;
      isProceduralRenderer(renderer) ?
          renderer.setAttribute(hostRNode, 'ng-version', VERSION.full) :
          hostRNode.setAttribute('ng-version', VERSION.full);
    }

    // Create the root view. Uses empty TView and ContentTemplate.
    const rootLView = createLView(
        null, createTView(-1, null, 1, 0, null, null, null, null), rootContext, rootFlags, null,
        null, rendererFactory, renderer, sanitizer, rootViewInjector);

    // rootView is the parent when bootstrapping
    const oldLView = enterView(rootLView, null);

    let component: T;
    let tElementNode: TElementNode;

    // Will become true if the `try` block executes with no errors.
    let safeToRunHooks = false;
    try {
      const componentView = createRootComponentView(
          hostRNode, this.componentDef, rootLView, rendererFactory, renderer);

      tElementNode = getTNode(0, rootLView) as TElementNode;

      if (projectableNodes) {
        // projectable nodes can be passed as array of arrays or an array of iterables (ngUpgrade
        // case). Here we do normalize passed data structure to be an array of arrays to avoid
        // complex checks down the line.
        tElementNode.projection =
            projectableNodes.map((nodesforSlot: RNode[]) => { return Array.from(nodesforSlot); });
      }

      // TODO: should LifecycleHooksFeature and other host features be generated by the compiler and
      // executed here?
      // Angular 5 reference: https://stackblitz.com/edit/lifecycle-hooks-vcref
      component = createRootComponent(
          componentView, this.componentDef, rootLView, rootContext, [LifecycleHooksFeature]);

      refreshDescendantViews(rootLView);
      safeToRunHooks = true;
    } finally {
      leaveView(oldLView, safeToRunHooks);
    }

    const componentRef = new ComponentRef(
        this.componentType, component,
        createElementRef(viewEngine_ElementRef, tElementNode, rootLView), rootLView, tElementNode);

    if (!rootSelectorOrNode || isIsolated) {
      // The host element of the internal or isolated root view is attached to the component's host
      // view node.
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
  instance: T;
  hostView: ViewRef<T>;
  changeDetectorRef: ViewEngine_ChangeDetectorRef;
  componentType: Type<T>;

  constructor(
      componentType: Type<T>, instance: T, public location: viewEngine_ElementRef,
      private _rootLView: LView,
      private _tNode: TElementNode|TContainerNode|TElementContainerNode) {
    super();
    this.instance = instance;
    this.hostView = this.changeDetectorRef = new RootViewRef<T>(_rootLView);
    this.hostView._tViewNode = assignTViewNodeToLView(_rootLView[TVIEW], null, -1, _rootLView);
    this.componentType = componentType;
  }

  get injector(): Injector { return new NodeInjector(this._tNode, this._rootLView); }

  destroy(): void {
    if (this.destroyCbs) {
      this.destroyCbs.forEach(fn => fn());
      this.destroyCbs = null;
      !this.hostView.destroyed && this.hostView.destroy();
    }
  }

  onDestroy(callback: () => void): void {
    if (this.destroyCbs) {
      this.destroyCbs.push(callback);
    }
  }
}
