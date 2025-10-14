import {assertTNode, assertLView} from '../assert';
import {getFrameworkDIDebugData} from '../debug/framework_injector_profiler';
import {NodeInjector, getNodeInjectorTNode, getNodeInjectorLView} from '../di';
import {REACTIVE_TEMPLATE_CONSUMER, HOST, CONTEXT} from '../interfaces/view';
import {R3Injector} from '../../di/r3_injector';
import {throwError} from '../../util/assert';
import {SIGNAL} from '../../../primitives/signals';
import {isLView} from '../interfaces/type_checks';
function isComputedNode(node) {
  return node.kind === 'computed';
}
function isTemplateEffectNode(node) {
  return node.kind === 'template';
}
function isEffectNode(node) {
  return node.kind === 'effect';
}
function isSignalNode(node) {
  return node.kind === 'signal';
}
/**
 *
 * @param injector
 * @returns Template consumer of given NodeInjector
 */
function getTemplateConsumer(injector) {
  const tNode = getNodeInjectorTNode(injector);
  assertTNode(tNode);
  const lView = getNodeInjectorLView(injector);
  assertLView(lView);
  const templateLView = lView[tNode.index];
  if (isLView(templateLView)) {
    return templateLView[REACTIVE_TEMPLATE_CONSUMER] ?? null;
  }
  return null;
}
const signalDebugMap = new WeakMap();
let counter = 0;
function getNodesAndEdgesFromSignalMap(signalMap) {
  const nodes = Array.from(signalMap.keys());
  const debugSignalGraphNodes = [];
  const edges = [];
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
        debuggableFn: consumer.lView?.[CONTEXT]?.constructor,
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
function extractEffectsFromInjector(injector) {
  let diResolver = injector;
  if (injector instanceof NodeInjector) {
    const lView = getNodeInjectorLView(injector);
    diResolver = lView;
  }
  const resolverToEffects = getFrameworkDIDebugData().resolverToEffects;
  const effects = resolverToEffects.get(diResolver) ?? [];
  return effects.map((effect) => effect[SIGNAL]);
}
function extractSignalNodesAndEdgesFromRoots(nodes, signalDependenciesMap = new Map()) {
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
export function getSignalGraph(injector) {
  let templateConsumer = null;
  if (!(injector instanceof NodeInjector) && !(injector instanceof R3Injector)) {
    return throwError('getSignalGraph must be called with a NodeInjector or R3Injector');
  }
  if (injector instanceof NodeInjector) {
    templateConsumer = getTemplateConsumer(injector);
  }
  const nonTemplateEffectNodes = extractEffectsFromInjector(injector);
  const signalNodes = templateConsumer
    ? [templateConsumer, ...nonTemplateEffectNodes]
    : nonTemplateEffectNodes;
  const signalDependenciesMap = extractSignalNodesAndEdgesFromRoots(signalNodes);
  return getNodesAndEdgesFromSignalMap(signalDependenciesMap);
}
//# sourceMappingURL=signal_debug.js.map
