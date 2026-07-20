/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ReactiveLViewConsumer} from '../reactive_lview_consumer';
import {assertTNode, assertLView} from '../assert';
import {getFrameworkDIDebugData} from '../debug/framework_injector_profiler';
import {NodeInjector, getNodeInjectorTNode, getNodeInjectorLView} from '../di';
import {REACTIVE_TEMPLATE_CONSUMER, HOST, LView, CONTEXT} from '../interfaces/view';
import {EffectNode, EffectRefImpl} from '../reactivity/effect';
import {Injector} from '../../di/injector';
import {R3Injector} from '../../di/r3_injector';
import {throwError} from '../../util/assert';
import {
  ComputedNode,
  LinkedSignalNode,
  ReactiveNode,
  SIGNAL,
  SignalNode,
  Watch,
  createWatch,
  producerAccessed,
  producerUpdateValueVersion,
} from '../../../primitives/signals';
import {isLView} from '../interfaces/type_checks';
import type {
  DebugSignalGraph,
  DebugSignalGraphEdge,
  DebugSignalGraphNode,
} from '../../../primitives/devtools';

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

/**
 * Stores signal debug metadata by string ID, holding a `WeakRef` to the `ReactiveNode`
 * (to allow lookup without preventing garbage collection) and an optional active `Watch`.
 */
const signalDebugNodeMap = new Map<
  string,
  {
    node: WeakRef<SignalNode<unknown> | ComputedNode<unknown> | LinkedSignalNode<unknown, unknown>>;
    watch?: Watch;
  }
>();

/**
 * Finalization registry that destroys and cleans up a `Watch` automatically if the target
 * `ReactiveNode` is garbage-collected while being watched.
 */
const watchCleanupRegistry = new FinalizationRegistry<{id: string}>(({id}) => {
  const entry = signalDebugNodeMap.get(id);
  if (entry?.watch) {
    entry.watch.destroy();
  }
  signalDebugNodeMap.delete(id);
});
let counter = 0;

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
        watched: signalDebugNodeMap.get(id)?.watch !== undefined,
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
        watched: signalDebugNodeMap.get(id)?.watch !== undefined,
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
        watched: signalDebugNodeMap.get(id)?.watch !== undefined,
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
 * - If not watched, creates a reactive `Watch` that logs debugging information
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

  // If already watching this signal, dispose the effect and stop watching.
  if (entry.watch) {
    unwatchSignal(id);
    return;
  }

  // Retrieve the target ReactiveNode from weak reference mapping.
  const node = entry.node.deref();
  if (!node) {
    unwatchSignal(id);
    signalDebugNodeMap.delete(id);
    return;
  }

  // Use a WeakRef in the watch closure so watching does not retain a strong reference to the node.
  const weakNode = new WeakRef(node);

  const watch = createWatch(
    () => {
      const targetNode = weakNode.deref();
      if (!targetNode) {
        // Target signal node was garbage collected; clean up watch state.
        unwatchSignal(id);
        signalDebugNodeMap.delete(id);
        return;
      }
      producerUpdateValueVersion(targetNode);
      producerAccessed(targetNode);
      const name = targetNode.debugName ? targetNode.debugName : 'DevTools signal watch';
      // tslint:disable-next-line:no-console
      console.log(`[${name}]`, ': ', targetNode.value);
    },
    (watch) => {
      queueMicrotask(() => watch.run());
    },
    false,
  );

  entry.watch = watch;
  watch.run();
}

function unwatchSignal(id: string) {
  const entry = signalDebugNodeMap.get(id);
  if (entry?.watch) {
    entry.watch.destroy();
    entry.watch = undefined;
  }
}
