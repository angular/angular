/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  REACTIVE_LVIEW_CONSUMER_NODE,
  ReactiveLViewConsumer,
  TEMPORARY_CONSUMER_NODE,
} from '../reactive_lview_consumer';
import {assertTNode, assertLView} from '../assert';
import {getFrameworkDIDebugData} from '../debug/framework_injector_profiler';
import {NodeInjector, getNodeInjectorTNode, getNodeInjectorLView} from '../di';
import {REACTIVE_TEMPLATE_CONSUMER, HOST, LView} from '../interfaces/view';
import {EffectNode, EffectRefImpl, ROOT_EFFECT_NODE, VIEW_EFFECT_NODE} from '../reactivity/effect';
import {Injector} from '../../di/injector';
import {R3Injector} from '../../di/r3_injector';
import {throwError} from '../../util/assert';
import {
  ComputedNode,
  ReactiveNode,
  SIGNAL,
  SIGNAL_NODE,
  SignalNode,
} from '../../../primitives/signals';
import {isLView} from '../interfaces/type_checks';

export interface DebugSignalGraphNode {
  kind: string;
  label?: string;
  value?: unknown;
}

export interface DebugSignalGraphEdge {
  /**
   * Index of a signal node in the `nodes` array that is a consumer of the signal produced by the producer node.
   */
  consumer: number;

  /**
   * Index of a signal node in the `nodes` array that is a producer of the signal consumed by the consumer node.
   */
  producer: number;
}

/**
 * A debug representation of the signal graph.
 */
export interface DebugSignalGraph {
  nodes: DebugSignalGraphNode[];
  edges: DebugSignalGraphEdge[];
}

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

function getNodesAndEdgesFromSignalMap(signalMap: ReadonlyMap<ReactiveNode, ReactiveNode[]>): {
  nodes: DebugSignalGraphNode[];
  edges: DebugSignalGraphEdge[];
} {
  const nodes = Array.from(signalMap.keys());
  const debugSignalGraphNodes: DebugSignalGraphNode[] = [];
  const edges: DebugSignalGraphEdge[] = [];

  for (const [consumer, producers] of signalMap.entries()) {
    const consumerIndex = nodes.indexOf(consumer);

    // collect node
    if (isComputedNode(consumer) || isSignalNode(consumer)) {
      debugSignalGraphNodes.push({
        label: consumer.debugName,
        value: consumer.value,
        kind: consumer.kind,
      });
    } else if (isTemplateEffectNode(consumer)) {
      debugSignalGraphNodes.push({
        label: consumer.debugName ?? consumer.lView?.[HOST]?.tagName?.toLowerCase?.(),
        kind: consumer.kind,
      });
    } else if (isEffectNode(consumer)) {
      debugSignalGraphNodes.push({
        label: consumer.debugName,
        kind: consumer.kind,
      });
    } else {
      debugSignalGraphNodes.push({
        label: consumer.debugName,
        kind: consumer.kind,
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

  const resolverToEffects = getFrameworkDIDebugData().resolverToEffects as Map<
    Injector | LView<unknown>,
    EffectRefImpl[]
  >;
  const effects = resolverToEffects.get(diResolver) ?? [];

  return effects.map((effect: EffectRefImpl) => effect[SIGNAL]);
}

function extractSignalNodesAndEdgesFromRoots(
  nodes: ReactiveNode[],
  signalDependenciesMap: Map<ReactiveNode, ReactiveNode[]> = new Map(),
): Map<ReactiveNode, ReactiveNode[]> {
  for (const node of nodes) {
    if (signalDependenciesMap.has(node)) {
      continue;
    }

    const producerNodes = (node.producerNode ?? []) as ReactiveNode[];
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
