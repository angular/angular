/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectorRef as ViewEngine_ChangeDetectorRef} from '../change_detection/change_detector_ref';
import {InjectionToken} from '../di/injection_token';
import {Injector} from '../di/injector';
import {InjectFlags} from '../di/interface/injector';
import {AbstractType, Type} from '../interface/type';
import {ComponentFactory as viewEngine_ComponentFactory, ComponentRef as viewEngine_ComponentRef} from '../linker/component_factory';
import {ComponentFactoryResolver as viewEngine_ComponentFactoryResolver} from '../linker/component_factory_resolver';
import {createElementRef, ElementRef as viewEngine_ElementRef} from '../linker/element_ref';
import {NgModuleRef as viewEngine_NgModuleRef} from '../linker/ng_module_factory';
import {RendererFactory2} from '../render/api';
import {Sanitizer} from '../sanitization/sanitizer';
import {VERSION} from '../version';
import {NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR} from '../view/provider';
import {assertComponentType} from './assert';
import {createRootComponent, createRootComponentView, createRootContext, LifecycleHooksFeature} from './component';
import {getComponentDef} from './definition';
import {NodeInjector} from './di';
import {createLView, createTView, locateHostElement, renderView} from './instructions/shared';
import {ComponentDef} from './interfaces/definition';
import {TContainerNode, TElementContainerNode, TElementNode, TNode} from './interfaces/node';
import {domRendererFactory3, RendererFactory3} from './interfaces/renderer';
import {RNode} from './interfaces/renderer_dom';
import {HEADER_OFFSET, LView, LViewFlags, TViewType} from './interfaces/view';
import {MATH_ML_NAMESPACE, SVG_NAMESPACE} from './namespaces';
import {createElementNode, writeDirectClass} from './node_manipulation';
import {extractAttrsAndClassesFromSelector, stringifyCSSSelectorList} from './node_selector_matcher';
import {enterView, leaveView} from './state';
import {setUpAttributes} from './util/attrs_utils';
import {defaultScheduler} from './util/misc_utils';
import {getTNode} from './util/view_utils';
import {RootViewRef, ViewRef} from './view_ref';

export class ComponentFactoryResolver extends viewEngine_ComponentFactoryResolver {
  /**
   * @param ngModule The NgModuleRef to which all resolved factories are bound.
   */
  constructor(private ngModule?: viewEngine_NgModuleRef<any>) {
    super();
  }

  resolveComponentFactory<T>(component: Type<T>): viewEngine_ComponentFactory<T> {
    ngDevMode && assertComponentType(component);
    const componentDef = getComponentDef(component)!;
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

function getNamespace(elementName: string): string|null {
  const name = elementName.toLowerCase();
  return name === 'svg' ? SVG_NAMESPACE : (name === 'math' ? MATH_ML_NAMESPACE : null);
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
    get: <T>(
        token: Type<T>|AbstractType<T>|InjectionToken<T>, notFoundValue?: T,
        flags?: InjectFlags): T => {
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
    this.selector = stringifyCSSSelectorList(componentDef.selectors);
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

    const hostRenderer = rendererFactory.createRenderer(null, this.componentDef);
    // Determine a tag name used for creating host elements when this component is created
    // dynamically. Default to 'div' if this component did not specify any tag name in its selector.
    const elementName = this.componentDef.selectors[0][0] as string || 'div';
    const hostRNode = rootSelectorOrNode ?
        locateHostElement(hostRenderer, rootSelectorOrNode, this.componentDef.encapsulation) :
        createElementNode(
            rendererFactory.createRenderer(null, this.componentDef), elementName,
            getNamespace(elementName));

    const rootFlags = this.componentDef.onPush ? LViewFlags.Dirty | LViewFlags.IsRoot :
                                                 LViewFlags.CheckAlways | LViewFlags.IsRoot;
    const rootContext = createRootContext();

    // Create the root view. Uses empty TView and ContentTemplate.
    const rootTView = createTView(TViewType.Root, null, null, 1, 0, null, null, null, null, null);
    const rootLView = createLView(
        null, rootTView, rootContext, rootFlags, null, null, rendererFactory, hostRenderer,
        sanitizer, rootViewInjector);

    // rootView is the parent when bootstrapping
    // TODO(misko): it looks like we are entering view here but we don't really need to as
    // `renderView` does that. However as the code is written it is needed because
    // `createRootComponentView` and `createRootComponent` both read global state. Fixing those
    // issues would allow us to drop this.
    enterView(rootLView);

    let component: T;
    let tElementNode: TElementNode;

    try {
      const componentView = createRootComponentView(
          hostRNode, this.componentDef, rootLView, rendererFactory, hostRenderer);
      if (hostRNode) {
        if (rootSelectorOrNode) {
          setUpAttributes(hostRenderer, hostRNode, ['ng-version', VERSION.full]);
        } else {
          // If host element is created as a part of this function call (i.e. `rootSelectorOrNode`
          // is not defined), also apply attributes and classes extracted from component selector.
          // Extract attributes and classes from the first selector only to match VE behavior.
          const {attrs, classes} =
              extractAttrsAndClassesFromSelector(this.componentDef.selectors[0]);
          if (attrs) {
            setUpAttributes(hostRenderer, hostRNode, attrs);
          }
          if (classes && classes.length > 0) {
            writeDirectClass(hostRenderer, hostRNode, classes.join(' '));
          }
        }
      }

      tElementNode = getTNode(rootTView, HEADER_OFFSET) as TElementNode;

      if (projectableNodes !== undefined) {
        const projection: (TNode|RNode[]|null)[] = tElementNode.projection = [];
        for (let i = 0; i < this.ngContentSelectors.length; i++) {
          const nodesforSlot = projectableNodes[i];
          // Projectable nodes can be passed as array of arrays or an array of iterables (ngUpgrade
          // case). Here we do normalize passed data structure to be an array of arrays to avoid
          // complex checks down the line.
          // We also normalize the length of the passed in projectable nodes (to match the number of
          // <ng-container> slots defined by a component).
          projection.push(nodesforSlot != null ? Array.from(nodesforSlot) : null);
        }
      }

      // TODO: should LifecycleHooksFeature and other host features be generated by the compiler and
      // executed here?
      // Angular 5 reference: https://stackblitz.com/edit/lifecycle-hooks-vcref
      component = createRootComponent(
          componentView, this.componentDef, rootLView, rootContext, [LifecycleHooksFeature]);

      renderView(rootTView, rootLView, null);
    } finally {
      leaveView();
    }

    return new ComponentRef(
        this.componentType, component, createElementRef(tElementNode, rootLView), rootLView,
        tElementNode);
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
    this.componentType = componentType;
  }

  get injector(): Injector {
    return new NodeInjector(this._tNode, this._rootLView);
  }

  destroy(): void {
    this.hostView.destroy();
  }

  onDestroy(callback: () => void): void {
    this.hostView.onDestroy(callback);
  }
}
