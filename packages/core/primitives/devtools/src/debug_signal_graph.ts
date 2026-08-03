/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ReactiveNodeKind} from '@angular/core/primitives/signals';

export interface DebugSignalGraphNode {
  kind: ReactiveNodeKind;
  id: string;
  epoch: number;
  label?: string;
  value?: unknown;
  debuggableFn?: () => unknown;
  isPrivate?: boolean;
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

  /**
   * Whether the link between producer and consumer was created through a private tracking context.
   */
  isPrivate?: boolean;
}

/**
 * A debug representation of the signal graph.
 */
export interface DebugSignalGraph {
  nodes: DebugSignalGraphNode[];
  edges: DebugSignalGraphEdge[];
}
