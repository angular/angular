/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, computed, inject, input, output} from '@angular/core';
import {MatIcon} from '@angular/material/icon';

import {DebugSignalGraphNode} from '../../../../../../../protocol';
import {SignalsValueTreeComponent} from './signals-value-tree/signals-value-tree.component';
import {ButtonComponent} from '../../../../shared/button/button.component';
import {
  isClusterNode,
  isSignalNode,
  DevtoolsSignalGraphNode,
  SignalGraphManager,
  DevtoolsClusterNodeType,
  DevtoolsSignalNode,
  DevtoolsClusterNode,
} from '../../signal-graph';
import {MatTooltip} from '@angular/material/tooltip';

const TYPE_CLASS_MAP: {[key in DebugSignalGraphNode['kind']]: string} = {
  'signal': 'type-signal',
  'computed': 'type-computed',
  'effect': 'type-effect',
  'afterRenderEffectPhase': 'type-effect',
  'template': 'type-template',
  'linkedSignal': 'type-linked-signal',
  'childSignalProp': 'type-child-signal-prop',
  'unknown': 'type-unknown',
};

const CLUSTER_TYPE_CLASS_MAP: {[key in DevtoolsClusterNodeType]: string} = {
  'resource': 'type-resource',
};

interface ResourceCluster {
  isLoading: string;
  status: string;
  errored: boolean;
}

@Component({
  selector: 'ng-signals-details',
  templateUrl: './signals-details.component.html',
  styleUrl: './signals-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SignalsValueTreeComponent, MatIcon, ButtonComponent, MatTooltip],
})
export class SignalsDetailsComponent {
  private readonly signalGraph = inject(SignalGraphManager);

  protected readonly node = input.required<DevtoolsSignalGraphNode>();

  protected readonly gotoSource = output<DevtoolsSignalGraphNode>();
  protected readonly expandCluster = output<string>();
  protected readonly highlightDeps = output<{
    node: DevtoolsSignalGraphNode;
    direction: 'up' | 'down';
  }>();
  protected readonly close = output<void>();

  protected readonly TYPE_CLASS_MAP = TYPE_CLASS_MAP;
  protected readonly CLUSTER_TYPE_CLASS_MAP = CLUSTER_TYPE_CLASS_MAP;

  protected readonly isSignalNode = isSignalNode;
  protected readonly isClusterNode = isClusterNode;

  protected readonly cluster = computed(() => {
    const node = this.node();
    if (isSignalNode(node) && node.clusterId) {
      return this.signalGraph.graph()?.clusters[node.clusterId]!;
    }
    return null;
  });

  protected resourceCluster = computed<ResourceCluster | null>(() => {
    const node = this.node();
    if (!isClusterNode(node) || node.clusterType !== 'resource') {
      return null;
    }

    const getCompoundNodeVal = this.getCompoundNodeValueHof(node);

    return {
      status: getCompoundNodeVal('status') || 'idle',
      isLoading: getCompoundNodeVal('isLoading') || 'false',
      errored: !!getCompoundNodeVal('error'),
    };
  });

  protected readonly previewableNode = computed<DevtoolsSignalNode | null>(() => {
    const selectedNode = this.node();
    if (!selectedNode) {
      return null;
    }

    let previewableNode: DevtoolsSignalNode;

    if (isClusterNode(selectedNode)) {
      if (!selectedNode.previewNode) {
        return null;
      }
      previewableNode = this.signalGraph.graph()?.nodes[
        selectedNode.previewNode
      ] as DevtoolsSignalNode;
    } else {
      previewableNode = selectedNode;
    }

    return previewableNode;
  });

  private getCompoundNodeValueHof(node: DevtoolsClusterNode) {
    const compoundNodes = (this.signalGraph
      .graph()
      ?.nodes.filter((n) => isSignalNode(n) && n.clusterId === node.id) ||
      []) as DevtoolsSignalNode[];

    return (name: string) =>
      compoundNodes?.find((n) => n.label === name)?.preview.preview.replace(/"/g, '');
  }
}
