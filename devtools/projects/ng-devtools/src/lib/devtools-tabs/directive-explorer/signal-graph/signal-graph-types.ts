// /**
//  * ???
//  */
// export interface DebugSignal {
//   name?: string;
//   value: unknown;
// }

// /**
//  * ???
//  */
// export interface ReactiveNode {
//   signal: DebugSignal;
//   producers: ReactiveNode[];
//   consumers: ReactiveNode[];
// }

// /**
//  * ???
//  */
// export type ComponentReactiveNode = ReactiveNode;

// Alex B. types: (to be removed after merge)

export interface DebugSignalNode<T> {
  type: 'signal';
  label: string;
  value: T;
}
export interface DebugEffectNode {
  type: 'effect';
  label: string;
}

export interface DebugComputedNode<T> {
  type: 'computed';
  label: string;
  value: T;
}

export interface DebugTemplateNode {
  type: 'template';
  label: string;
}

export type DebugSignalGraphNode<T> =
  | DebugSignalNode<T>
  | DebugEffectNode
  | DebugComputedNode<T>
  | DebugTemplateNode;

export interface DebugSignalGraphEdge {
  consumer: number;
  producer: number;
}

export interface DebugSignalGraph<T> {
  nodes: DebugSignalGraphNode<T>[];
  edges: DebugSignalGraphEdge[];
}
