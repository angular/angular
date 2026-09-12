/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import type {
  DebugSignalGraph,
  DebugSignalGraphEdge,
  DebugSignalGraphNode,
} from '../../../primitives/devtools';
import {
  ComputedNode,
  ERRORED,
  LinkedSignalNode,
  REACTIVE_NODE,
  ReactiveNode,
  SIGNAL,
  SignalNode,
  consumerAfterComputation,
  consumerBeforeComputation,
  consumerDestroy,
  consumerPollProducersForChange,
  producerAccessed,
  producerUpdateValueVersion,
} from '../../../primitives/signals';
import {Injector} from '../../di/injector';
import {R3Injector} from '../../di/r3_injector';
import {throwError} from '../../util/assert';
import {assertLView, assertTNode} from '../assert';
import {getFrameworkDIDebugData} from '../debug/framework_injector_profiler';
import {NodeInjector, getNodeInjectorLView, getNodeInjectorTNode} from '../di';
import {isLView} from '../interfaces/type_checks';
import {CONTEXT, HOST, LView, REACTIVE_TEMPLATE_CONSUMER} from '../interfaces/view';
import {ReactiveLViewConsumer} from '../reactive_lview_consumer';
import type {AfterRenderPhaseEffectNode} from '../reactivity/after_render_effect';
import {EffectNode, EffectRefImpl} from '../reactivity/effect';

function isComputedNode(node: ReactiveNode): node is ComputedNode<unknown> {
  return node.kind === 'computed';
}

function isTemplateEffectNode(node: ReactiveNode): node is ReactiveLViewConsumer {
  return node.kind === 'template';
}

function isEffectNode(node: ReactiveNode): node is EffectNode {
  return node.kind === 'effect';
}

function isSignalNode(node: ReactiveNode): node is SignalNode<unknown> {
  return node.kind === 'signal';
}

function isLinkedSignalNode(node: ReactiveNode): node is LinkedSignalNode<unknown, unknown> {
  return node.kind === 'linkedSignal';
}

function isAfterRenderEffectPhaseNode(node: ReactiveNode): node is AfterRenderPhaseEffectNode {
  return node.kind === 'afterRenderEffectPhase';
}

/**
 *
 * @param injector
 * @returns Template consumer of given NodeInjector
 */
function getTemplateConsumer(injector: NodeInjector): ReactiveLViewConsumer | null {
  const tNode = getNodeInjectorTNode(injector)!;
  assertTNode(tNode);
  const lView = getNodeInjectorLView(injector)!;
  assertLView(lView);
  const templateLView = lView[tNode.index]!;
  if (isLView(templateLView)) {
    return templateLView[REACTIVE_TEMPLATE_CONSUMER] ?? null;
  }
  return null;
}

/**
 * Maps a `ReactiveNode` to its generated unique string ID for DevTools.
 */
const signalDebugMap = new WeakMap<ReactiveNode, string>();

interface DebugWatchNode extends ReactiveNode {
  targetNode: WeakRef<ReactiveNode>;
  destroyed: boolean;
}

/**
 * Stores signal debug metadata by string ID, holding a `WeakRef` to the `ReactiveNode`
 * and a `WeakRef` to any active `DebugWatchNode` so signals and watchers can form isolated
 * cycles that are eligible for garbage collection when app references are dropped.
 */
const signalDebugNodeMap = new Map<
  string,
  {
    node: WeakRef<SignalNode<unknown> | ComputedNode<unknown> | LinkedSignalNode<unknown, unknown>>;
    watch?: WeakRef<DebugWatchNode>;
  }
>();

/**
 * Finalization registry that destroys and cleans up a `DebugWatchNode` automatically if the target
 * `ReactiveNode` is garbage-collected while being watched.
 */
const watchCleanupRegistry = new FinalizationRegistry<{id: string}>(({id}) => {
  unwatchSignal(id);
  signalDebugNodeMap.delete(id);
});
let counter = 0;

function isWatched(id: string): boolean {
  const watchRef = signalDebugNodeMap.get(id)?.watch;
  if (!watchRef) return false;
  const watchNode = watchRef.deref();
  return watchNode !== undefined && !watchNode.destroyed;
}

function getNodesAndEdgesFromSignalMap(signalMap: ReadonlyMap<ReactiveNode, ReactiveNode[]>): {
  nodes: DebugSignalGraphNode[];
  edges: DebugSignalGraphEdge[];
} {
  const nodes = Array.from(signalMap.keys());
  const debugSignalGraphNodes: DebugSignalGraphNode[] = [];
  const edges: DebugSignalGraphEdge[] = [];

  for (const [consumer, producers] of signalMap.entries()) {
    const consumerIndex = nodes.indexOf(consumer);

    let id = signalDebugMap.get(consumer);
    if (!id) {
      counter++;
      id = counter.toString();
      signalDebugMap.set(consumer, id);
    }

    if (isComputedNode(consumer)) {
      if (!signalDebugNodeMap.has(id)) {
        signalDebugNodeMap.set(id, {node: new WeakRef(consumer)});
        watchCleanupRegistry.register(consumer, {id});
      }
      debugSignalGraphNodes.push({
        label: consumer.debugName,
        value: consumer.value,
        kind: consumer.kind,
        epoch: consumer.version,
        debuggableFn: consumer.computation,
        watched: isWatched(id),
        id,
      });
    } else if (isSignalNode(consumer)) {
      if (!signalDebugNodeMap.has(id)) {
        signalDebugNodeMap.set(id, {node: new WeakRef(consumer)});
        watchCleanupRegistry.register(consumer, {id});
      }
      debugSignalGraphNodes.push({
        label: consumer.debugName,
        value: consumer.value,
        kind: consumer.kind,
        epoch: consumer.version,
        watched: isWatched(id),
        id,
      });
    } else if (isTemplateEffectNode(consumer)) {
      debugSignalGraphNodes.push({
        label: consumer.debugName ?? consumer.lView?.[HOST]?.tagName?.toLowerCase?.(),
        kind: consumer.kind,
        epoch: consumer.version,
        // The `lView[CONTEXT]` is a reference to an instance of the component's class.
        // We get the constructor so that `inspect(.constructor)` shows the component class.
        debuggableFn: consumer.lView?.[CONTEXT]?.constructor as (() => unknown) | undefined,
        watched: false,
        id,
      });
    } else if (isLinkedSignalNode(consumer)) {
      if (!signalDebugNodeMap.has(id)) {
        signalDebugNodeMap.set(id, {node: new WeakRef(consumer)});
        watchCleanupRegistry.register(consumer, {id});
      }
      debugSignalGraphNodes.push({
        label: consumer.debugName,
        value: consumer.value,
        kind: consumer.kind,
        epoch: consumer.version,
        debuggableFn: consumer.computation as (() => unknown) | undefined,
        watched: isWatched(id),
        id,
      });
    } else if (isEffectNode(consumer)) {
      debugSignalGraphNodes.push({
        label: consumer.debugName,
        kind: consumer.kind,
        epoch: consumer.version,
        debuggableFn: consumer.userFn as (() => unknown) | undefined,
        id,
      });
    } else if (isAfterRenderEffectPhaseNode(consumer)) {
      debugSignalGraphNodes.push({
        label: consumer.debugName,
        kind: consumer.kind,
        epoch: consumer.version,
        debuggableFn: consumer.userFn as () => unknown,
        id,
      });
    } else {
      debugSignalGraphNodes.push({
        label: consumer.debugName,
        kind: consumer.kind,
        epoch: consumer.version,
        watched: false,
        id,
      });
    }

    // collect edges for node
    for (const producer of producers) {
      edges.push({consumer: consumerIndex, producer: nodes.indexOf(producer)});
    }
  }

  return {nodes: debugSignalGraphNodes, edges};
}

function extractEffectsFromInjector(injector: Injector): ReactiveNode[] {
  let diResolver: Injector | LView<unknown> = injector;
  if (injector instanceof NodeInjector) {
    const lView = getNodeInjectorLView(injector)!;
    diResolver = lView;
  }

  const resolverToEffects = getFrameworkDIDebugData().resolverToEffects;
  const effects = resolverToEffects.get(diResolver) ?? [];

  return effects.map((effect) => {
    if (effect instanceof EffectRefImpl) {
      return effect[SIGNAL] as ReactiveNode;
    } else {
      // Narrowing down afterRenderEffect phases
      return effect.signal[SIGNAL] as ReactiveNode;
    }
  });
}

function extractSignalNodesAndEdgesFromRoots(
  nodes: ReactiveNode[],
  signalDependenciesMap: Map<ReactiveNode, ReactiveNode[]> = new Map(),
): Map<ReactiveNode, ReactiveNode[]> {
  for (const node of nodes) {
    if (signalDependenciesMap.has(node)) {
      continue;
    }

    const producerNodes = [];
    for (let link = node.producers; link !== undefined; link = link.nextProducer) {
      const producer = link.producer;
      producerNodes.push(producer);
    }
    signalDependenciesMap.set(node, producerNodes);
    extractSignalNodesAndEdgesFromRoots(producerNodes, signalDependenciesMap);
  }

  return signalDependenciesMap;
}

/**
 * Returns a debug representation of the signal graph for the given injector.
 *
 * Currently only supports element injectors. Starts by discovering the consumer nodes
 * and then traverses their producer nodes to build the signal graph.
 *
 * @param injector The injector to get the signal graph for.
 * @returns A debug representation of the signal graph.
 * @throws If the injector is an environment injector.
 */
export function getSignalGraph(injector: Injector): DebugSignalGraph {
  let templateConsumer: ReactiveLViewConsumer | null = null;

  if (!(injector instanceof NodeInjector) && !(injector instanceof R3Injector)) {
    return throwError('getSignalGraph must be called with a NodeInjector or R3Injector');
  }

  if (injector instanceof NodeInjector) {
    templateConsumer = getTemplateConsumer(injector as NodeInjector);
  }

  const nonTemplateEffectNodes = extractEffectsFromInjector(injector);

  const signalNodes = templateConsumer
    ? [templateConsumer, ...nonTemplateEffectNodes]
    : nonTemplateEffectNodes;

  const signalDependenciesMap = extractSignalNodesAndEdgesFromRoots(signalNodes);

  return getNodesAndEdgesFromSignalMap(signalDependenciesMap);
}

/**
 * Toggles debug watching for a signal node by its ID.
 *
 * - If the signal is currently watched, disposes the watcher.
 * - If not watched, creates a reactive `DebugWatchNode` that logs debugging information
 *   whenever the signal updates or is invalidated.
 *
 * Uses `WeakRef` and `FinalizationRegistry` so watching a signal does not prevent it
 * (or its enclosing context) from being garbage collected.
 *
 * @param id The unique string ID of the signal node to watch or unwatch.
 */
export function toggleWatchSignal(id: string): void {
  const entry = signalDebugNodeMap.get(id);
  if (!entry) {
    console.warn(
      `Could not find signal with ID "${id}". The ID may be wrong, or it could have been garbage collected.`,
    );
    return;
  }

  // If already watching this signal, dispose the watcher and stop watching.
  if (entry.watch) {
    const activeWatch = entry.watch.deref();
    if (activeWatch && !activeWatch.destroyed) {
      unwatchSignal(id);
      return;
    }
  }

  // Retrieve the target ReactiveNode from weak reference mapping.
  const node = entry.node.deref();
  if (!node) {
    unwatchSignal(id);
    signalDebugNodeMap.delete(id);
    return;
  }

  const watchNode = createDebugWatchNode(node);
  entry.watch = new WeakRef(watchNode);
  runDebugWatch(watchNode);
}

function createDebugWatchNode(targetNode: ReactiveNode): DebugWatchNode {
  const node: DebugWatchNode = {
    ...REACTIVE_NODE,
    consumerIsAlwaysLive: true,
    consumerAllowSignalWrites: true,
    dirty: true,
    kind: 'effect',
    targetNode: new WeakRef(targetNode),
    destroyed: false,
    consumerMarkedDirty: () => {
      if (node.destroyed) return;
      // Schedule watch re-execution asynchronously in the next microtask after
      // the signal update cycle completes, ceding the main thread back to the
      // framework and avoiding synchronous re-entrancy during value computation.
      queueMicrotask(() => runDebugWatch(node));
    },
  };
  return node;
}

function runDebugWatch(node: DebugWatchNode): void {
  if (node.destroyed) return;

  const targetNode = node.targetNode.deref();
  if (!targetNode) {
    node.destroyed = true;
    consumerDestroy(node);
    return;
  }

  node.dirty = false;
  if (node.version > 0 && !consumerPollProducersForChange(node)) {
    return;
  }
  node.version++;

  const prevConsumer = consumerBeforeComputation(node);
  try {
    producerUpdateValueVersion(targetNode);
    producerAccessed(targetNode);
    const name = targetNode.debugName ? targetNode.debugName : 'DevTools signal watch';
    if (
      (isComputedNode(targetNode) || isLinkedSignalNode(targetNode)) &&
      targetNode.value === ERRORED
    ) {
      // tslint:disable-next-line:no-console
      console.error(`[${name} (error)]:`, targetNode.error);
      return;
    }
    const value =
      isSignalNode(targetNode) || isComputedNode(targetNode) || isLinkedSignalNode(targetNode)
        ? targetNode.value
        : undefined;
    // tslint:disable-next-line:no-console
    console.log(`[${name}]:`, value);
  } finally {
    consumerAfterComputation(node, prevConsumer);
  }
}

function unwatchSignal(id: string) {
  const entry = signalDebugNodeMap.get(id);
  if (entry?.watch) {
    const watchNode = entry.watch.deref();
    if (watchNode && !watchNode.destroyed) {
      watchNode.destroyed = true;
      consumerDestroy(watchNode);
    }
    entry.watch = undefined;
  }
}
