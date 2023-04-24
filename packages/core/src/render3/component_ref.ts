/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectorRef} from '../change_detection/change_detector_ref';
import {Injector} from '../di/injector';
import {convertToBitFlags} from '../di/injector_compatibility';
import {InjectFlags, InjectOptions} from '../di/interface/injector';
import {ProviderToken} from '../di/provider_token';
import {EnvironmentInjector} from '../di/r3_injector';
import {RuntimeError, RuntimeErrorCode} from '../errors';
import {DehydratedView} from '../hydration/interfaces';
import {retrieveHydrationInfo} from '../hydration/utils';
import {Type} from '../interface/type';
import {ComponentFactory as AbstractComponentFactory, ComponentRef as AbstractComponentRef} from '../linker/component_factory';
import {ComponentFactoryResolver as AbstractComponentFactoryResolver} from '../linker/component_factory_resolver';
import {createElementRef, ElementRef} from '../linker/element_ref';
import {NgModuleRef} from '../linker/ng_module_factory';
import {Renderer2, RendererFactory2} from '../render/api';
import {Sanitizer} from '../sanitization/sanitizer';
import {assertDefined, assertGreaterThan, assertIndexInRange} from '../util/assert';
import {VERSION} from '../version';
import {NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR} from '../view/provider_flags';

import {assertComponentType} from './assert';
import {attachPatchData} from './context_discovery';
import {getComponentDef} from './definition';
import {getNodeInjectable, NodeInjector} from './di';
import {throwProviderNotFoundError} from './errors_di';
import {registerPostOrderHooks} from './hooks';
import {reportUnknownPropertyError} from './instructions/element_validation';
import {markViewDirty} from './instructions/mark_view_dirty';
import {addToViewTree, createLView, createTView, executeContentQueries, getOrCreateComponentTView, getOrCreateTNode, initializeDirectives, invokeDirectivesHostBindings, locateHostElement, markAsComponentHost, renderView, setInputsForProperty} from './instructions/shared';
import {ComponentDef, DirectiveDef, HostDirectiveDefs} from './interfaces/definition';
import {PropertyAliasValue, TContainerNode, TElementContainerNode, TElementNode, TNode, TNodeType} from './interfaces/node';
import {Renderer} from './interfaces/renderer';
import {RElement, RNode} from './interfaces/renderer_dom';
import {CONTEXT, HEADER_OFFSET, INJECTOR, LView, LViewEnvironment, LViewFlags, TVIEW, TViewType} from './interfaces/view';
import {MATH_ML_NAMESPACE, SVG_NAMESPACE} from './namespaces';
import {createElementNode, setupStaticAttributes, writeDirectClass} from './node_manipulation';
import {extractAttrsAndClassesFromSelector, stringifyCSSSelectorList} from './node_selector_matcher';
import {EffectManager} from './reactivity/effect';
import {enterView, getCurrentTNode, getLView, leaveView} from './state';
import {computeStaticStyling} from './styling/static_styling';
import {mergeHostAttrs, setUpAttributes} from './util/attrs_utils';
import {stringifyForError} from './util/stringify_utils';
import {getComponentLViewByIndex, getNativeByTNode, getTNode} from './util/view_utils';
import {RootViewRef, ViewRef} from './view_ref';

export class ComponentFactoryResolver extends AbstractComponentFactoryResolver {
  /**
   * @param ngModule The NgModuleRef to which all resolved factories are bound.
   */
  constructor(private ngModule?: NgModuleRef<any>) {
    super();
  }

  override resolveComponentFactory<T>(component: Type<T>): AbstractComponentFactory<T> {
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

  get<T>(token: ProviderToken<T>, notFoundValue?: T, flags?: InjectFlags|InjectOptions): T {
    flags = convertToBitFlags(flags);
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
 * ComponentFactory interface implementation.
 */
export class ComponentFactory<T> extends AbstractComponentFactory<T> {
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
  constructor(private componentDef: ComponentDef<any>, private ngModule?: NgModuleRef<any>) {
    super();
    this.componentType = componentDef.type;
    this.selector = stringifyCSSSelectorList(componentDef.selectors);
    this.ngContentSelectors =
        componentDef.ngContentSelectors ? componentDef.ngContentSelectors : [];
    this.isBoundToModule = !!ngModule;
  }

  override create(
      injector: Injector, projectableNodes?: any[][]|undefined, rootSelectorOrNode?: any,
      environmentInjector?: NgModuleRef<any>|EnvironmentInjector|
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

    const effectManager = rootViewInjector.get(EffectManager, null);

    const environment: LViewEnvironment = {
      rendererFactory,
      sanitizer,
      effectManager,
    };

    const hostRenderer = rendererFactory.createRenderer(null, this.componentDef);
    // Determine a tag name used for creating host elements when this component is created
    // dynamically. Default to 'div' if this component did not specify any tag name in its selector.
    const elementName = this.componentDef.selectors[0][0] as string || 'div';
    const hostRNode = rootSelectorOrNode ?
        locateHostElement(
            hostRenderer, rootSelectorOrNode, this.componentDef.encapsulation, rootViewInjector) :
        createElementNode(hostRenderer, elementName, getNamespace(elementName));

    const rootFlags = this.componentDef.onPush ? LViewFlags.Dirty | LViewFlags.IsRoot :
                                                 LViewFlags.CheckAlways | LViewFlags.IsRoot;

    // Create the root view. Uses empty TView and ContentTemplate.
    const rootTView =
        createTView(TViewType.Root, null, null, 1, 0, null, null, null, null, null, null);
    const rootLView = createLView(
        null, rootTView, null, rootFlags, null, null, environment, hostRenderer, rootViewInjector,
        null, null);

    // rootView is the parent when bootstrapping
    // TODO(misko): it looks like we are entering view here but we don't really need to as
    // `renderView` does that. However as the code is written it is needed because
    // `createRootComponentView` and `createRootComponent` both read global state. Fixing those
    // issues would allow us to drop this.
    enterView(rootLView);

    let component: T;
    let tElementNode: TElementNode;

    try {
      const rootComponentDef = this.componentDef;
      let rootDirectives: DirectiveDef<unknown>[];
      let hostDirectiveDefs: HostDirectiveDefs|null = null;

      if (rootComponentDef.findHostDirectiveDefs) {
        rootDirectives = [];
        hostDirectiveDefs = new Map();
        rootComponentDef.findHostDirectiveDefs(rootComponentDef, rootDirectives, hostDirectiveDefs);
        rootDirectives.push(rootComponentDef);
      } else {
        rootDirectives = [rootComponentDef];
      }

      const hostTNode = createRootComponentTNode(rootLView, hostRNode);
      const componentView = createRootComponentView(
          hostTNode, hostRNode, rootComponentDef, rootDirectives, rootLView, environment,
          hostRenderer);

      tElementNode = getTNode(rootTView, HEADER_OFFSET) as TElementNode;

      // TODO(crisbeto): in practice `hostRNode` should always be defined, but there are some tests
      // where the renderer is mocked out and `undefined` is returned. We should update the tests so
      // that this check can be removed.
      if (hostRNode) {
        setRootNodeAttributes(hostRenderer, rootComponentDef, hostRNode, rootSelectorOrNode);
      }

      if (projectableNodes !== undefined) {
        projectNodes(tElementNode, this.ngContentSelectors, projectableNodes);
      }

      // TODO: should LifecycleHooksFeature and other host features be generated by the compiler and
      // executed here?
      // Angular 5 reference: https://stackblitz.com/edit/lifecycle-hooks-vcref
      component = createRootComponent(
          componentView, rootComponentDef, rootDirectives, hostDirectiveDefs, rootLView,
          [LifecycleHooksFeature]);
      renderView(rootTView, rootLView, null);
    } finally {
      leaveView();
    }

    return new ComponentRef(
        this.componentType, component, createElementRef(tElementNode, rootLView), rootLView,
        tElementNode);
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
export class ComponentRef<T> extends AbstractComponentRef<T> {
  override instance: T;
  override hostView: ViewRef<T>;
  override changeDetectorRef: ChangeDetectorRef;
  override componentType: Type<T>;
  private previousInputValues: Map<string, unknown>|null = null;

  constructor(
      componentType: Type<T>, instance: T, public location: ElementRef, private _rootLView: LView,
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
      this.previousInputValues ??= new Map();
      // Do not set the input if it is the same as the last value
      // This behavior matches `bindingUpdated` when binding inputs in templates.
      if (this.previousInputValues.has(name) &&
          Object.is(this.previousInputValues.get(name), value)) {
        return;
      }

      const lView = this._rootLView;
      setInputsForProperty(lView[TVIEW], lView, dataValue, name, value);
      this.previousInputValues.set(name, value);
      const childComponentLView = getComponentLViewByIndex(this._tNode.index, lView);
      markViewDirty(childComponentLView);
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

/** Represents a HostFeature function. */
type HostFeature = (<T>(component: T, componentDef: ComponentDef<T>) => void);

// TODO: A hack to not pull in the NullInjector from @angular/core.
export const NULL_INJECTOR: Injector = {
  get: (token: any, notFoundValue?: any) => {
    throwProviderNotFoundError(token, 'NullInjector');
  }
};

/** Creates a TNode that can be used to instantiate a root component. */
function createRootComponentTNode(lView: LView, rNode: RNode): TElementNode {
  const tView = lView[TVIEW];
  const index = HEADER_OFFSET;
  ngDevMode && assertIndexInRange(lView, index);
  lView[index] = rNode;

  // '#host' is added here as we don't know the real host DOM name (we don't want to read it) and at
  // the same time we want to communicate the debug `TNode` that this is a special `TNode`
  // representing a host element.
  return getOrCreateTNode(tView, index, TNodeType.Element, '#host', null);
}

/**
 * Creates the root component view and the root component node.
 *
 * @param hostRNode Render host element.
 * @param rootComponentDef ComponentDef
 * @param rootView The parent view where the host node is stored
 * @param rendererFactory Factory to be used for creating child renderers.
 * @param hostRenderer The current renderer
 * @param sanitizer The sanitizer, if provided
 *
 * @returns Component view created
 */
function createRootComponentView(
    tNode: TElementNode, hostRNode: RElement|null, rootComponentDef: ComponentDef<any>,
    rootDirectives: DirectiveDef<any>[], rootView: LView, environment: LViewEnvironment,
    hostRenderer: Renderer): LView {
  const tView = rootView[TVIEW];
  applyRootComponentStyling(rootDirectives, tNode, hostRNode, hostRenderer);

  // Hydration info is on the host element and needs to be retreived
  // and passed to the component LView.
  let hydrationInfo: DehydratedView|null = null;
  if (hostRNode !== null) {
    hydrationInfo = retrieveHydrationInfo(hostRNode, rootView[INJECTOR]!);
  }
  const viewRenderer = environment.rendererFactory.createRenderer(hostRNode, rootComponentDef);
  const componentView = createLView(
      rootView, getOrCreateComponentTView(rootComponentDef), null,
      rootComponentDef.onPush ? LViewFlags.Dirty : LViewFlags.CheckAlways, rootView[tNode.index],
      tNode, environment, viewRenderer, null, null, hydrationInfo);

  if (tView.firstCreatePass) {
    markAsComponentHost(tView, tNode, rootDirectives.length - 1);
  }

  addToViewTree(rootView, componentView);

  // Store component view at node index, with node as the HOST
  return rootView[tNode.index] = componentView;
}

/** Sets up the styling information on a root component. */
function applyRootComponentStyling(
    rootDirectives: DirectiveDef<any>[], tNode: TElementNode, rNode: RElement|null,
    hostRenderer: Renderer): void {
  for (const def of rootDirectives) {
    tNode.mergedAttrs = mergeHostAttrs(tNode.mergedAttrs, def.hostAttrs);
  }

  if (tNode.mergedAttrs !== null) {
    computeStaticStyling(tNode, tNode.mergedAttrs, true);

    if (rNode !== null) {
      setupStaticAttributes(hostRenderer, rNode, tNode);
    }
  }
}

/**
 * Creates a root component and sets it up with features and host bindings.Shared by
 * renderComponent() and ViewContainerRef.createComponent().
 */
function createRootComponent<T>(
    componentView: LView, rootComponentDef: ComponentDef<T>, rootDirectives: DirectiveDef<any>[],
    hostDirectiveDefs: HostDirectiveDefs|null, rootLView: LView,
    hostFeatures: HostFeature[]|null): any {
  const rootTNode = getCurrentTNode() as TElementNode;
  ngDevMode && assertDefined(rootTNode, 'tNode should have been already created');
  const tView = rootLView[TVIEW];
  const native = getNativeByTNode(rootTNode, rootLView);

  initializeDirectives(tView, rootLView, rootTNode, rootDirectives, null, hostDirectiveDefs);

  for (let i = 0; i < rootDirectives.length; i++) {
    const directiveIndex = rootTNode.directiveStart + i;
    const directiveInstance = getNodeInjectable(rootLView, tView, directiveIndex, rootTNode);
    attachPatchData(directiveInstance, rootLView);
  }

  invokeDirectivesHostBindings(tView, rootLView, rootTNode);

  if (native) {
    attachPatchData(native, rootLView);
  }

  // We're guaranteed for the `componentOffset` to be positive here
  // since a root component always matches a component def.
  ngDevMode &&
      assertGreaterThan(rootTNode.componentOffset, -1, 'componentOffset must be great than -1');
  const component = getNodeInjectable(
      rootLView, tView, rootTNode.directiveStart + rootTNode.componentOffset, rootTNode);
  componentView[CONTEXT] = rootLView[CONTEXT] = component;

  if (hostFeatures !== null) {
    for (const feature of hostFeatures) {
      feature(component, rootComponentDef);
    }
  }

  // We want to generate an empty QueryList for root content queries for backwards
  // compatibility with ViewEngine.
  executeContentQueries(tView, rootTNode, componentView);

  return component;
}

/** Sets the static attributes on a root component. */
function setRootNodeAttributes(
    hostRenderer: Renderer2, componentDef: ComponentDef<unknown>, hostRNode: RElement,
    rootSelectorOrNode: any) {
  if (rootSelectorOrNode) {
    setUpAttributes(hostRenderer, hostRNode, ['ng-version', VERSION.full]);
  } else {
    // If host element is created as a part of this function call (i.e. `rootSelectorOrNode`
    // is not defined), also apply attributes and classes extracted from component selector.
    // Extract attributes and classes from the first selector only to match VE behavior.
    const {attrs, classes} = extractAttrsAndClassesFromSelector(componentDef.selectors[0]);
    if (attrs) {
      setUpAttributes(hostRenderer, hostRNode, attrs);
    }
    if (classes && classes.length > 0) {
      writeDirectClass(hostRenderer, hostRNode, classes.join(' '));
    }
  }
}

/** Projects the `projectableNodes` that were specified when creating a root component. */
function projectNodes(
    tNode: TElementNode, ngContentSelectors: string[], projectableNodes: any[][]) {
  const projection: (TNode|RNode[]|null)[] = tNode.projection = [];
  for (let i = 0; i < ngContentSelectors.length; i++) {
    const nodesforSlot = projectableNodes[i];
    // Projectable nodes can be passed as array of arrays or an array of iterables (ngUpgrade
    // case). Here we do normalize passed data structure to be an array of arrays to avoid
    // complex checks down the line.
    // We also normalize the length of the passed in projectable nodes (to match the number of
    // <ng-container> slots defined by a component).
    projection.push(nodesforSlot != null ? Array.from(nodesforSlot) : null);
  }
}

/**
 * Used to enable lifecycle hooks on the root component.
 *
 * Include this feature when calling `renderComponent` if the root component
 * you are rendering has lifecycle hooks defined. Otherwise, the hooks won't
 * be called properly.
 *
 * Example:
 *
 * ```
 * renderComponent(AppComponent, {hostFeatures: [LifecycleHooksFeature]});
 * ```
 */
export function LifecycleHooksFeature(): void {
  const tNode = getCurrentTNode()!;
  ngDevMode && assertDefined(tNode, 'TNode is required');
  registerPostOrderHooks(getLView()[TVIEW], tNode);
}
