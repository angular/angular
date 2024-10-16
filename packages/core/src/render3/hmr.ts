/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Type} from '../interface/type';
import {assertDefined} from '../util/assert';
import {assertLView} from './assert';
import {
  getComponentDef,
  ɵɵdefineComponent,
  ɵɵdefineDirective,
  ɵɵdefineNgModule,
  ɵɵdefinePipe,
} from './definition';
import {assertComponentDef} from './errors';
import {refreshView} from './instructions/change_detection';
import {renderView} from './instructions/render';
import {
  createLView,
  getInitialLViewFlagsFromDef,
  getOrCreateComponentTView,
} from './instructions/shared';
import {CONTAINER_HEADER_OFFSET} from './interfaces/container';
import {ComponentDef} from './interfaces/definition';
import {getTrackedLViews} from './interfaces/lview_tracking';
import {isTNodeShape, TElementNode, TNodeFlags, TNodeType} from './interfaces/node';
import {isLContainer, isLView} from './interfaces/type_checks';
import {
  CHILD_HEAD,
  CHILD_TAIL,
  CONTEXT,
  ENVIRONMENT,
  FLAGS,
  HEADER_OFFSET,
  HOST,
  LView,
  LViewFlags,
  NEXT,
  PARENT,
  T_HOST,
  TVIEW,
} from './interfaces/view';
import {assertTNodeType} from './node_assert';
import {destroyLView, removeViewFromDOM} from './node_manipulation';

import * as iframe_attrs_validation from '../sanitization/iframe_attrs_validation';
import * as sanitization from '../sanitization/sanitization';
import * as r3 from './instructions/all';
import {
  ɵɵdefineInjectable,
  ɵɵdefineInjector,
  ɵɵinject,
  ɵɵinvalidFactoryDep,
  forwardRef,
  resolveForwardRef,
} from '../di';
import {registerNgModuleType} from '../linker/ng_module_registration';
import {ɵɵgetInheritedFactory} from './di';
import {ɵɵgetComponentDepsFactory} from './local_compilation';
import {ɵɵpipeBind1, ɵɵpipeBind2, ɵɵpipeBind3, ɵɵpipeBind4, ɵɵpipeBindV, ɵɵpipe} from './pipe';
import {
  ɵɵpureFunction0,
  ɵɵpureFunction1,
  ɵɵpureFunction2,
  ɵɵpureFunction3,
  ɵɵpureFunction4,
  ɵɵpureFunction5,
  ɵɵpureFunction6,
  ɵɵpureFunction7,
  ɵɵpureFunction8,
  ɵɵpureFunctionV,
} from './pure_function';
import {ɵɵsetComponentScope, ɵɵsetNgModuleScope} from './scope';
import {ɵɵresetView, ɵɵenableBindings, ɵɵdisableBindings, ɵɵrestoreView} from './state';
import {ɵɵtemplateRefExtractor} from './view_engine_compatibility_prebound';
import {ɵɵHostDirectivesFeature} from './features/host_directives_feature';
import {ɵɵNgOnChangesFeature} from './features/ng_onchanges_feature';
import {ɵɵProvidersFeature} from './features/providers_feature';
import {ɵɵCopyDefinitionFeature} from './features/copy_definition_feature';
import {ɵɵInheritDefinitionFeature} from './features/inherit_definition_feature';
import {ɵɵInputTransformsFeature} from './features/input_transforms_feature';
import {ɵɵStandaloneFeature} from './features/standalone_feature';
import {ɵɵExternalStylesFeature} from './features/external_styles_feature';
import {ɵɵresolveBody, ɵɵresolveDocument, ɵɵresolveWindow} from './util/misc_utils';
import {ɵsetClassDebugInfo} from './debug/set_debug_info';

/** Cached environment for all HMR calls. */
let hmrEnvironment: Record<string, unknown> | null = null;

/**
 * Replaces the metadata of a component type and re-renders all live instances of the component.
 * @param type Class whose metadata will be replaced.
 * @param applyMetadata Callback that will apply a new set of metadata on the `type` when invoked.
 * @param locals Local symbols from the source location that have to be exposed to the callback.
 * @codeGenApi
 */
export function ɵɵreplaceMetadata(
  type: Type<unknown>,
  applyMetadata: (...args: [Type<unknown>, Record<string, unknown>, ...unknown[]]) => void,
  locals: unknown[],
) {
  ngDevMode && assertComponentDef(type);
  const oldDef = getComponentDef(type)!;

  if (hmrEnvironment === null) {
    hmrEnvironment = getHmrEnv();
  }

  // The reason `applyMetadata` is a callback that is invoked (almost) immediately is because
  // the compiler usually produces more code than just the component definition, e.g. there
  // can be functions for embedded views, the variables for the constant pool and `setClassMetadata`
  // calls. The callback allows us to keep them isolate from the rest of the app and to invoke
  // them at the right time.
  applyMetadata.apply(null, [type, hmrEnvironment, ...locals]);

  // If a `tView` hasn't been created yet, it means that this component hasn't been instantianted
  // before. In this case there's nothing left for us to do aside from patching it in.
  if (oldDef.tView) {
    const trackedViews = getTrackedLViews().values();
    for (const root of trackedViews) {
      // Note: we have the additional check, because `IsRoot` can also indicate
      // a component created through something like `createComponent`.
      if (root[FLAGS] & LViewFlags.IsRoot && root[PARENT] === null) {
        recreateMatchingLViews(oldDef, root);
      }
    }
  }
}

/**
 * Finds all LViews matching a specific component definition and recreates them.
 * @param def Component definition to search for.
 * @param rootLView View from which to start the search.
 */
function recreateMatchingLViews(def: ComponentDef<unknown>, rootLView: LView): void {
  ngDevMode &&
    assertDefined(
      def.tView,
      'Expected a component definition that has been instantiated at least once',
    );

  const tView = rootLView[TVIEW];

  // Use `tView` to match the LView since `instanceof` can
  // produce false positives when using inheritance.
  if (tView === def.tView) {
    ngDevMode && assertComponentDef(def.type);
    recreateLView(getComponentDef(def.type)!, rootLView);
    return;
  }

  for (let i = HEADER_OFFSET; i < tView.bindingStartIndex; i++) {
    const current = rootLView[i];

    if (isLContainer(current)) {
      for (let i = CONTAINER_HEADER_OFFSET; i < current.length; i++) {
        recreateMatchingLViews(def, current[i]);
      }
    } else if (isLView(current)) {
      recreateMatchingLViews(def, current);
    }
  }
}

/**
 * Recreates an LView in-place from a new component definition.
 * @param def Definition from which to recreate the view.
 * @param lView View to be recreated.
 */
function recreateLView(def: ComponentDef<unknown>, lView: LView<unknown>): void {
  const instance = lView[CONTEXT];
  const host = lView[HOST]!;
  // In theory the parent can also be an LContainer, but it appears like that's
  // only the case for embedded views which we won't be replacing here.
  const parentLView = lView[PARENT] as LView;
  ngDevMode && assertLView(parentLView);
  const tNode = lView[T_HOST] as TElementNode;
  ngDevMode && assertTNodeType(tNode, TNodeType.Element);

  // Recreate the TView since the template might've changed.
  const newTView = getOrCreateComponentTView(def);

  // Create a new LView from the new TView, but reusing the existing TNode and DOM node.
  const newLView = createLView(
    parentLView,
    newTView,
    instance,
    getInitialLViewFlagsFromDef(def),
    host,
    tNode,
    null,
    lView[ENVIRONMENT].rendererFactory.createRenderer(host, def),
    null,
    null,
    null,
  );

  // Detach the LView from its current place in the tree so we don't
  // start traversing any siblings and modifying their structure.
  replaceLViewInTree(parentLView, lView, newLView, tNode.index);

  // Destroy the detached LView.
  destroyLView(lView[TVIEW], lView);

  // Remove the nodes associated with the destroyed LView. This removes the
  // descendants, but not the host which we want to stay in place.
  removeViewFromDOM(lView[TVIEW], lView);

  // Reset the content projection state of the TNode before the first render.
  // Note that this has to happen after the LView has been destroyed or we
  // risk some projected nodes not being removed correctly.
  resetProjectionState(tNode);

  // Creation pass for the new view.
  renderView(newTView, newLView, instance);

  // Update pass for the new view.
  refreshView(newTView, newLView, newTView.template, instance);
}

/**
 * Replaces one LView in the tree with another one.
 * @param parentLView Parent of the LView being replaced.
 * @param oldLView LView being replaced.
 * @param newLView Replacement LView to be inserted.
 * @param index Index at which the LView should be inserted.
 */
function replaceLViewInTree(
  parentLView: LView,
  oldLView: LView,
  newLView: LView,
  index: number,
): void {
  // Update the sibling whose `NEXT` pointer refers to the old view.
  for (let i = HEADER_OFFSET; i < parentLView[TVIEW].bindingStartIndex; i++) {
    const current = parentLView[i];

    if ((isLView(current) || isLContainer(current)) && current[NEXT] === oldLView) {
      current[NEXT] = newLView;
      break;
    }
  }

  // Set the new view as the head, if the old view was first.
  if (parentLView[CHILD_HEAD] === oldLView) {
    parentLView[CHILD_HEAD] = newLView;
  }

  // Set the new view as the tail, if the old view was last.
  if (parentLView[CHILD_TAIL] === oldLView) {
    parentLView[CHILD_TAIL] = newLView;
  }

  // Update the `NEXT` pointer to the same as the old view.
  newLView[NEXT] = oldLView[NEXT];

  // Clear out the `NEXT` of the old view.
  oldLView[NEXT] = null;

  // Insert the new LView at the correct index.
  parentLView[index] = newLView;
}

/**
 * Child nodes mutate the `projection` state of their parent node as they're being projected.
 * This function resets the `project` back to its initial state.
 * @param tNode
 */
function resetProjectionState(tNode: TElementNode): void {
  // The `projection` is mutated by child nodes as they're being projected. We need to
  // reset it to the initial state so projection works after the template is swapped out.
  if (tNode.projection !== null) {
    for (const current of tNode.projection) {
      if (isTNodeShape(current)) {
        // Reset `projectionNext` since it can affect the traversal order during projection.
        current.projectionNext = null;
        current.flags &= ~TNodeFlags.isProjected;
      }
    }
    tNode.projection = null;
  }
}

/**
 * The HMR replacement function needs access to all of `core`. This is similar to the
 * `angularCoreEnv`, but without `replaceMetadata` to avoid circular dependencies. Furthermore,
 * we can't something like a `nonHmrEnv` that is then combined with `replaceMetadata` to form the
 * full environment, because it seems to break tree shaking internally.
 *
 * TODO(crisbeto): this is a temporary solution, we should be able to pass this in directly.
 */
function getHmrEnv(): Record<string, unknown> {
  return {
    'ɵɵattribute': r3.ɵɵattribute,
    'ɵɵattributeInterpolate1': r3.ɵɵattributeInterpolate1,
    'ɵɵattributeInterpolate2': r3.ɵɵattributeInterpolate2,
    'ɵɵattributeInterpolate3': r3.ɵɵattributeInterpolate3,
    'ɵɵattributeInterpolate4': r3.ɵɵattributeInterpolate4,
    'ɵɵattributeInterpolate5': r3.ɵɵattributeInterpolate5,
    'ɵɵattributeInterpolate6': r3.ɵɵattributeInterpolate6,
    'ɵɵattributeInterpolate7': r3.ɵɵattributeInterpolate7,
    'ɵɵattributeInterpolate8': r3.ɵɵattributeInterpolate8,
    'ɵɵattributeInterpolateV': r3.ɵɵattributeInterpolateV,
    'ɵɵdefineComponent': ɵɵdefineComponent,
    'ɵɵdefineDirective': ɵɵdefineDirective,
    'ɵɵdefineInjectable': ɵɵdefineInjectable,
    'ɵɵdefineInjector': ɵɵdefineInjector,
    'ɵɵdefineNgModule': ɵɵdefineNgModule,
    'ɵɵdefinePipe': ɵɵdefinePipe,
    'ɵɵdirectiveInject': r3.ɵɵdirectiveInject,
    'ɵɵgetInheritedFactory': ɵɵgetInheritedFactory,
    'ɵɵinject': ɵɵinject,
    'ɵɵinjectAttribute': r3.ɵɵinjectAttribute,
    'ɵɵinvalidFactory': r3.ɵɵinvalidFactory,
    'ɵɵinvalidFactoryDep': ɵɵinvalidFactoryDep,
    'ɵɵtemplateRefExtractor': ɵɵtemplateRefExtractor,
    'ɵɵresetView': ɵɵresetView,
    'ɵɵHostDirectivesFeature': ɵɵHostDirectivesFeature,
    'ɵɵNgOnChangesFeature': ɵɵNgOnChangesFeature,
    'ɵɵProvidersFeature': ɵɵProvidersFeature,
    'ɵɵCopyDefinitionFeature': ɵɵCopyDefinitionFeature,
    'ɵɵInheritDefinitionFeature': ɵɵInheritDefinitionFeature,
    'ɵɵInputTransformsFeature': ɵɵInputTransformsFeature,
    'ɵɵStandaloneFeature': ɵɵStandaloneFeature,
    'ɵɵExternalStylesFeature': ɵɵExternalStylesFeature,
    'ɵɵnextContext': r3.ɵɵnextContext,
    'ɵɵnamespaceHTML': r3.ɵɵnamespaceHTML,
    'ɵɵnamespaceMathML': r3.ɵɵnamespaceMathML,
    'ɵɵnamespaceSVG': r3.ɵɵnamespaceSVG,
    'ɵɵenableBindings': ɵɵenableBindings,
    'ɵɵdisableBindings': ɵɵdisableBindings,
    'ɵɵelementStart': r3.ɵɵelementStart,
    'ɵɵelementEnd': r3.ɵɵelementEnd,
    'ɵɵelement': r3.ɵɵelement,
    'ɵɵelementContainerStart': r3.ɵɵelementContainerStart,
    'ɵɵelementContainerEnd': r3.ɵɵelementContainerEnd,
    'ɵɵelementContainer': r3.ɵɵelementContainer,
    'ɵɵpureFunction0': ɵɵpureFunction0,
    'ɵɵpureFunction1': ɵɵpureFunction1,
    'ɵɵpureFunction2': ɵɵpureFunction2,
    'ɵɵpureFunction3': ɵɵpureFunction3,
    'ɵɵpureFunction4': ɵɵpureFunction4,
    'ɵɵpureFunction5': ɵɵpureFunction5,
    'ɵɵpureFunction6': ɵɵpureFunction6,
    'ɵɵpureFunction7': ɵɵpureFunction7,
    'ɵɵpureFunction8': ɵɵpureFunction8,
    'ɵɵpureFunctionV': ɵɵpureFunctionV,
    'ɵɵgetCurrentView': r3.ɵɵgetCurrentView,
    'ɵɵrestoreView': ɵɵrestoreView,
    'ɵɵlistener': r3.ɵɵlistener,
    'ɵɵprojection': r3.ɵɵprojection,
    'ɵɵsyntheticHostProperty': r3.ɵɵsyntheticHostProperty,
    'ɵɵsyntheticHostListener': r3.ɵɵsyntheticHostListener,
    'ɵɵpipeBind1': ɵɵpipeBind1,
    'ɵɵpipeBind2': ɵɵpipeBind2,
    'ɵɵpipeBind3': ɵɵpipeBind3,
    'ɵɵpipeBind4': ɵɵpipeBind4,
    'ɵɵpipeBindV': ɵɵpipeBindV,
    'ɵɵprojectionDef': r3.ɵɵprojectionDef,
    'ɵɵhostProperty': r3.ɵɵhostProperty,
    'ɵɵproperty': r3.ɵɵproperty,
    'ɵɵpropertyInterpolate': r3.ɵɵpropertyInterpolate,
    'ɵɵpropertyInterpolate1': r3.ɵɵpropertyInterpolate1,
    'ɵɵpropertyInterpolate2': r3.ɵɵpropertyInterpolate2,
    'ɵɵpropertyInterpolate3': r3.ɵɵpropertyInterpolate3,
    'ɵɵpropertyInterpolate4': r3.ɵɵpropertyInterpolate4,
    'ɵɵpropertyInterpolate5': r3.ɵɵpropertyInterpolate5,
    'ɵɵpropertyInterpolate6': r3.ɵɵpropertyInterpolate6,
    'ɵɵpropertyInterpolate7': r3.ɵɵpropertyInterpolate7,
    'ɵɵpropertyInterpolate8': r3.ɵɵpropertyInterpolate8,
    'ɵɵpropertyInterpolateV': r3.ɵɵpropertyInterpolateV,
    'ɵɵpipe': ɵɵpipe,
    'ɵɵqueryRefresh': r3.ɵɵqueryRefresh,
    'ɵɵqueryAdvance': r3.ɵɵqueryAdvance,
    'ɵɵviewQuery': r3.ɵɵviewQuery,
    'ɵɵviewQuerySignal': r3.ɵɵviewQuerySignal,
    'ɵɵloadQuery': r3.ɵɵloadQuery,
    'ɵɵcontentQuery': r3.ɵɵcontentQuery,
    'ɵɵcontentQuerySignal': r3.ɵɵcontentQuerySignal,
    'ɵɵreference': r3.ɵɵreference,
    'ɵɵclassMap': r3.ɵɵclassMap,
    'ɵɵclassMapInterpolate1': r3.ɵɵclassMapInterpolate1,
    'ɵɵclassMapInterpolate2': r3.ɵɵclassMapInterpolate2,
    'ɵɵclassMapInterpolate3': r3.ɵɵclassMapInterpolate3,
    'ɵɵclassMapInterpolate4': r3.ɵɵclassMapInterpolate4,
    'ɵɵclassMapInterpolate5': r3.ɵɵclassMapInterpolate5,
    'ɵɵclassMapInterpolate6': r3.ɵɵclassMapInterpolate6,
    'ɵɵclassMapInterpolate7': r3.ɵɵclassMapInterpolate7,
    'ɵɵclassMapInterpolate8': r3.ɵɵclassMapInterpolate8,
    'ɵɵclassMapInterpolateV': r3.ɵɵclassMapInterpolateV,
    'ɵɵstyleMap': r3.ɵɵstyleMap,
    'ɵɵstyleMapInterpolate1': r3.ɵɵstyleMapInterpolate1,
    'ɵɵstyleMapInterpolate2': r3.ɵɵstyleMapInterpolate2,
    'ɵɵstyleMapInterpolate3': r3.ɵɵstyleMapInterpolate3,
    'ɵɵstyleMapInterpolate4': r3.ɵɵstyleMapInterpolate4,
    'ɵɵstyleMapInterpolate5': r3.ɵɵstyleMapInterpolate5,
    'ɵɵstyleMapInterpolate6': r3.ɵɵstyleMapInterpolate6,
    'ɵɵstyleMapInterpolate7': r3.ɵɵstyleMapInterpolate7,
    'ɵɵstyleMapInterpolate8': r3.ɵɵstyleMapInterpolate8,
    'ɵɵstyleMapInterpolateV': r3.ɵɵstyleMapInterpolateV,
    'ɵɵstyleProp': r3.ɵɵstyleProp,
    'ɵɵstylePropInterpolate1': r3.ɵɵstylePropInterpolate1,
    'ɵɵstylePropInterpolate2': r3.ɵɵstylePropInterpolate2,
    'ɵɵstylePropInterpolate3': r3.ɵɵstylePropInterpolate3,
    'ɵɵstylePropInterpolate4': r3.ɵɵstylePropInterpolate4,
    'ɵɵstylePropInterpolate5': r3.ɵɵstylePropInterpolate5,
    'ɵɵstylePropInterpolate6': r3.ɵɵstylePropInterpolate6,
    'ɵɵstylePropInterpolate7': r3.ɵɵstylePropInterpolate7,
    'ɵɵstylePropInterpolate8': r3.ɵɵstylePropInterpolate8,
    'ɵɵstylePropInterpolateV': r3.ɵɵstylePropInterpolateV,
    'ɵɵclassProp': r3.ɵɵclassProp,
    'ɵɵadvance': r3.ɵɵadvance,
    'ɵɵtemplate': r3.ɵɵtemplate,
    'ɵɵconditional': r3.ɵɵconditional,
    'ɵɵdefer': r3.ɵɵdefer,
    'ɵɵdeferWhen': r3.ɵɵdeferWhen,
    'ɵɵdeferOnIdle': r3.ɵɵdeferOnIdle,
    'ɵɵdeferOnImmediate': r3.ɵɵdeferOnImmediate,
    'ɵɵdeferOnTimer': r3.ɵɵdeferOnTimer,
    'ɵɵdeferOnHover': r3.ɵɵdeferOnHover,
    'ɵɵdeferOnInteraction': r3.ɵɵdeferOnInteraction,
    'ɵɵdeferOnViewport': r3.ɵɵdeferOnViewport,
    'ɵɵdeferPrefetchWhen': r3.ɵɵdeferPrefetchWhen,
    'ɵɵdeferPrefetchOnIdle': r3.ɵɵdeferPrefetchOnIdle,
    'ɵɵdeferPrefetchOnImmediate': r3.ɵɵdeferPrefetchOnImmediate,
    'ɵɵdeferPrefetchOnTimer': r3.ɵɵdeferPrefetchOnTimer,
    'ɵɵdeferPrefetchOnHover': r3.ɵɵdeferPrefetchOnHover,
    'ɵɵdeferPrefetchOnInteraction': r3.ɵɵdeferPrefetchOnInteraction,
    'ɵɵdeferPrefetchOnViewport': r3.ɵɵdeferPrefetchOnViewport,
    'ɵɵdeferHydrateWhen': r3.ɵɵdeferHydrateWhen,
    'ɵɵdeferHydrateNever': r3.ɵɵdeferHydrateNever,
    'ɵɵdeferHydrateOnIdle': r3.ɵɵdeferHydrateOnIdle,
    'ɵɵdeferHydrateOnImmediate': r3.ɵɵdeferHydrateOnImmediate,
    'ɵɵdeferHydrateOnTimer': r3.ɵɵdeferHydrateOnTimer,
    'ɵɵdeferHydrateOnHover': r3.ɵɵdeferHydrateOnHover,
    'ɵɵdeferHydrateOnInteraction': r3.ɵɵdeferHydrateOnInteraction,
    'ɵɵdeferHydrateOnViewport': r3.ɵɵdeferHydrateOnViewport,
    'ɵɵdeferEnableTimerScheduling': r3.ɵɵdeferEnableTimerScheduling,
    'ɵɵrepeater': r3.ɵɵrepeater,
    'ɵɵrepeaterCreate': r3.ɵɵrepeaterCreate,
    'ɵɵrepeaterTrackByIndex': r3.ɵɵrepeaterTrackByIndex,
    'ɵɵrepeaterTrackByIdentity': r3.ɵɵrepeaterTrackByIdentity,
    'ɵɵcomponentInstance': r3.ɵɵcomponentInstance,
    'ɵɵtext': r3.ɵɵtext,
    'ɵɵtextInterpolate': r3.ɵɵtextInterpolate,
    'ɵɵtextInterpolate1': r3.ɵɵtextInterpolate1,
    'ɵɵtextInterpolate2': r3.ɵɵtextInterpolate2,
    'ɵɵtextInterpolate3': r3.ɵɵtextInterpolate3,
    'ɵɵtextInterpolate4': r3.ɵɵtextInterpolate4,
    'ɵɵtextInterpolate5': r3.ɵɵtextInterpolate5,
    'ɵɵtextInterpolate6': r3.ɵɵtextInterpolate6,
    'ɵɵtextInterpolate7': r3.ɵɵtextInterpolate7,
    'ɵɵtextInterpolate8': r3.ɵɵtextInterpolate8,
    'ɵɵtextInterpolateV': r3.ɵɵtextInterpolateV,
    'ɵɵi18n': r3.ɵɵi18n,
    'ɵɵi18nAttributes': r3.ɵɵi18nAttributes,
    'ɵɵi18nExp': r3.ɵɵi18nExp,
    'ɵɵi18nStart': r3.ɵɵi18nStart,
    'ɵɵi18nEnd': r3.ɵɵi18nEnd,
    'ɵɵi18nApply': r3.ɵɵi18nApply,
    'ɵɵi18nPostprocess': r3.ɵɵi18nPostprocess,
    'ɵɵresolveWindow': ɵɵresolveWindow,
    'ɵɵresolveDocument': ɵɵresolveDocument,
    'ɵɵresolveBody': ɵɵresolveBody,
    'ɵɵsetComponentScope': ɵɵsetComponentScope,
    'ɵɵsetNgModuleScope': ɵɵsetNgModuleScope,
    'ɵɵregisterNgModuleType': registerNgModuleType,
    'ɵɵgetComponentDepsFactory': ɵɵgetComponentDepsFactory,
    'ɵsetClassDebugInfo': ɵsetClassDebugInfo,
    'ɵɵdeclareLet': r3.ɵɵdeclareLet,
    'ɵɵstoreLet': r3.ɵɵstoreLet,
    'ɵɵreadContextLet': r3.ɵɵreadContextLet,

    'ɵɵsanitizeHtml': sanitization.ɵɵsanitizeHtml,
    'ɵɵsanitizeStyle': sanitization.ɵɵsanitizeStyle,
    'ɵɵsanitizeResourceUrl': sanitization.ɵɵsanitizeResourceUrl,
    'ɵɵsanitizeScript': sanitization.ɵɵsanitizeScript,
    'ɵɵsanitizeUrl': sanitization.ɵɵsanitizeUrl,
    'ɵɵsanitizeUrlOrResourceUrl': sanitization.ɵɵsanitizeUrlOrResourceUrl,
    'ɵɵtrustConstantHtml': sanitization.ɵɵtrustConstantHtml,
    'ɵɵtrustConstantResourceUrl': sanitization.ɵɵtrustConstantResourceUrl,
    'ɵɵvalidateIframeAttribute': iframe_attrs_validation.ɵɵvalidateIframeAttribute,

    'forwardRef': forwardRef,
    'resolveForwardRef': resolveForwardRef,

    'ɵɵtwoWayProperty': r3.ɵɵtwoWayProperty,
    'ɵɵtwoWayBindingSet': r3.ɵɵtwoWayBindingSet,
    'ɵɵtwoWayListener': r3.ɵɵtwoWayListener,
  };
}
