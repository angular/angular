/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {setActiveConsumer} from '../../primitives/signals';
import {ChangeDetectionScheduler} from '../change_detection/scheduling/zoneless_scheduling';
import {EnvironmentInjector} from '../di/r3_injector';
import {RuntimeError} from '../errors';
import {
  ComponentFactory as AbstractComponentFactory,
  ComponentRef as AbstractComponentRef,
} from '../linker/component_factory';
import {ComponentFactoryResolver as AbstractComponentFactoryResolver} from '../linker/component_factory_resolver';
import {createElementRef} from '../linker/element_ref';
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
import {InputFlags} from './interfaces/input_flags';
import {CONTEXT, HEADER_OFFSET, TVIEW} from './interfaces/view';
import {MATH_ML_NAMESPACE, SVG_NAMESPACE} from './namespaces';
import {retrieveHydrationInfo} from '../hydration/utils';
import {ChainedInjector} from './chained_injector';
import {createElementNode, setupStaticAttributes} from './dom_node_manipulation';
import {unregisterLView} from './interfaces/lview_tracking';
import {
  extractAttrsAndClassesFromSelector,
  stringifyCSSSelectorList,
} from './node_selector_matcher';
import {profiler} from './profiler';
import {executeContentQueries} from './queries/query_execution';
import {enterView, leaveView} from './state';
import {debugStringifyTypeForError, stringifyForError} from './util/stringify_utils';
import {getComponentLViewByIndex, getTNode} from './util/view_utils';
import {directiveHostEndFirstCreatePass, directiveHostFirstCreatePass} from './view/elements';
import {ViewRef} from './view_ref';
import {createLView, createTView, getInitialLViewFlagsFromDef} from './view/construction';
import {BINDING} from './dynamic_bindings';
import {NG_REFLECT_ATTRS_FLAG, NG_REFLECT_ATTRS_FLAG_DEFAULT} from '../ng_reflect';
export class ComponentFactoryResolver extends AbstractComponentFactoryResolver {
  /**
   * @param ngModule The NgModuleRef to which all resolved factories are bound.
   */
  constructor(ngModule) {
    super();
    this.ngModule = ngModule;
  }
  resolveComponentFactory(component) {
    ngDevMode && assertComponentType(component);
    const componentDef = getComponentDef(component);
    return new ComponentFactory(componentDef, this.ngModule);
  }
}
function toInputRefArray(map) {
  return Object.keys(map).map((name) => {
    const [propName, flags, transform] = map[name];
    const inputData = {
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
function toOutputRefArray(map) {
  return Object.keys(map).map((name) => ({propName: map[name], templateName: name}));
}
function verifyNotAnOrphanComponent(componentDef) {
  // TODO(pk): create assert that verifies ngDevMode
  if (
    (typeof ngJitMode === 'undefined' || ngJitMode) &&
    componentDef.debugInfo?.forbidOrphanRendering
  ) {
    if (depsTracker.isOrphanComponent(componentDef.type)) {
      throw new RuntimeError(
        981 /* RuntimeErrorCode.RUNTIME_DEPS_ORPHAN_COMPONENT */,
        `Orphan component found! Trying to render the component ${debugStringifyTypeForError(componentDef.type)} without first loading the NgModule that declares it. It is recommended to make this component standalone in order to avoid this error. If this is not possible now, import the component's NgModule in the appropriate NgModule, or the standalone component in which you are trying to render this component. If this is a lazy import, load the NgModule lazily as well and use its module injector.`,
      );
    }
  }
}
function createRootViewInjector(componentDef, environmentInjector, injector) {
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
function createRootLViewEnvironment(rootLViewInjector) {
  const rendererFactory = rootLViewInjector.get(RendererFactory2, null);
  if (rendererFactory === null) {
    throw new RuntimeError(
      407 /* RuntimeErrorCode.RENDERER_NOT_FOUND */,
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
function createHostElement(componentDef, renderer) {
  // Determine a tag name used for creating host elements when this component is created
  // dynamically. Default to 'div' if this component did not specify any tag name in its
  // selector.
  const tagName = inferTagNameFromDefinition(componentDef);
  const namespace =
    tagName === 'svg' ? SVG_NAMESPACE : tagName === 'math' ? MATH_ML_NAMESPACE : null;
  return createElementNode(renderer, tagName, namespace);
}
/**
 * Infers the tag name that should be used for a component based on its definition.
 * @param componentDef Definition for which to resolve the tag name.
 */
export function inferTagNameFromDefinition(componentDef) {
  // Take the tag name from the first selector in the
  // definition. If there is none, fall back to `div`.
  return (componentDef.selectors[0][0] || 'div').toLowerCase();
}
/**
 * ComponentFactory interface implementation.
 */
export class ComponentFactory extends AbstractComponentFactory {
  get inputs() {
    this.cachedInputs ?? (this.cachedInputs = toInputRefArray(this.componentDef.inputs));
    return this.cachedInputs;
  }
  get outputs() {
    this.cachedOutputs ?? (this.cachedOutputs = toOutputRefArray(this.componentDef.outputs));
    return this.cachedOutputs;
  }
  /**
   * @param componentDef The component definition.
   * @param ngModule The NgModuleRef to which the factory is bound.
   */
  constructor(componentDef, ngModule) {
    super();
    this.componentDef = componentDef;
    this.ngModule = ngModule;
    this.cachedInputs = null;
    this.cachedOutputs = null;
    this.componentType = componentDef.type;
    this.selector = stringifyCSSSelectorList(componentDef.selectors);
    this.ngContentSelectors = componentDef.ngContentSelectors ?? [];
    this.isBoundToModule = !!ngModule;
  }
  create(
    injector,
    projectableNodes,
    rootSelectorOrNode,
    environmentInjector,
    directives,
    componentBindings,
  ) {
    profiler(22 /* ProfilerEvent.DynamicComponentStart */);
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
      const rootLView = createLView(
        null,
        rootTView,
        null,
        512 /* LViewFlags.IsRoot */ | getInitialLViewFlagsFromDef(cmpDef),
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
      let componentView = null;
      try {
        const hostTNode = directiveHostFirstCreatePass(
          HEADER_OFFSET,
          rootLView,
          2 /* TNodeType.Element */,
          '#host',
          () => rootTView.directiveRegistry,
          true,
          0,
        );
        // ---- element instruction
        setupStaticAttributes(hostRenderer, hostElement, hostTNode);
        attachPatchData(hostElement, rootLView);
        // TODO(pk): this logic is similar to the instruction code where a node can have directives
        createDirectivesInstances(rootTView, rootLView, hostTNode);
        executeContentQueries(rootTView, hostTNode, rootLView);
        directiveHostEndFirstCreatePass(rootTView, hostTNode);
        if (projectableNodes !== undefined) {
          projectNodes(hostTNode, this.ngContentSelectors, projectableNodes);
        }
        componentView = getComponentLViewByIndex(hostTNode.index, rootLView);
        // TODO(pk): why do we need this logic?
        rootLView[CONTEXT] = componentView[CONTEXT];
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
        profiler(23 /* ProfilerEvent.DynamicComponentEnd */);
        leaveView();
      }
      return new ComponentRef(this.componentType, rootLView, !!hasInputBindings);
    } finally {
      setActiveConsumer(prevConsumer);
    }
  }
}
function createRootTView(rootSelectorOrNode, componentDef, componentBindings, directives) {
  const tAttributes = rootSelectorOrNode
    ? ['ng-version', '0.0.0-PLACEHOLDER']
    : // Extract attributes and classes from the first selector only to match VE behavior.
      extractAttrsAndClassesFromSelector(componentDef.selectors[0]);
  let creationBindings = null;
  let updateBindings = null;
  let varsToAllocate = 0;
  if (componentBindings) {
    for (const binding of componentBindings) {
      varsToAllocate += binding[BINDING].requiredVars;
      if (binding.create) {
        binding.targetIdx = 0;
        (creationBindings ?? (creationBindings = [])).push(binding);
      }
      if (binding.update) {
        binding.targetIdx = 0;
        (updateBindings ?? (updateBindings = [])).push(binding);
      }
    }
  }
  if (directives) {
    for (let i = 0; i < directives.length; i++) {
      const directive = directives[i];
      if (typeof directive !== 'function') {
        for (const binding of directive.bindings) {
          varsToAllocate += binding[BINDING].requiredVars;
          const targetDirectiveIdx = i + 1;
          if (binding.create) {
            binding.targetIdx = targetDirectiveIdx;
            (creationBindings ?? (creationBindings = [])).push(binding);
          }
          if (binding.update) {
            binding.targetIdx = targetDirectiveIdx;
            (updateBindings ?? (updateBindings = [])).push(binding);
          }
        }
      }
    }
  }
  const directivesToApply = [componentDef];
  if (directives) {
    for (const directive of directives) {
      const directiveType = typeof directive === 'function' ? directive : directive.type;
      const directiveDef = ngDevMode
        ? getDirectiveDefOrThrow(directiveType)
        : getDirectiveDef(directiveType);
      if (ngDevMode && !directiveDef.standalone) {
        throw new RuntimeError(
          907 /* RuntimeErrorCode.TYPE_IS_NOT_STANDALONE */,
          `The ${stringifyForError(directiveType)} directive must be standalone in ` +
            `order to be applied to a dynamically-created component.`,
        );
      }
      directivesToApply.push(directiveDef);
    }
  }
  const rootTView = createTView(
    0 /* TViewType.Root */,
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
function getRootTViewTemplate(creationBindings, updateBindings) {
  if (!creationBindings && !updateBindings) {
    return null;
  }
  return (flags) => {
    if (flags & 1 /* RenderFlags.Create */ && creationBindings) {
      for (const binding of creationBindings) {
        binding.create();
      }
    }
    if (flags & 2 /* RenderFlags.Update */ && updateBindings) {
      for (const binding of updateBindings) {
        binding.update();
      }
    }
  };
}
function isInputBinding(binding) {
  const kind = binding[BINDING].kind;
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
export class ComponentRef extends AbstractComponentRef {
  constructor(componentType, _rootLView, _hasInputBindings) {
    super();
    this._rootLView = _rootLView;
    this._hasInputBindings = _hasInputBindings;
    this.previousInputValues = null;
    this._tNode = getTNode(_rootLView[TVIEW], HEADER_OFFSET);
    this.location = createElementRef(this._tNode, _rootLView);
    this.instance = getComponentLViewByIndex(this._tNode.index, _rootLView)[CONTEXT];
    this.hostView = this.changeDetectorRef = new ViewRef(
      _rootLView,
      undefined /* _cdRefInjectingView */,
    );
    this.componentType = componentType;
  }
  setInput(name, value) {
    if (this._hasInputBindings && ngDevMode) {
      throw new RuntimeError(
        317 /* RuntimeErrorCode.INVALID_SET_INPUT_CALL */,
        'Cannot call `setInput` on a component that is using the `inputBinding` or `twoWayBinding` functions.',
      );
    }
    const tNode = this._tNode;
    this.previousInputValues ?? (this.previousInputValues = new Map());
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
    markViewDirty(childComponentLView, 1 /* NotificationSource.SetInput */);
    if (ngDevMode && !hasSetInput) {
      const cmpNameForError = stringifyForError(this.componentType);
      let message = `Can't set value of the '${name}' input on the '${cmpNameForError}' component. `;
      message += `Make sure that the '${name}' property is declared as an input using the input() or model() function or the @Input() decorator.`;
      reportUnknownPropertyError(message);
    }
  }
  get injector() {
    return new NodeInjector(this._tNode, this._rootLView);
  }
  destroy() {
    this.hostView.destroy();
  }
  onDestroy(callback) {
    this.hostView.onDestroy(callback);
  }
}
/** Projects the `projectableNodes` that were specified when creating a root component. */
function projectNodes(tNode, ngContentSelectors, projectableNodes) {
  const projection = (tNode.projection = []);
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
//# sourceMappingURL=component_ref.js.map
