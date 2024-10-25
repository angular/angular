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
} from '@angular/core/primitives/signals';

export interface DebugSignalGraphNode {
  kind: string;
  label: string;
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
  // We implement this check with property sniffing to avoid modifying core/primitives.
  // This is temporary and will be refactored in the immediate future to properly check the type.
  const computedNode = node as ComputedNode<unknown>;
  const hasComputedProperties =
    computedNode !== undefined && computedNode.computation !== undefined;
  const isNotLinkedSignalNode = (computedNode as any).sourceValue === undefined;
  return hasComputedProperties && isNotLinkedSignalNode;
}

function isTemplateNode(node: ReactiveNode): node is ReactiveLViewConsumer {
  const prototype = Object.getPrototypeOf(node);
  return prototype === REACTIVE_LVIEW_CONSUMER_NODE || prototype === TEMPORARY_CONSUMER_NODE;
}

function isEffectNode(node: ReactiveNode): node is EffectNode {
  const prototype = Object.getPrototypeOf(node);
  return prototype === ROOT_EFFECT_NODE || prototype === VIEW_EFFECT_NODE;
}

function isSignalNode(node: ReactiveNode): node is SignalNode<unknown> {
  return Object.getPrototypeOf(node) === SIGNAL_NODE;
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
  assertLView(templateLView);

  return templateLView[REACTIVE_TEMPLATE_CONSUMER];
}

function getNodesAndEdgesFromSignalMap(signalMap: ReadonlyMap<ReactiveNode, ReactiveNode[]>): {
  nodes: DebugSignalGraphNode[];
  edges: DebugSignalGraphEdge[];
} {
  const nodes = Array.from(signalMap.keys());
  const debugSignalGraphNodes = nodes.map((signalGraphNode: ReactiveNode) => {
    if (isComputedNode(signalGraphNode)) {
      return {
        label: signalGraphNode.debugName,
        value: signalGraphNode.value,
        kind: 'computed',
      };
    }

    if (isTemplateNode(signalGraphNode)) {
      return {
        label: signalGraphNode.lView?.[HOST]?.tagName?.toLowerCase?.(),
        kind: 'template',
      };
    }

    if (isEffectNode(signalGraphNode)) {
      return {
        label: signalGraphNode.debugName,
        kind: 'effect',
      };
    }

    if (isSignalNode(signalGraphNode)) {
      return {
        label: signalGraphNode.debugName,
        value: signalGraphNode.value,
        kind: 'signal',
      };
    }

    return {
      label: signalGraphNode.debugName,
      kind: 'unknown',
    };
  }) as DebugSignalGraphNode[];

  const edges: DebugSignalGraphEdge[] = [];

  for (const [consumer, producers] of signalMap.entries()) {
    const consumerNode = nodes.indexOf(consumer);
    for (const producer of producers) {
      edges.push({consumer: consumerNode, producer: nodes.indexOf(producer)});
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

export function getSignalGraph(injector: Injector): DebugSignalGraph {
  if (injector instanceof R3Injector) {
    return throwError('getSignalGraph does not currently support environment injectors');
  }
  if (!(injector instanceof NodeInjector)) {
    return throwError('getSignalGraph must be called with a NodeInjector or an R3Injector');
  }

  let templateConsumer = getTemplateConsumer(injector as NodeInjector);
  const nonTemplateEffectNodes = extractEffectsFromInjector(injector);
  const signalNodes = templateConsumer
    ? [templateConsumer, ...nonTemplateEffectNodes]
    : nonTemplateEffectNodes;

  const signalDependenciesMap = extractSignalNodesAndEdgesFromRoots(signalNodes);
  return getNodesAndEdgesFromSignalMap(signalDependenciesMap);
}
