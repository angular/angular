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
  HostDirectiveDef,
  HostDirectiveDefs,
  HostDirectiveRanges,
} from '../interfaces/definition';
import {NodeInjectorFactory} from '../interfaces/injector';
import {
  HostDirectiveInputs,
  HostDirectiveOutputs,
  InitialInputs,
  NodeInputBindings,
  NodeOutputBindings,
  TNodeFlags,
  type TContainerNode,
  type TElementContainerNode,
  type TElementNode,
  type TNode,
} from '../interfaces/node';
import {isComponentDef} from '../interfaces/type_checks';
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
  // Please make sure to have explicit type for `exportsMap`. Inferred type triggers bug in tsickle.
  ngDevMode && assertFirstCreatePass(tView);

  const exportsMap: Record<string, number> | null = localRefs === null ? null : {'': -1};
  const matchedDirectiveDefs = directiveMatcher(tView, tNode);

  if (matchedDirectiveDefs !== null) {
    let directiveDefs = matchedDirectiveDefs;
    let hostDirectiveDefs: HostDirectiveDefs | null = null;
    let hostDirectiveRanges: HostDirectiveRanges | null = null;

    for (const def of matchedDirectiveDefs) {
      if (def.resolveHostDirectives !== null) {
        [directiveDefs, hostDirectiveDefs, hostDirectiveRanges] =
          def.resolveHostDirectives(matchedDirectiveDefs);
        break;
      }
    }

    ngDevMode && assertNoDuplicateDirectives(directiveDefs);

    initializeDirectives(
      tView,
      lView,
      tNode,
      directiveDefs,
      exportsMap,
      hostDirectiveDefs,
      hostDirectiveRanges,
    );
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
function initializeDirectives(
  tView: TView,
  lView: LView<unknown>,
  tNode: TElementNode | TContainerNode | TElementContainerNode,
  directives: DirectiveDef<unknown>[],
  exportsMap: {[key: string]: number} | null,
  hostDirectiveDefs: HostDirectiveDefs | null,
  hostDirectiveRanges: HostDirectiveRanges | null,
) {
  ngDevMode && assertFirstCreatePass(tView);

  const directivesLength = directives.length;
  let hasSeenComponent = false;

  // Publishes the directive types to DI so they can be injected. Needs to
  // happen in a separate pass before the TNode flags have been initialized.
  for (let i = 0; i < directivesLength; i++) {
    const def = directives[i];
    if (!hasSeenComponent && isComponentDef(def)) {
      hasSeenComponent = true;
      markAsComponentHost(tView, tNode, i);
    }
    diPublicInInjector(getOrCreateNodeInjectorForNode(tNode, lView), tView, def.type);
  }

  initTNodeFlags(tNode, tView.data.length, directivesLength);

  // When the same token is provided by several directives on the same node, some rules apply in
  // the viewEngine:
  // - viewProviders have priority over providers
  // - the last directive in NgModule.declarations has priority over the previous one
  // So to match these rules, the order in which providers are added in the arrays is very
  // important.
  for (let i = 0; i < directivesLength; i++) {
    const def = directives[i];
    if (def.providersResolver) def.providersResolver(def);
  }
  let preOrderHooksFound = false;
  let preOrderCheckHooksFound = false;
  let directiveIdx = allocExpando(tView, lView, directivesLength, null);
  ngDevMode &&
    assertSame(
      directiveIdx,
      tNode.directiveStart,
      'TNode.directiveStart should point to just allocated space',
    );

  // If there's at least one directive, we'll have to track it so initialize the map.
  if (directivesLength > 0) {
    tNode.directiveToIndex = new Map();
  }

  for (let i = 0; i < directivesLength; i++) {
    const def = directives[i];
    // Merge the attrs in the order of matches. This assumes that the first directive is the
    // component itself, so that the component has the least priority.
    tNode.mergedAttrs = mergeHostAttrs(tNode.mergedAttrs, def.hostAttrs);

    configureViewWithDirective(tView, tNode, lView, directiveIdx, def);
    saveNameToExportMap(directiveIdx, def, exportsMap);

    // If a directive has host directives, we need to track both its index and the range within
    // the host directives are declared. Host directives are not tracked, but should be resolved
    // by looking up the host and getting its indexes from there.
    if (hostDirectiveRanges !== null && hostDirectiveRanges.has(def)) {
      const [start, end] = hostDirectiveRanges.get(def)!;
      tNode.directiveToIndex!.set(def.type, [
        directiveIdx,
        start + tNode.directiveStart,
        end + tNode.directiveStart,
      ]);
    } else if (hostDirectiveDefs === null || !hostDirectiveDefs.has(def)) {
      tNode.directiveToIndex!.set(def.type, directiveIdx);
    }

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
  hostDirectiveDefs: HostDirectiveDefs | null,
): void {
  ngDevMode && assertFirstCreatePass(tView);

  for (let index = tNode.directiveStart; index < tNode.directiveEnd; index++) {
    const directiveDef = tView.data[index] as DirectiveDef<any>;

    if (hostDirectiveDefs === null || !hostDirectiveDefs.has(directiveDef)) {
      setupSelectorMatchedInputsOrOutputs(BindingType.Inputs, tNode, directiveDef, index);
      setupSelectorMatchedInputsOrOutputs(BindingType.Outputs, tNode, directiveDef, index);
      setupInitialInputs(tNode, index, false);
    } else {
      const hostDirectiveDef = hostDirectiveDefs.get(directiveDef)!;
      setupHostDirectiveInputsOrOutputs(BindingType.Inputs, tNode, hostDirectiveDef, index);
      setupHostDirectiveInputsOrOutputs(BindingType.Outputs, tNode, hostDirectiveDef, index);
      setupInitialInputs(tNode, index, true);
    }
  }
}

/** Types of bindings that can be exposed by a directive. */
const enum BindingType {
  Inputs,
  Outputs,
}

/**
 * Sets up the input/output bindings for a directive that was matched in the template through its
 * selector. This method is called repeatedly to build up all of the available inputs on a node.
 *
 * @param mode Whether inputs or outputs are being contructed.
 * @param tNode Node on which the bindings are being set up.
 * @param def Directive definition for which the bindings are being set up.
 * @param directiveIndex Index at which the directive instance will be stored in the LView.
 */
function setupSelectorMatchedInputsOrOutputs<T>(
  mode: BindingType,
  tNode: TNode,
  def: DirectiveDef<T>,
  directiveIndex: number,
): void {
  const aliasMap = mode === BindingType.Inputs ? def.inputs : def.outputs;

  for (const publicName in aliasMap) {
    if (aliasMap.hasOwnProperty(publicName)) {
      let bindings: NodeInputBindings | NodeOutputBindings;
      if (mode === BindingType.Inputs) {
        bindings = tNode.inputs ??= {};
      } else {
        bindings = tNode.outputs ??= {};
      }
      bindings[publicName] ??= [];
      bindings[publicName].push(directiveIndex);
      setShadowStylingInputFlags(tNode, publicName);
    }
  }
}

/**
 * Sets up input/output bindings that were defined through host directives on a specific node.
 * @param mode Whether inputs or outputs are being contructed.
 * @param tNode Node on which the bindings are being set up.
 * @param config Host directive definition that is being set up.
 * @param directiveIndex Index at which the directive instance will be stored in the LView.
 */
function setupHostDirectiveInputsOrOutputs(
  mode: BindingType,
  tNode: TNode,
  config: HostDirectiveDef,
  directiveIndex: number,
): void {
  const aliasMap = mode === BindingType.Inputs ? config.inputs : config.outputs;

  for (const initialName in aliasMap) {
    if (aliasMap.hasOwnProperty(initialName)) {
      const publicName = aliasMap[initialName];
      let bindings: HostDirectiveInputs | HostDirectiveOutputs;
      if (mode === BindingType.Inputs) {
        bindings = tNode.hostDirectiveInputs ??= {};
      } else {
        bindings = tNode.hostDirectiveOutputs ??= {};
      }
      bindings[publicName] ??= [];
      bindings[publicName].push(directiveIndex, initialName);
      setShadowStylingInputFlags(tNode, publicName);
    }
  }
}

function setShadowStylingInputFlags(tNode: TNode, publicName: string): void {
  if (publicName === 'class') {
    tNode.flags |= TNodeFlags.hasClassInput;
  } else if (publicName === 'style') {
    tNode.flags |= TNodeFlags.hasStyleInput;
  }
}

/**
 * Sets up the initialInputData for a node and stores it in the template's static storage
 * so subsequent template invocations don't have to recalculate it.
 *
 * initialInputData is an array containing values that need to be set as input properties
 * for directives on this node, but only once on creation. We need this array to support
 * the case where you set an @Input property of a directive using attribute-like syntax.
 * e.g. if you have a `name` @Input, you can set it once like this:
 *
 * <my-component name="Bess"></my-component>
 *
 * @param tNode TNode on which to set up the initial inputs.
 * @param directiveIndex Index of the directive that is currently being processed.
 */
function setupInitialInputs(tNode: TNode, directiveIndex: number, isHostDirective: boolean): void {
  const {attrs, inputs, hostDirectiveInputs} = tNode;

  if (
    attrs === null ||
    (!isHostDirective && inputs === null) ||
    (isHostDirective && hostDirectiveInputs === null) ||
    // Do not use unbound attributes as inputs to structural directives, since structural
    // directive inputs can only be set using microsyntax (e.g. `<div *dir="exp">`).
    isInlineTemplate(tNode)
  ) {
    tNode.initialInputs ??= [];
    tNode.initialInputs.push(null);
    return;
  }

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
    } else if (typeof attrName === 'number') {
      // If we hit any other attribute markers, we're done anyway. None of those are valid inputs.
      break;
    }

    if (!isHostDirective && inputs!.hasOwnProperty(attrName as string)) {
      // Find the input's public name from the input store. Note that we can be found easier
      // through the directive def, but we want to do it using the inputs store so that it can
      // account for host directive aliases.
      const inputConfig = inputs![attrName as string];

      for (const index of inputConfig) {
        if (index === directiveIndex) {
          inputsToStore ??= [];
          inputsToStore.push(attrName as string, attrs[i + 1] as string);
          // A directive can't have multiple inputs with the same name so we can break here.
          break;
        }
      }
    } else if (isHostDirective && hostDirectiveInputs!.hasOwnProperty(attrName as string)) {
      const config = hostDirectiveInputs![attrName as string];
      for (let j = 0; j < config.length; j += 2) {
        if (config[j] === directiveIndex) {
          inputsToStore ??= [];
          inputsToStore.push(config[j + 1] as string, attrs[i + 1] as string);
          break;
        }
      }
    }

    i += 2;
  }

  tNode.initialInputs ??= [];
  tNode.initialInputs.push(inputsToStore);
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
    ngDevMode ? def.type.name : null,
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

function assertNoDuplicateDirectives(directives: DirectiveDef<unknown>[]): void {
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
