/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectorRef as ViewEngine_ChangeDetectorRef} from '../change_detection/change_detector_ref';
import {Injector} from '../di/injector';
import {InjectFlags} from '../di/interface/injector';
import {ProviderToken} from '../di/provider_token';
import {EnvironmentInjector, getNullInjector} from '../di/r3_injector';
import {RuntimeError, RuntimeErrorCode} from '../errors';
import {Type} from '../interface/type';
import {ComponentFactory as viewEngine_ComponentFactory, ComponentRef as AbstractComponentRef} from '../linker/component_factory';
import {ComponentFactoryResolver as viewEngine_ComponentFactoryResolver} from '../linker/component_factory_resolver';
import {createElementRef, ElementRef as viewEngine_ElementRef} from '../linker/element_ref';
import {NgModuleRef as viewEngine_NgModuleRef} from '../linker/ng_module_factory';
import {RendererFactory2} from '../render/api';
import {Sanitizer} from '../sanitization/sanitizer';
import {VERSION} from '../version';
import {NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR} from '../view/provider_flags';

import {assertComponentType} from './assert';
import {createRootComponent, createRootComponentView, createRootContext, LifecycleHooksFeature} from './component';
import {getComponentDef} from './definition';
import {NodeInjector} from './di';
import {assertComponentDef} from './errors';
import {reportUnknownPropertyError} from './instructions/element_validation';
import {createLView, createTView, locateHostElement, markDirtyIfOnPush, renderView, setInputsForProperty} from './instructions/shared';
import {ComponentDef} from './interfaces/definition';
import {PropertyAliasValue, TContainerNode, TElementContainerNode, TElementNode, TNode} from './interfaces/node';
import {RNode} from './interfaces/renderer_dom';
import {HEADER_OFFSET, LView, LViewFlags, TVIEW, TViewType} from './interfaces/view';
import {MATH_ML_NAMESPACE, SVG_NAMESPACE} from './namespaces';
import {createElementNode, writeDirectClass} from './node_manipulation';
import {extractAttrsAndClassesFromSelector, stringifyCSSSelectorList} from './node_selector_matcher';
import {enterView, leaveView} from './state';
import {setUpAttributes} from './util/attrs_utils';
import {stringifyForError} from './util/stringify_utils';
import {getTNode} from './util/view_utils';
import {RootViewRef, ViewRef} from './view_ref';

export class ComponentFactoryResolver extends viewEngine_ComponentFactoryResolver {
  /**
   * @param ngModule The NgModuleRef to which all resolved factories are bound.
   */
  constructor(private ngModule?: viewEngine_NgModuleRef<any>) {
    super();
  }

  override resolveComponentFactory<T>(component: Type<T>): viewEngine_ComponentFactory<T> {
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
 * Injector that looks up a value using a specific injector, before falling back to the module
 * injector. Used primarily when creating components or embedded views dynamically.
 */
class ChainedInjector implements Injector {
  constructor(private injector: Injector, private parentInjector: Injector) {}

  get<T>(token: ProviderToken<T>, notFoundValue?: T, flags?: InjectFlags): T {
    const value = this.injector.get<T|typeof NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR>(
        token, NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR, flags);

    if (value !== NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR ||
        notFoundValue === (NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR as unknown as T)) {
      // Return the value from the root element injector when
      // - it provides it
      //   (value !== NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR)
      // - the module injector should not be checked
      //   (notFoundValue === NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR)
      return value as T;
    }

    return this.parentInjector.get(token, notFoundValue, flags);
  }
}

/**
 * Render3 implementation of {@link viewEngine_ComponentFactory}.
 */
export class ComponentFactory<T> extends viewEngine_ComponentFactory<T> {
  override selector: string;
  override componentType: Type<any>;
  override ngContentSelectors: string[];
  isBoundToModule: boolean;

  override get inputs(): {propName: string; templateName: string;}[] {
    return toRefArray(this.componentDef.inputs);
  }

  override get outputs(): {propName: string; templateName: string;}[] {
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

  override create(
      injector: Injector, projectableNodes?: any[][]|undefined, rootSelectorOrNode?: any,
      environmentInjector?: viewEngine_NgModuleRef<any>|EnvironmentInjector|
      undefined): AbstractComponentRef<T> {
    environmentInjector = environmentInjector || this.ngModule;

    let realEnvironmentInjector = environmentInjector instanceof EnvironmentInjector ?
        environmentInjector :
        environmentInjector?.injector;

    if (realEnvironmentInjector && this.componentDef.getStandaloneInjector !== null) {
      realEnvironmentInjector = this.componentDef.getStandaloneInjector(realEnvironmentInjector) ||
          realEnvironmentInjector;
    }

    const rootViewInjector =
        realEnvironmentInjector ? new ChainedInjector(injector, realEnvironmentInjector) : injector;

    const rendererFactory = rootViewInjector.get(RendererFactory2, null);
    if (rendererFactory === null) {
      throw new RuntimeError(
          RuntimeErrorCode.RENDERER_NOT_FOUND,
          ngDevMode &&
              'Angular was not able to inject a renderer (RendererFactory2). ' +
                  'Likely this is due to a broken DI hierarchy. ' +
                  'Make sure that any injector used to create this component has a correct parent.');
    }
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
        sanitizer, rootViewInjector, null);

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
export class ComponentRef<T> extends AbstractComponentRef<T> {
  override instance: T;
  override hostView: ViewRef<T>;
  override changeDetectorRef: ViewEngine_ChangeDetectorRef;
  override componentType: Type<T>;

  constructor(
      componentType: Type<T>, instance: T, public location: viewEngine_ElementRef,
      private _rootLView: LView,
      private _tNode: TElementNode|TContainerNode|TElementContainerNode) {
    super();
    this.instance = instance;
    this.hostView = this.changeDetectorRef = new RootViewRef<T>(_rootLView);
    this.componentType = componentType;
  }

  override setInput(name: string, value: unknown): void {
    const inputData = this._tNode.inputs;
    let dataValue: PropertyAliasValue|undefined;
    if (inputData !== null && (dataValue = inputData[name])) {
      const lView = this._rootLView;
      setInputsForProperty(lView[TVIEW], lView, dataValue, name, value);
      markDirtyIfOnPush(lView, this._tNode.index);
    } else {
      if (ngDevMode) {
        const cmpNameForError = stringifyForError(this.componentType);
        let message =
            `Can't set value of the '${name}' input on the '${cmpNameForError}' component. `;
        message += `Make sure that the '${
            name}' property is annotated with @Input() or a mapped @Input('${name}') exists.`;
        reportUnknownPropertyError(message);
      }
    }
  }

  override get injector(): Injector {
    return new NodeInjector(this._tNode, this._rootLView);
  }

  override destroy(): void {
    this.hostView.destroy();
  }

  override onDestroy(callback: () => void): void {
    this.hostView.onDestroy(callback);
  }
}

/**
 * Creates a `ComponentRef` instance based on provided Component and a set of options.
 *
 * @usageNotes
 *
 * The example below demonstrates how the `createComponent` function can be used
 * to create an instance of a ComponentRef dynamically and attach it to an ApplicationRef,
 * so that it gets included into change detection cycles.
 *
 * ```typescript
 * @Component({
 *   standalone: true,
 *   template: `Hello {{ name }}!`
 * })
 * class HelloComponent {
 *   name = 'Angular';
 * }
 *
 * @Component({
 *   standalone: true,
 *   template: `<div id="hello-component-host"></div>`
 * })
 * class RootComponent {}
 *
 * // Bootstrap an application.
 * const applicationRef = await bootstrapApplication(RootComponent);
 *
 * // Locate a DOM node that would be used as a host.
 * const host = document.getElementById('hello-component-host');
 *
 * // Get an `EnvironmentInjector` instance from the `ApplicationRef`.
 * const environmentInjector = applicationRef.injector;
 *
 * // We can now create a `ComponentRef` instance.
 * const componentRef = createComponent(HelloComponent, {host, environmentInjector});
 *
 * // Last step is to register the newly created ref using the `ApplicationRef` instance
 * // to include the component view into change detection cycles.
 * applicationRef.attachView(componentRef.hostView);
 * ```
 *
 * @param component Component class reference.
 * @param options Set of options to use:
 *  * `host`: A DOM node that should act as a host node for the component.
 *  * `environmentInjector`: An `EnvironmentInjector` instance to be used for the component, see
 * additional info about it at https://angular.io/guide/standalone-components#environment-injectors.
 *  * `elementInjector` (optional): An `ElementInjector` instance, see additional info about it at
 * https://angular.io/guide/hierarchical-dependency-injection#elementinjector.
 *  * `projectableNodes` (optional): A list of DOM nodes that should be projected through
 *                      [`<ng-content>`](api/core/ng-content) of the new component instance.
 * @returns ComponentRef instance that represents a given Component.
 *
 * @publicApi
 */
export function createComponent<C>(component: Type<C>, options: {
  hostElement?: Element, environmentInjector: EnvironmentInjector,
  elementInjector?: Injector,
  projectableNodes?: Node[][],
}): AbstractComponentRef<C> {
  ngDevMode && assertComponentDef(component);
  const componentDef = getComponentDef(component)!;
  const elementInjector = options.elementInjector || getNullInjector();
  const factory = new ComponentFactory<C>(componentDef);
  return factory.create(
      elementInjector, options.projectableNodes, options.hostElement, options.environmentInjector);
}

/**
 * An interface that describes the subset of component metadata
 * that can be retrieved using the `reflectComponentType` function.
 *
 * @publicApi
 */
export interface ComponentMirror<C> {
  /**
   * The component's HTML selector.
   */
  get selector(): string;
  /**
   * The type of component the factory will create.
   */
  get type(): Type<C>;
  /**
   * The inputs of the component.
   */
  get inputs(): ReadonlyArray<{propName: string, templateName: string}>;
  /**
   * The outputs of the component.
   */
  get outputs(): ReadonlyArray<{propName: string, templateName: string}>;
  /**
   * Selector for all <ng-content> elements in the component.
   */
  get ngContentSelectors(): ReadonlyArray<string>;
  /**
   * Whether this component is marked as standalone.
   * Note: an extra flag, not present in `ComponentFactory`.
   */
  get isStandalone(): boolean;
}

/**
 * Creates an object that allows to retrieve component metadata.
 *
 * @usageNotes
 *
 * The example below demonstrates how to use the function and how the fields
 * of the returned object map to the component metadata.
 *
 * ```typescript
 * @Component({
 *   standalone: true,
 *   selector: 'foo-component',
 *   template: `
 *     <ng-content></ng-content>
 *     <ng-content select="content-selector-a"></ng-content>
 *   `,
 * })
 * class FooComponent {
 *   @Input('inputName') inputPropName: string;
 *   @Output('outputName') outputPropName = new EventEmitter<void>();
 * }
 *
 * const mirror = reflectComponentType(FooComponent)!;
 * expect(mirror.type).toBe(FooComponent);
 * expect(mirror.selector).toBe('foo-component');
 * expect(mirror.isStandalone).toBe(true);
 * expect(mirror.inputs).toEqual([{propName: 'inputName', templateName: 'inputPropName'}]);
 * expect(mirror.outputs).toEqual([{propName: 'outputName', templateName: 'outputPropName'}]);
 * expect(mirror.ngContentSelectors).toEqual([
 *   '*',                 // first `<ng-content>` in a template, the selector defaults to `*`
 *   'content-selector-a' // second `<ng-content>` in a template
 * ]);
 * ```
 *
 * @param component Component class reference.
 * @returns An object that allows to retrieve component metadata.
 *
 * @publicApi
 */
export function reflectComponentType<C>(component: Type<C>): ComponentMirror<C>|null {
  const componentDef = getComponentDef(component);
  if (!componentDef) return null;

  const factory = new ComponentFactory<C>(componentDef);
  return {
    get selector(): string {
      return factory.selector;
    },
    get type(): Type<C> {
      return factory.componentType;
    },
    get inputs(): ReadonlyArray<{propName: string, templateName: string}> {
      return factory.inputs;
    },
    get outputs(): ReadonlyArray<{propName: string, templateName: string}> {
      return factory.outputs;
    },
    get ngContentSelectors(): ReadonlyArray<string> {
      return factory.ngContentSelectors;
    },
    get isStandalone(): boolean {
      return componentDef.standalone;
    },
  };
}
