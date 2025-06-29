/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {setActiveConsumer} from '../../primitives/signals';

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
import {getComponentDef, getDirectiveDef, getDirectiveDefOrThrow} from './def_getters';
import {depsTracker} from './deps_tracker/deps_tracker';
import {NodeInjector} from './di';
import {reportUnknownPropertyError} from './instructions/element_validation';
import {markViewDirty} from './instructions/mark_view_dirty';
import {renderView} from './instructions/render';
import {
  createDirectivesInstances,
  locateHostElement,
  setAllInputsForProperty,
} from './instructions/shared';
import {ComponentDef, ComponentTemplate, DirectiveDef, RenderFlags} from './interfaces/definition';
import {InputFlags} from './interfaces/input_flags';
import {TContainerNode, TElementContainerNode, TElementNode, TNode} from './interfaces/node';
import {RElement, RNode} from './interfaces/renderer_dom';
import {
  CONTEXT,
  HEADER_OFFSET,
  LView,
  LViewEnvironment,
  LViewFlags,
  TView,
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
import {createLView, createTView, getInitialLViewFlagsFromDef} from './view/construction';
import {BINDING, Binding, BindingInternal, DirectiveWithBindings} from './dynamic_bindings';
import {NG_REFLECT_ATTRS_FLAG, NG_REFLECT_ATTRS_FLAG_DEFAULT} from '../ng_reflect';

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

function toInputRefArray<T>(map: DirectiveDef<T>['inputs']): ComponentFactory<T>['inputs'] {
  return Object.keys(map).map((name) => {
    const [propName, flags, transform] = map[name];
    const inputData: ComponentFactory<T>['inputs'][0] = {
      propName: propName,
      templateName: name,
      isSignal: (flags & InputFlags.SignalBased) !== 0,
    };
    if (transform) {
      inputData.transform = transform;
    }
    return inputData;
  });
}

function toOutputRefArray<T>(map: DirectiveDef<T>['outputs']): ComponentFactory<T>['outputs'] {
  return Object.keys(map).map((name) => ({propName: map[name], templateName: name}));
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

  let ngReflect = false;
  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    ngReflect = rootLViewInjector.get(NG_REFLECT_ATTRS_FLAG, NG_REFLECT_ATTRS_FLAG_DEFAULT);
  }

  return {
    rendererFactory,
    sanitizer,
    changeDetectionScheduler,
    ngReflect,
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
  private cachedInputs:
    | {
        propName: string;
        templateName: string;
        isSignal: boolean;
        transform?: (value: any) => any;
      }[]
    | null = null;
  private cachedOutputs: {propName: string; templateName: string}[] | null = null;

  override get inputs(): {
    propName: string;
    templateName: string;
    isSignal: boolean;
    transform?: (value: any) => any;
  }[] {
    this.cachedInputs ??= toInputRefArray(this.componentDef.inputs);
    return this.cachedInputs;
  }

  override get outputs(): {propName: string; templateName: string}[] {
    this.cachedOutputs ??= toOutputRefArray(this.componentDef.outputs);
    return this.cachedOutputs;
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
    directives?: (Type<unknown> | DirectiveWithBindings<unknown>)[],
    componentBindings?: Binding[],
  ): AbstractComponentRef<T> {
    profiler(ProfilerEvent.DynamicComponentStart);

    const prevConsumer = setActiveConsumer(null);
    try {
      const cmpDef = this.componentDef;
      ngDevMode && verifyNotAnOrphanComponent(cmpDef);

      const rootTView = createRootTView(rootSelectorOrNode, cmpDef, componentBindings, directives);
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
      const hasInputBindings =
        componentBindings?.some(isInputBinding) ||
        directives?.some((d) => typeof d !== 'function' && d.bindings.some(isInputBinding));

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
          () => rootTView.directiveRegistry,
          true,
          0,
        );

        // ---- element instruction

        // TODO(crisbeto): in practice `hostElement` should always be defined, but there are some
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

      return new ComponentRef(this.componentType, rootLView, !!hasInputBindings);
    } finally {
      setActiveConsumer(prevConsumer);
    }
  }
}

function createRootTView(
  rootSelectorOrNode: any,
  componentDef: ComponentDef<unknown>,
  componentBindings: Binding[] | undefined,
  directives: (Type<unknown> | DirectiveWithBindings<unknown>)[] | undefined,
): TView {
  const tAttributes = rootSelectorOrNode
    ? ['ng-version', '0.0.0-PLACEHOLDER']
    : // Extract attributes and classes from the first selector only to match VE behavior.
      extractAttrsAndClassesFromSelector(componentDef.selectors[0]);
  let creationBindings: Binding[] | null = null;
  let updateBindings: Binding[] | null = null;
  let varsToAllocate = 0;

  if (componentBindings) {
    for (const binding of componentBindings as BindingInternal[]) {
      varsToAllocate += binding[BINDING].requiredVars;

      if (binding.create) {
        (binding as BindingInternal).targetIdx = 0;
        (creationBindings ??= []).push(binding);
      }

      if (binding.update) {
        (binding as BindingInternal).targetIdx = 0;
        (updateBindings ??= []).push(binding);
      }
    }
  }

  if (directives) {
    for (let i = 0; i < directives.length; i++) {
      const directive = directives[i];
      if (typeof directive !== 'function') {
        for (const binding of directive.bindings as BindingInternal[]) {
          varsToAllocate += binding[BINDING].requiredVars;
          const targetDirectiveIdx = i + 1;
          if (binding.create) {
            (binding as BindingInternal).targetIdx = targetDirectiveIdx;
            (creationBindings ??= []).push(binding);
          }

          if (binding.update) {
            (binding as BindingInternal).targetIdx = targetDirectiveIdx;
            (updateBindings ??= []).push(binding);
          }
        }
      }
    }
  }

  const directivesToApply: DirectiveDef<unknown>[] = [componentDef];
  if (directives) {
    for (const directive of directives) {
      const directiveType = typeof directive === 'function' ? directive : directive.type;
      const directiveDef = ngDevMode
        ? getDirectiveDefOrThrow(directiveType)
        : getDirectiveDef(directiveType)!;

      if (ngDevMode && !directiveDef.standalone) {
        throw new RuntimeError(
          RuntimeErrorCode.TYPE_IS_NOT_STANDALONE,
          `The ${stringifyForError(directiveType)} directive must be standalone in ` +
            `order to be applied to a dynamically-created component.`,
        );
      }

      directivesToApply.push(directiveDef);
    }
  }

  const rootTView = createTView(
    TViewType.Root,
    null,
    getRootTViewTemplate(creationBindings, updateBindings),
    1,
    varsToAllocate,
    directivesToApply,
    null,
    null,
    null,
    [tAttributes],
    null,
  );

  return rootTView;
}

function getRootTViewTemplate(
  creationBindings: Binding[] | null,
  updateBindings: Binding[] | null,
): ComponentTemplate<unknown> | null {
  if (!creationBindings && !updateBindings) {
    return null;
  }

  return (flags) => {
    if (flags & RenderFlags.Create && creationBindings) {
      for (const binding of creationBindings as BindingInternal[]) {
        binding.create!();
      }
    }

    if (flags & RenderFlags.Update && updateBindings) {
      for (const binding of updateBindings as BindingInternal[]) {
        binding.update!();
      }
    }
  };
}

function isInputBinding(binding: Binding): boolean {
  const kind = (binding as BindingInternal)[BINDING].kind;
  return kind === 'input' || kind === 'twoWay';
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
    private readonly _rootLView: LView,
    private readonly _hasInputBindings: boolean,
  ) {
    super();
    this._tNode = getTNode(_rootLView[TVIEW], HEADER_OFFSET) as TElementNode;
    this.location = createElementRef(this._tNode, _rootLView);
    this.instance = getComponentLViewByIndex(this._tNode.index, _rootLView)[CONTEXT] as T;
    this.hostView = this.changeDetectorRef = new ViewRef<T>(
      _rootLView,
      undefined /* _cdRefInjectingView */,
    );
    this.componentType = componentType;
  }

  override setInput(name: string, value: unknown): void {
    if (this._hasInputBindings && ngDevMode) {
      throw new RuntimeError(
        RuntimeErrorCode.INVALID_SET_INPUT_CALL,
        'Cannot call `setInput` on a component that is using the `inputBinding` or `twoWayBinding` functions.',
      );
    }

    const tNode = this._tNode;
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
    const hasSetInput = setAllInputsForProperty(tNode, lView[TVIEW], lView, name, value);
    this.previousInputValues.set(name, value);
    const childComponentLView = getComponentLViewByIndex(tNode.index, lView);
    markViewDirty(childComponentLView, NotificationSource.SetInput);

    if (ngDevMode && !hasSetInput) {
      const cmpNameForError = stringifyForError(this.componentType);
      let message = `Can't set value of the '${name}' input on the '${cmpNameForError}' component. `;
      message += `Make sure that the '${name}' property is declared as an input using the @Input() decorator or the input() function.`;
      reportUnknownPropertyError(message);
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
