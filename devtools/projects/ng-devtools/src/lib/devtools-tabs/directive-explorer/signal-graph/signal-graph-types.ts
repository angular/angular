/**
 * ???
 */
export interface DebugSignal {
  name?: string;
  value: unknown;
}

/**
 * ???
 */
export interface ReactiveNode {
  signal: DebugSignal;
  producers: ReactiveNode[];
  consumers: ReactiveNode[];
}

/**
 * ???
 */
export type ComponentReactiveNode = ReactiveNode;
