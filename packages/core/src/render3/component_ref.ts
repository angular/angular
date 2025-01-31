/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {setActiveConsumer} from '@angular/core/primitives/signals';

import {ChangeDetectorRef} from '../change_detection/change_detector_ref';
import {
  ChangeDetectionScheduler,
  NotificationSource,
} from '../change_detection/scheduling/zoneless_scheduling';
import {Injector} from '../di/injector';
import {EnvironmentInjector} from '../di/r3_injector';
import {RuntimeError, RuntimeErrorCode} from '../errors';
import {Type} from '../interface/type';
import {
  ComponentFactory as AbstractComponentFactory,
  ComponentRef as AbstractComponentRef,
} from '../linker/component_factory';
import {ComponentFactoryResolver as AbstractComponentFactoryResolver} from '../linker/component_factory_resolver';
import {createElementRef, ElementRef} from '../linker/element_ref';
import {NgModuleRef} from '../linker/ng_module_factory';
import {RendererFactory2} from '../render/api';
import {Sanitizer} from '../sanitization/sanitizer';

import {assertComponentType} from './assert';
import {attachPatchData} from './context_discovery';
import {getComponentDef} from './def_getters';
import {depsTracker} from './deps_tracker/deps_tracker';
import {NodeInjector} from './di';
import {registerPostOrderHooks} from './hooks';
import {reportUnknownPropertyError} from './instructions/element_validation';
import {markViewDirty} from './instructions/mark_view_dirty';
import {renderView} from './instructions/render';
import {
  createDirectivesInstances,
  createLView,
  createTView,
  getInitialLViewFlagsFromDef,
  locateHostElement,
  setInputsForProperty,
} from './instructions/shared';
import {ComponentDef, DirectiveDef} from './interfaces/definition';
import {InputFlags} from './interfaces/input_flags';
import {
  NodeInputBindings,
  TContainerNode,
  TElementContainerNode,
  TElementNode,
  TNode,
} from './interfaces/node';
import {RElement, RNode} from './interfaces/renderer_dom';
import {
  CONTEXT,
  HEADER_OFFSET,
  LView,
  LViewEnvironment,
  LViewFlags,
  TVIEW,
  TViewType,
} from './interfaces/view';
import {MATH_ML_NAMESPACE, SVG_NAMESPACE} from './namespaces';

import {retrieveHydrationInfo} from '../hydration/utils';
import {ChainedInjector} from './chained_injector';
import {createElementNode, setupStaticAttributes} from './dom_node_manipulation';
import {unregisterLView} from './interfaces/lview_tracking';
import {Renderer} from './interfaces/renderer';
import {
  extractAttrsAndClassesFromSelector,
  stringifyCSSSelectorList,
} from './node_selector_matcher';
import {profiler} from './profiler';
import {ProfilerEvent} from './profiler_types';
import {executeContentQueries} from './queries/query_execution';
import {enterView, leaveView} from './state';
import {debugStringifyTypeForError, stringifyForError} from './util/stringify_utils';
import {getComponentLViewByIndex, getTNode} from './util/view_utils';
import {elementEndFirstCreatePass, elementStartFirstCreatePass} from './view/elements';
import {ViewRef} from './view_ref';

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

function toRefArray<T>(
  map: DirectiveDef<T>['inputs'],
  isInputMap: true,
): ComponentFactory<T>['inputs'];
function toRefArray<T>(
  map: DirectiveDef<T>['outputs'],
  isInput: false,
): ComponentFactory<T>['outputs'];

function toRefArray<
  T,
  IsInputMap extends boolean,
  Return extends IsInputMap extends true
    ? ComponentFactory<T>['inputs']
    : ComponentFactory<T>['outputs'],
>(map: DirectiveDef<T>['inputs'] | DirectiveDef<T>['outputs'], isInputMap: IsInputMap): Return {
  const array: Return = [] as unknown as Return;
  for (const publicName in map) {
    if (!map.hasOwnProperty(publicName)) {
      continue;
    }

    const value = map[publicName];
    if (value === undefined) {
      continue;
    }

    const isArray = Array.isArray(value);
    const propName: string = isArray ? value[0] : value;
    const flags: InputFlags = isArray ? value[1] : InputFlags.None;

    if (isInputMap) {
      (array as ComponentFactory<T>['inputs']).push({
        propName: propName,
        templateName: publicName,
        isSignal: (flags & InputFlags.SignalBased) !== 0,
      });
    } else {
      (array as ComponentFactory<T>['outputs']).push({
        propName: propName,
        templateName: publicName,
      });
    }
  }
  return array;
}

function verifyNotAnOrphanComponent(componentDef: ComponentDef<unknown>) {
  // TODO(pk): create assert that verifies ngDevMode
  if (
    (typeof ngJitMode === 'undefined' || ngJitMode) &&
    componentDef.debugInfo?.forbidOrphanRendering
  ) {
    if (depsTracker.isOrphanComponent(componentDef.type)) {
      throw new RuntimeError(
        RuntimeErrorCode.RUNTIME_DEPS_ORPHAN_COMPONENT,
        `Orphan component found! Trying to render the component ${debugStringifyTypeForError(
          componentDef.type,
        )} without first loading the NgModule that declares it. It is recommended to make this component standalone in order to avoid this error. If this is not possible now, import the component's NgModule in the appropriate NgModule, or the standalone component in which you are trying to render this component. If this is a lazy import, load the NgModule lazily as well and use its module injector.`,
      );
    }
  }
}

function createRootViewInjector(
  componentDef: ComponentDef<unknown>,
  environmentInjector: EnvironmentInjector | NgModuleRef<any> | undefined,
  injector: Injector,
): Injector {
  let realEnvironmentInjector =
    environmentInjector instanceof EnvironmentInjector
      ? environmentInjector
      : environmentInjector?.injector;

  if (realEnvironmentInjector && componentDef.getStandaloneInjector !== null) {
    realEnvironmentInjector =
      componentDef.getStandaloneInjector(realEnvironmentInjector) || realEnvironmentInjector;
  }

  const rootViewInjector = realEnvironmentInjector
    ? new ChainedInjector(injector, realEnvironmentInjector)
    : injector;
  return rootViewInjector;
}

function createRootLViewEnvironment(rootLViewInjector: Injector): LViewEnvironment {
  const rendererFactory = rootLViewInjector.get(RendererFactory2, null);
  if (rendererFactory === null) {
    throw new RuntimeError(
      RuntimeErrorCode.RENDERER_NOT_FOUND,
      ngDevMode &&
        'Angular was not able to inject a renderer (RendererFactory2). ' +
          'Likely this is due to a broken DI hierarchy. ' +
          'Make sure that any injector used to create this component has a correct parent.',
    );
  }

  const sanitizer = rootLViewInjector.get(Sanitizer, null);
  const changeDetectionScheduler = rootLViewInjector.get(ChangeDetectionScheduler, null);

  return {
    rendererFactory,
    sanitizer,
    changeDetectionScheduler,
  };
}

function createHostElement(componentDef: ComponentDef<unknown>, render: Renderer): RElement {
  // Determine a tag name used for creating host elements when this component is created
  // dynamically. Default to 'div' if this component did not specify any tag name in its
  // selector.
  const tagName = ((componentDef.selectors[0][0] as string) || 'div').toLowerCase();
  const namespace =
    tagName === 'svg' ? SVG_NAMESPACE : tagName === 'math' ? MATH_ML_NAMESPACE : null;
  return createElementNode(render, tagName, namespace);
}

/**
 * ComponentFactory interface implementation.
 */
export class ComponentFactory<T> extends AbstractComponentFactory<T> {
  override selector: string;
  override componentType: Type<any>;
  override ngContentSelectors: string[];
  isBoundToModule: boolean;

  override get inputs(): {
    propName: string;
    templateName: string;
    isSignal: boolean;
    transform?: (value: any) => any;
  }[] {
    const componentDef = this.componentDef;
    const inputTransforms = componentDef.inputTransforms;
    const refArray = toRefArray(componentDef.inputs, true);

    if (inputTransforms !== null) {
      for (const input of refArray) {
        if (inputTransforms.hasOwnProperty(input.propName)) {
          input.transform = inputTransforms[input.propName];
        }
      }
    }

    return refArray;
  }

  override get outputs(): {propName: string; templateName: string}[] {
    return toRefArray(this.componentDef.outputs, false);
  }

  /**
   * @param componentDef The component definition.
   * @param ngModule The NgModuleRef to which the factory is bound.
   */
  constructor(
    private componentDef: ComponentDef<any>,
    private ngModule?: NgModuleRef<any>,
  ) {
    super();
    this.componentType = componentDef.type;
    this.selector = stringifyCSSSelectorList(componentDef.selectors);
    this.ngContentSelectors = componentDef.ngContentSelectors ?? [];
    this.isBoundToModule = !!ngModule;
  }

  override create(
    injector: Injector,
    projectableNodes?: any[][] | undefined,
    rootSelectorOrNode?: any,
    environmentInjector?: NgModuleRef<any> | EnvironmentInjector | undefined,
  ): AbstractComponentRef<T> {
    profiler(ProfilerEvent.DynamicComponentStart);

    const prevConsumer = setActiveConsumer(null);
    try {
      const cmpDef = this.componentDef;
      ngDevMode && verifyNotAnOrphanComponent(cmpDef);

      const tAttributes = rootSelectorOrNode
        ? ['ng-version', '0.0.0-PLACEHOLDER']
        : // Extract attributes and classes from the first selector only to match VE behavior.
          extractAttrsAndClassesFromSelector(this.componentDef.selectors[0]);
      // Create the root view. Uses empty TView and ContentTemplate.
      const rootTView = createTView(
        TViewType.Root,
        null,
        null,
        1,
        0,
        null,
        null,
        null,
        null,
        [tAttributes],
        null,
      );

      const rootViewInjector = createRootViewInjector(
        cmpDef,
        environmentInjector || this.ngModule,
        injector,
      );

      const environment = createRootLViewEnvironment(rootViewInjector);
      const hostRenderer = environment.rendererFactory.createRenderer(null, cmpDef);
      const hostElement = rootSelectorOrNode
        ? locateHostElement(
            hostRenderer,
            rootSelectorOrNode,
            cmpDef.encapsulation,
            rootViewInjector,
          )
        : createHostElement(cmpDef, hostRenderer);

      const rootLView = createLView<T>(
        null,
        rootTView,
        null,
        LViewFlags.IsRoot | getInitialLViewFlagsFromDef(cmpDef),
        null,
        null,
        environment,
        hostRenderer,
        rootViewInjector,
        null,
        retrieveHydrationInfo(hostElement, rootViewInjector, true /* isRootView */),
      );

      rootLView[HEADER_OFFSET] = hostElement;

      // rootView is the parent when bootstrapping
      // TODO(misko): it looks like we are entering view here but we don't really need to as
      // `renderView` does that. However as the code is written it is needed because
      // `createRootComponentView` and `createRootComponent` both read global state. Fixing those
      // issues would allow us to drop this.
      enterView(rootLView);

      let componentView: LView | null = null;

      try {
        const hostTNode = elementStartFirstCreatePass(
          HEADER_OFFSET,
          rootTView,
          rootLView,
          '#host',
          () => [this.componentDef],
          true,
          0,
        );

        // ---- element instruction

        // TODO(crisbeto): in practice `hostRNode` should always be defined, but there are some
        // tests where the renderer is mocked out and `undefined` is returned. We should update the
        // tests so that this check can be removed.
        if (hostElement) {
          setupStaticAttributes(hostRenderer, hostElement, hostTNode);
          attachPatchData(hostElement, rootLView);
        }

        // TODO(pk): this logic is similar to the instruction code where a node can have directives
        createDirectivesInstances(rootTView, rootLView, hostTNode);
        executeContentQueries(rootTView, hostTNode, rootLView);

        elementEndFirstCreatePass(rootTView, hostTNode);

        if (projectableNodes !== undefined) {
          projectNodes(hostTNode, this.ngContentSelectors, projectableNodes);
        }

        componentView = getComponentLViewByIndex(hostTNode.index, rootLView);

        // TODO(pk): why do we need this logic?
        rootLView[CONTEXT] = componentView[CONTEXT] as T;

        renderView(rootTView, rootLView, null);
      } catch (e) {
        // Stop tracking the views if creation failed since
        // the consumer won't have a way to dereference them.
        if (componentView !== null) {
          unregisterLView(componentView);
        }
        unregisterLView(rootLView);
        throw e;
      } finally {
        profiler(ProfilerEvent.DynamicComponentEnd);
        leaveView();
      }

      return new ComponentRef(this.componentType, rootLView);
    } finally {
      setActiveConsumer(prevConsumer);
    }
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
  override location: ElementRef;
  private previousInputValues: Map<string, unknown> | null = null;
  private _tNode: TElementNode | TContainerNode | TElementContainerNode;

  constructor(
    componentType: Type<T>,
    private _rootLView: LView,
  ) {
    super();
    this._tNode = getTNode(_rootLView[TVIEW], HEADER_OFFSET) as TElementNode;
    this.location = createElementRef(this._tNode, _rootLView);
    this.instance = getComponentLViewByIndex(this._tNode.index, _rootLView)[CONTEXT] as T;
    this.hostView = this.changeDetectorRef = new ViewRef<T>(
      _rootLView,
      undefined /* _cdRefInjectingView */,
      false /* notifyErrorHandler */,
    );
    this.componentType = componentType;
  }

  override setInput(name: string, value: unknown): void {
    const inputData = this._tNode.inputs;
    let dataValue: NodeInputBindings[typeof name] | undefined;
    if (inputData !== null && (dataValue = inputData[name])) {
      this.previousInputValues ??= new Map();
      // Do not set the input if it is the same as the last value
      // This behavior matches `bindingUpdated` when binding inputs in templates.
      if (
        this.previousInputValues.has(name) &&
        Object.is(this.previousInputValues.get(name), value)
      ) {
        return;
      }

      const lView = this._rootLView;
      setInputsForProperty(lView[TVIEW], lView, dataValue, name, value);
      this.previousInputValues.set(name, value);
      const childComponentLView = getComponentLViewByIndex(this._tNode.index, lView);
      markViewDirty(childComponentLView, NotificationSource.SetInput);
    } else {
      if (ngDevMode) {
        const cmpNameForError = stringifyForError(this.componentType);
        let message = `Can't set value of the '${name}' input on the '${cmpNameForError}' component. `;
        message += `Make sure that the '${name}' property is annotated with @Input() or a mapped @Input('${name}') exists.`;
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

/** Projects the `projectableNodes` that were specified when creating a root component. */
function projectNodes(
  tNode: TElementNode,
  ngContentSelectors: string[],
  projectableNodes: any[][],
) {
  const projection: (TNode | RNode[] | null)[] = (tNode.projection = []);
  for (let i = 0; i < ngContentSelectors.length; i++) {
    const nodesforSlot = projectableNodes[i];
    // Projectable nodes can be passed as array of arrays or an array of iterables (ngUpgrade
    // case). Here we do normalize passed data structure to be an array of arrays to avoid
    // complex checks down the line.
    // We also normalize the length of the passed in projectable nodes (to match the number of
    // <ng-container> slots defined by a component).
    projection.push(nodesforSlot != null && nodesforSlot.length ? Array.from(nodesforSlot) : null);
  }
}
