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
  LinkedSignalNode,
  ReactiveNode,
  SIGNAL,
  SignalNode,
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

const signalDebugMap = new WeakMap<ReactiveNode, string>();
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

    // collect node
    if (isComputedNode(consumer)) {
      debugSignalGraphNodes.push({
        label: consumer.debugName,
        value: consumer.value,
        kind: consumer.kind,
        epoch: consumer.version,
        debuggableFn: consumer.computation,
        id,
      });
    } else if (isLinkedSignalNode(consumer)) {
      debugSignalGraphNodes.push({
        label: consumer.debugName,
        value: consumer.value,
        kind: consumer.kind,
        epoch: consumer.version,
        debuggableFn: consumer.computation as () => unknown,
        id,
      });
    } else if (isSignalNode(consumer)) {
      debugSignalGraphNodes.push({
        label: consumer.debugName,
        value: consumer.value,
        kind: consumer.kind,
        epoch: consumer.version,
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
