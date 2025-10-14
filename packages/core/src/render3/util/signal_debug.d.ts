import { Injector } from '../../di/injector';
export interface DebugSignalGraphNode {
    kind: string;
    id: string;
    epoch: number;
    label?: string;
    value?: unknown;
    debuggableFn?: () => unknown;
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
export declare function getSignalGraph(injector: Injector): DebugSignalGraph;
