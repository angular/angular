/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {RuntimeError, RuntimeErrorCode} from '../../errors';
import {Writable} from '../../interface/type';
import {DoCheck, OnChanges, OnInit} from '../../interface/lifecycle_hooks';
import {
  assertGreaterThan,
  assertGreaterThanOrEqual,
  assertNotEqual,
  assertSame,
} from '../../util/assert';
import {assertFirstCreatePass} from '../assert';
import {getFactoryDef} from '../definition_factory';
import {diPublicInInjector, getOrCreateNodeInjectorForNode} from '../di';
import {ɵɵdirectiveInject} from '../instructions/di';
import {AttributeMarker} from '../interfaces/attribute_marker';
import type {
  ComponentDef,
  DirectiveDef,
  HostDirectiveBindingMap,
  HostDirectiveDefs,
} from '../interfaces/definition';
import {NodeInjectorFactory} from '../interfaces/injector';
import {InputFlags} from '../interfaces/input_flags';
import {
  InitialInputData,
  InitialInputs,
  NodeInputBindings,
  NodeOutputBindings,
  TAttributes,
  TNodeFlags,
  type TContainerNode,
  type TElementContainerNode,
  type TElementNode,
  type TNode,
} from '../interfaces/node';
import {isComponentDef, isComponentHost} from '../interfaces/type_checks';
import {HEADER_OFFSET, HostBindingOpCodes, type LView, type TView} from '../interfaces/view';
import {isInlineTemplate} from '../node_selector_matcher';
import {NO_CHANGE} from '../tokens';
import {mergeHostAttrs} from '../util/attrs_utils';
import {allocExpando} from './construction';

export type DirectiveMatcherStrategy = (
  tView: TView,
  tNode: TElementNode | TContainerNode | TElementContainerNode,
) => DirectiveDef<unknown>[] | null;

/**
 * Resolve the matched directives on a node.
 */
export function resolveDirectives(
  tView: TView,
  lView: LView,
  tNode: TElementNode | TContainerNode | TElementContainerNode,
  localRefs: string[] | null,
  directiveMatcher: DirectiveMatcherStrategy,
): void {
  // Please make sure to have explicit type for `exportsMap`. Inferred type triggers bug in
  // tsickle.
  ngDevMode && assertFirstCreatePass(tView);

  const exportsMap: Record<string, number> | null = localRefs === null ? null : {'': -1};
  const matchedDirectiveDefs = directiveMatcher(tView, tNode);

  if (matchedDirectiveDefs !== null) {
    const [directiveDefs, hostDirectiveDefs] = resolveHostDirectives(
      tView,
      tNode,
      matchedDirectiveDefs,
    );
    initializeDirectives(tView, lView, tNode, directiveDefs, exportsMap, hostDirectiveDefs);
  }
  if (exportsMap !== null && localRefs !== null) {
    cacheMatchingLocalNames(tNode, localRefs, exportsMap);
  }
}

/** Caches local names and their matching directive indices for query and template lookups. */
function cacheMatchingLocalNames(
  tNode: TNode,
  localRefs: string[],
  exportsMap: {[key: string]: number},
): void {
  const localNames: (string | number)[] = (tNode.localNames = []);

  // Local names must be stored in tNode in the same order that localRefs are defined
  // in the template to ensure the data is loaded in the same slots as their refs
  // in the template (for template queries).
  for (let i = 0; i < localRefs.length; i += 2) {
    const index = exportsMap[localRefs[i + 1]];
    if (index == null)
      throw new RuntimeError(
        RuntimeErrorCode.EXPORT_NOT_FOUND,
        ngDevMode && `Export of name '${localRefs[i + 1]}' not found!`,
      );
    localNames.push(localRefs[i], index);
  }
}

export function resolveHostDirectives(
  tView: TView,
  tNode: TNode,
  matches: DirectiveDef<unknown>[],
): [matches: DirectiveDef<unknown>[], hostDirectiveDefs: HostDirectiveDefs | null] {
  const allDirectiveDefs: DirectiveDef<unknown>[] = [];
  let hostDirectiveDefs: HostDirectiveDefs | null = null;

  for (const def of matches) {
    if (def.findHostDirectiveDefs !== null) {
      // TODO(pk): probably could return matches instead of taking in an array to fill in?
      hostDirectiveDefs ??= new Map();
      // Components are inserted at the front of the matches array so that their lifecycle
      // hooks run before any directive lifecycle hooks. This appears to be for ViewEngine
      // compatibility. This logic doesn't make sense with host directives, because it
      // would allow the host directives to undo any overrides the host may have made.
      // To handle this case, the host directives of components are inserted at the beginning
      // of the array, followed by the component. As such, the insertion order is as follows:
      // 1. Host directives belonging to the selector-matched component.
      // 2. Selector-matched component.
      // 3. Host directives belonging to selector-matched directives.
      // 4. Selector-matched directives.
      def.findHostDirectiveDefs(def, allDirectiveDefs, hostDirectiveDefs);
    }

    if (isComponentDef(def)) {
      allDirectiveDefs.push(def);
      markAsComponentHost(tView, tNode, allDirectiveDefs.length - 1);
    }
  }

  if (isComponentHost(tNode)) {
    allDirectiveDefs.push(...matches.slice(1));
  } else {
    allDirectiveDefs.push(...matches);
  }

  if (ngDevMode) {
    assertNoDuplicateDirectives(allDirectiveDefs);
  }

  return [allDirectiveDefs, hostDirectiveDefs];
}

/**
 * Marks a given TNode as a component's host. This consists of:
 * - setting the component offset on the TNode.
 * - storing index of component's host element so it will be queued for view refresh during CD.
 */
function markAsComponentHost(tView: TView, hostTNode: TNode, componentOffset: number): void {
  ngDevMode && assertFirstCreatePass(tView);
  ngDevMode && assertGreaterThan(componentOffset, -1, 'componentOffset must be great than -1');
  hostTNode.componentOffset = componentOffset;
  (tView.components ??= []).push(hostTNode.index);
}

/** Initializes the data structures necessary for a list of directives to be instantiated. */
export function initializeDirectives(
  tView: TView,
  lView: LView<unknown>,
  tNode: TElementNode | TContainerNode | TElementContainerNode,
  directives: DirectiveDef<unknown>[],
  exportsMap: {[key: string]: number} | null,
  hostDirectiveDefs: HostDirectiveDefs | null,
) {
  ngDevMode && assertFirstCreatePass(tView);

  // Publishes the directive types to DI so they can be injected. Needs to
  // happen in a separate pass before the TNode flags have been initialized.
  for (let i = 0; i < directives.length; i++) {
    diPublicInInjector(getOrCreateNodeInjectorForNode(tNode, lView), tView, directives[i].type);
  }

  initTNodeFlags(tNode, tView.data.length, directives.length);

  // When the same token is provided by several directives on the same node, some rules apply in
  // the viewEngine:
  // - viewProviders have priority over providers
  // - the last directive in NgModule.declarations has priority over the previous one
  // So to match these rules, the order in which providers are added in the arrays is very
  // important.
  for (let i = 0; i < directives.length; i++) {
    const def = directives[i];
    if (def.providersResolver) def.providersResolver(def);
  }
  let preOrderHooksFound = false;
  let preOrderCheckHooksFound = false;
  let directiveIdx = allocExpando(tView, lView, directives.length, null);
  ngDevMode &&
    assertSame(
      directiveIdx,
      tNode.directiveStart,
      'TNode.directiveStart should point to just allocated space',
    );

  for (let i = 0; i < directives.length; i++) {
    const def = directives[i];
    // Merge the attrs in the order of matches. This assumes that the first directive is the
    // component itself, so that the component has the least priority.
    tNode.mergedAttrs = mergeHostAttrs(tNode.mergedAttrs, def.hostAttrs);

    configureViewWithDirective(tView, tNode, lView, directiveIdx, def);
    saveNameToExportMap(directiveIdx, def, exportsMap);

    if (def.contentQueries !== null) tNode.flags |= TNodeFlags.hasContentQuery;
    if (def.hostBindings !== null || def.hostAttrs !== null || def.hostVars !== 0)
      tNode.flags |= TNodeFlags.hasHostBindings;

    const lifeCycleHooks: Partial<OnChanges & OnInit & DoCheck> = def.type.prototype;
    // Only push a node index into the preOrderHooks array if this is the first
    // pre-order hook found on this node.
    if (
      !preOrderHooksFound &&
      (lifeCycleHooks.ngOnChanges || lifeCycleHooks.ngOnInit || lifeCycleHooks.ngDoCheck)
    ) {
      // We will push the actual hook function into this array later during dir instantiation.
      // We cannot do it now because we must ensure hooks are registered in the same
      // order that directives are created (i.e. injection order).
      (tView.preOrderHooks ??= []).push(tNode.index);
      preOrderHooksFound = true;
    }

    if (!preOrderCheckHooksFound && (lifeCycleHooks.ngOnChanges || lifeCycleHooks.ngDoCheck)) {
      (tView.preOrderCheckHooks ??= []).push(tNode.index);
      preOrderCheckHooksFound = true;
    }

    directiveIdx++;
  }

  initializeInputAndOutputAliases(tView, tNode, hostDirectiveDefs);
}

/**
 * Initializes data structures required to work with directive inputs and outputs.
 * Initialization is done for all directives matched on a given TNode.
 */
function initializeInputAndOutputAliases(
  tView: TView,
  tNode: TNode,
  hostDirectiveDefinitionMap: HostDirectiveDefs | null,
): void {
  ngDevMode && assertFirstCreatePass(tView);

  const start = tNode.directiveStart;
  const end = tNode.directiveEnd;
  const tViewData = tView.data;

  const tNodeAttrs = tNode.attrs;
  const inputsFromAttrs: InitialInputData = [];
  let inputsStore: NodeInputBindings | null = null;
  let outputsStore: NodeOutputBindings | null = null;

  for (let directiveIndex = start; directiveIndex < end; directiveIndex++) {
    const directiveDef = tViewData[directiveIndex] as DirectiveDef<any>;
    const aliasData = hostDirectiveDefinitionMap
      ? hostDirectiveDefinitionMap.get(directiveDef)
      : null;
    const aliasedInputs = aliasData ? aliasData.inputs : null;
    const aliasedOutputs = aliasData ? aliasData.outputs : null;

    inputsStore = captureNodeBindings(
      CaptureNodeBindingMode.Inputs,
      directiveDef.inputs,
      directiveIndex,
      inputsStore,
      aliasedInputs,
    );
    outputsStore = captureNodeBindings(
      CaptureNodeBindingMode.Outputs,
      directiveDef.outputs,
      directiveIndex,
      outputsStore,
      aliasedOutputs,
    );
    // Do not use unbound attributes as inputs to structural directives, since structural
    // directive inputs can only be set using microsyntax (e.g. `<div *dir="exp">`).
    const initialInputs =
      inputsStore !== null && tNodeAttrs !== null && !isInlineTemplate(tNode)
        ? generateInitialInputs(inputsStore, directiveIndex, tNodeAttrs)
        : null;
    inputsFromAttrs.push(initialInputs);
  }

  if (inputsStore !== null) {
    if (inputsStore.hasOwnProperty('class')) {
      tNode.flags |= TNodeFlags.hasClassInput;
    }
    if (inputsStore.hasOwnProperty('style')) {
      tNode.flags |= TNodeFlags.hasStyleInput;
    }
  }

  tNode.initialInputs = inputsFromAttrs;
  tNode.inputs = inputsStore;
  tNode.outputs = outputsStore;
}

/** Mode for capturing node bindings. */
const enum CaptureNodeBindingMode {
  Inputs,
  Outputs,
}

/**
 * Captures node input bindings for the given directive based on the inputs metadata.
 * This will be called multiple times to combine inputs from various directives on a node.
 *
 * The host binding alias map is used to alias and filter out properties for host directives.
 * If the mapping is provided, it'll act as an allowlist, as well as a mapping of what public
 * name inputs/outputs should be exposed under.
 */
function captureNodeBindings<T>(
  mode: CaptureNodeBindingMode.Inputs,
  inputs: DirectiveDef<T>['inputs'],
  directiveIndex: number,
  bindingsResult: NodeInputBindings | null,
  hostDirectiveAliasMap: HostDirectiveBindingMap | null,
): NodeInputBindings | null;
/**
 * Captures node output bindings for the given directive based on the output metadata.
 * This will be called multiple times to combine inputs from various directives on a node.
 *
 * The host binding alias map is used to alias and filter out properties for host directives.
 * If the mapping is provided, it'll act as an allowlist, as well as a mapping of what public
 * name inputs/outputs should be exposed under.
 */
function captureNodeBindings<T>(
  mode: CaptureNodeBindingMode.Outputs,
  outputs: DirectiveDef<T>['outputs'],
  directiveIndex: number,
  bindingsResult: NodeOutputBindings | null,
  hostDirectiveAliasMap: HostDirectiveBindingMap | null,
): NodeOutputBindings | null;

function captureNodeBindings<T>(
  mode: CaptureNodeBindingMode,
  aliasMap: DirectiveDef<T>['inputs'] | DirectiveDef<T>['outputs'],
  directiveIndex: number,
  bindingsResult: NodeInputBindings | NodeOutputBindings | null,
  hostDirectiveAliasMap: HostDirectiveBindingMap | null,
): NodeInputBindings | NodeOutputBindings | null {
  for (let publicName in aliasMap) {
    if (!aliasMap.hasOwnProperty(publicName)) {
      continue;
    }

    const value = aliasMap[publicName];
    if (value === undefined) {
      continue;
    }

    bindingsResult ??= {};

    let internalName: string;
    let inputFlags = InputFlags.None;

    // For inputs, the value might be an array capturing additional
    // input flags.
    if (Array.isArray(value)) {
      internalName = value[0];
      inputFlags = value[1];
    } else {
      internalName = value;
    }

    // If there are no host directive mappings, we want to remap using the alias map from the
    // definition itself. If there is an alias map, it has two functions:
    // 1. It serves as an allowlist of bindings that are exposed by the host directives. Only the
    // ones inside the host directive map will be exposed on the host.
    // 2. The public name of the property is aliased using the host directive alias map, rather
    // than the alias map from the definition.
    let finalPublicName: string = publicName;
    if (hostDirectiveAliasMap !== null) {
      // If there is no mapping, it's not part of the allowlist and this input/output
      // is not captured and should be ignored.
      if (!hostDirectiveAliasMap.hasOwnProperty(publicName)) {
        continue;
      }
      finalPublicName = hostDirectiveAliasMap[publicName];
    }

    if (mode === CaptureNodeBindingMode.Inputs) {
      addPropertyBinding(
        bindingsResult as NodeInputBindings,
        directiveIndex,
        finalPublicName,
        internalName,
        inputFlags,
      );
    } else {
      addPropertyBinding(
        bindingsResult as NodeOutputBindings,
        directiveIndex,
        finalPublicName,
        internalName,
      );
    }
  }
  return bindingsResult;
}

function addPropertyBinding(
  bindings: NodeInputBindings,
  directiveIndex: number,
  publicName: string,
  internalName: string,
  inputFlags: InputFlags,
): void;
function addPropertyBinding(
  bindings: NodeOutputBindings,
  directiveIndex: number,
  publicName: string,
  internalName: string,
): void;

function addPropertyBinding(
  bindings: NodeInputBindings | NodeOutputBindings,
  directiveIndex: number,
  publicName: string,
  internalName: string,
  inputFlags?: InputFlags,
) {
  let values: (typeof bindings)[typeof publicName];

  if (bindings.hasOwnProperty(publicName)) {
    (values = bindings[publicName]).push(directiveIndex, internalName);
  } else {
    values = bindings[publicName] = [directiveIndex, internalName];
  }

  if (inputFlags !== undefined) {
    (values as NodeInputBindings[typeof publicName]).push(inputFlags);
  }
}

/**
 * Generates initialInputData for a node and stores it in the template's static storage
 * so subsequent template invocations don't have to recalculate it.
 *
 * initialInputData is an array containing values that need to be set as input properties
 * for directives on this node, but only once on creation. We need this array to support
 * the case where you set an @Input property of a directive using attribute-like syntax.
 * e.g. if you have a `name` @Input, you can set it once like this:
 *
 * <my-component name="Bess"></my-component>
 *
 * @param inputs Input alias map that was generated from the directive def inputs.
 * @param directiveIndex Index of the directive that is currently being processed.
 * @param attrs Static attrs on this node.
 */
function generateInitialInputs(
  inputs: NodeInputBindings,
  directiveIndex: number,
  attrs: TAttributes,
): InitialInputs | null {
  let inputsToStore: InitialInputs | null = null;
  let i = 0;
  while (i < attrs.length) {
    const attrName = attrs[i];
    if (attrName === AttributeMarker.NamespaceURI) {
      // We do not allow inputs on namespaced attributes.
      i += 4;
      continue;
    } else if (attrName === AttributeMarker.ProjectAs) {
      // Skip over the `ngProjectAs` value.
      i += 2;
      continue;
    }

    // If we hit any other attribute markers, we're done anyway. None of those are valid inputs.
    if (typeof attrName === 'number') break;

    if (inputs.hasOwnProperty(attrName as string)) {
      if (inputsToStore === null) inputsToStore = [];

      // Find the input's public name from the input store. Note that we can be found easier
      // through the directive def, but we want to do it using the inputs store so that it can
      // account for host directive aliases.
      const inputConfig = inputs[attrName as string];
      for (let j = 0; j < inputConfig.length; j += 3) {
        if (inputConfig[j] === directiveIndex) {
          inputsToStore.push(
            attrName as string,
            inputConfig[j + 1] as string,
            inputConfig[j + 2] as InputFlags,
            attrs[i + 1] as string,
          );
          // A directive can't have multiple inputs with the same name so we can break here.
          break;
        }
      }
    }

    i += 2;
  }
  return inputsToStore;
}

/**
 * Setup directive for instantiation.
 *
 * We need to create a `NodeInjectorFactory` which is then inserted in both the `Blueprint` as well
 * as `LView`. `TView` gets the `DirectiveDef`.
 *
 * @param tView `TView`
 * @param tNode `TNode`
 * @param lView `LView`
 * @param directiveIndex Index where the directive will be stored in the Expando.
 * @param def `DirectiveDef`
 */
function configureViewWithDirective<T>(
  tView: TView,
  tNode: TNode,
  lView: LView,
  directiveIndex: number,
  def: DirectiveDef<T>,
): void {
  ngDevMode &&
    assertGreaterThanOrEqual(directiveIndex, HEADER_OFFSET, 'Must be in Expando section');
  tView.data[directiveIndex] = def;
  const directiveFactory =
    def.factory || ((def as Writable<DirectiveDef<T>>).factory = getFactoryDef(def.type, true));
  // Even though `directiveFactory` will already be using `ɵɵdirectiveInject` in its generated code,
  // we also want to support `inject()` directly from the directive constructor context so we set
  // `ɵɵdirectiveInject` as the inject implementation here too.
  const nodeInjectorFactory = new NodeInjectorFactory(
    directiveFactory,
    isComponentDef(def),
    ɵɵdirectiveInject,
  );
  tView.blueprint[directiveIndex] = nodeInjectorFactory;
  lView[directiveIndex] = nodeInjectorFactory;

  registerHostBindingOpCodes(
    tView,
    tNode,
    directiveIndex,
    allocExpando(tView, lView, def.hostVars, NO_CHANGE),
    def,
  );
}

/**
 * Add `hostBindings` to the `TView.hostBindingOpCodes`.
 *
 * @param tView `TView` to which the `hostBindings` should be added.
 * @param tNode `TNode` the element which contains the directive
 * @param directiveIdx Directive index in view.
 * @param directiveVarsIdx Where will the directive's vars be stored
 * @param def `ComponentDef`/`DirectiveDef`, which contains the `hostVars`/`hostBindings` to add.
 */
export function registerHostBindingOpCodes(
  tView: TView,
  tNode: TNode,
  directiveIdx: number,
  directiveVarsIdx: number,
  def: ComponentDef<any> | DirectiveDef<any>,
): void {
  ngDevMode && assertFirstCreatePass(tView);

  const hostBindings = def.hostBindings;
  if (hostBindings) {
    let hostBindingOpCodes = tView.hostBindingOpCodes;
    if (hostBindingOpCodes === null) {
      hostBindingOpCodes = tView.hostBindingOpCodes = [] as any as HostBindingOpCodes;
    }
    const elementIndx = ~tNode.index;
    if (lastSelectedElementIdx(hostBindingOpCodes) != elementIndx) {
      // Conditionally add select element so that we are more efficient in execution.
      // NOTE: this is strictly not necessary and it trades code size for runtime perf.
      // (We could just always add it.)
      hostBindingOpCodes.push(elementIndx);
    }
    hostBindingOpCodes.push(directiveIdx, directiveVarsIdx, hostBindings);
  }
}

/**
 * Returns the last selected element index in the `HostBindingOpCodes`
 *
 * For perf reasons we don't need to update the selected element index in `HostBindingOpCodes` only
 * if it changes. This method returns the last index (or '0' if not found.)
 *
 * Selected element index are only the ones which are negative.
 */
function lastSelectedElementIdx(hostBindingOpCodes: HostBindingOpCodes): number {
  let i = hostBindingOpCodes.length;
  while (i > 0) {
    const value = hostBindingOpCodes[--i];
    if (typeof value === 'number' && value < 0) {
      return value;
    }
  }
  return 0;
}

/**
 * Builds up an export map as directives are created, so local refs can be quickly mapped
 * to their directive instances.
 */
function saveNameToExportMap(
  directiveIdx: number,
  def: DirectiveDef<any> | ComponentDef<any>,
  exportsMap: {[key: string]: number} | null,
) {
  if (exportsMap) {
    if (def.exportAs) {
      for (let i = 0; i < def.exportAs.length; i++) {
        exportsMap[def.exportAs[i]] = directiveIdx;
      }
    }
    if (isComponentDef(def)) exportsMap[''] = directiveIdx;
  }
}

/**
 * Initializes the flags on the current node, setting all indices to the initial index,
 * the directive count to 0, and adding the isComponent flag.
 * @param index the initial index
 */
function initTNodeFlags(tNode: TNode, index: number, numberOfDirectives: number) {
  ngDevMode &&
    assertNotEqual(
      numberOfDirectives,
      tNode.directiveEnd - tNode.directiveStart,
      'Reached the max number of directives',
    );
  tNode.flags |= TNodeFlags.isDirectiveHost;
  // When the first directive is created on a node, save the index
  tNode.directiveStart = index;
  tNode.directiveEnd = index + numberOfDirectives;
  tNode.providerIndexes = index;
}

export function assertNoDuplicateDirectives(directives: DirectiveDef<unknown>[]): void {
  // The array needs at least two elements in order to have duplicates.
  if (directives.length < 2) {
    return;
  }

  const seenDirectives = new Set<DirectiveDef<unknown>>();

  for (const current of directives) {
    if (seenDirectives.has(current)) {
      throw new RuntimeError(
        RuntimeErrorCode.DUPLICATE_DIRECTIVE,
        `Directive ${current.type.name} matches multiple times on the same element. ` +
          `Directives can only match an element once.`,
      );
    }
    seenDirectives.add(current);
  }
}
