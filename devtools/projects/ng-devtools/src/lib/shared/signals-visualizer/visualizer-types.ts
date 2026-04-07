/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 *
 */

interface DagreNodeBase {
  x?: number;
  y?: number;
  style?: string;
}

// Non-exhaustive; Alter based on Dagre D3 docs if required
export interface DagreRegularNode extends DagreNodeBase {
  label: HTMLDivElement;
  labelType: string;
  shape: string;
  padding: number;
  width: number;
  height: number;
  epoch?: number;
}

// Non-exhaustive; Alter based on Dagre D3 docs if required
export interface DagreCluster extends DagreNodeBase {
  label: string;
  clusterLabelPos: string;
  class?: string;
}

export type DagreNode = DagreRegularNode | DagreCluster;

// Non-exhaustive; Alter based on Dagre D3 docs if required
export interface DagreEdge {
  curve: any;
  style?: string;
  arrowheadStyle?: string;
  class?: string;
}
