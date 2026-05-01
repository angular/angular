/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, computed, inject, input, output} from '@angular/core';
import {MatIcon} from '@angular/material/icon';

import {DebugSignalGraphNode, ElementPosition} from '../../../../../protocol';
import {SignalValueTreeComponent} from './signal-value-tree/signal-value-tree.component';
import {ButtonComponent} from '../button/button.component';
import {
  isClusterNode,
  isSignalNode,
  DevtoolsSignalGraphNode,
  DevtoolsClusterNodeType,
  DevtoolsSignalNode,
  DevtoolsClusterNode,
  DevtoolsSignalGraph,
} from '../signal-graph';
import {MatTooltip} from '@angular/material/tooltip';
import {IconComponent} from '../icon/icon.component';
import {SUPPORTED_APIS} from '../../application-providers/supported_apis';
import {SignalTransitiveDepsEvent} from '../../devtools-tabs/directive-explorer/signal-transitive-deps-pane/types';

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

/** Available actions for a signal node. */
export interface AvailableActions {
  /** Show source of a regular signal node. */
  gotoSource: boolean;

  /** Expand a cluster node. */
  expandCluster: boolean;

  /** Highlight local downstream dependants. */
  highlightDownstreamDeps: boolean;

  /** Highlight local upstream dependencies. */
  highlightUpstreamDeps: boolean;

  /** Show a graph with all transtive dependencies of the selected node. */
  showTransitiveDeps: boolean;
}

const DEFAULT_ACTIONS: AvailableActions = {
  gotoSource: true,
  expandCluster: true,
  highlightDownstreamDeps: true,
  highlightUpstreamDeps: true,
  showTransitiveDeps: true,
};

@Component({
  selector: 'ng-signal-details',
  templateUrl: './signal-details.component.html',
  styleUrl: './signal-details.component.scss',
  imports: [SignalValueTreeComponent, MatIcon, ButtonComponent, MatTooltip, IconComponent],
})
export class SignalDetailsComponent {
  protected readonly supportedApis = inject(SUPPORTED_APIS);

  /** Signal node to show details for. */
  protected readonly node = input.required<DevtoolsSignalGraphNode>();

  /** Node's host signal graph. */
  protected readonly graph = input.required<DevtoolsSignalGraph>();

  /** Signal node host element. Required for value preview. */
  protected readonly element = input<ElementPosition>();

  protected readonly availableActions = input<AvailableActions>(DEFAULT_ACTIONS);

  protected readonly gotoSource = output<DevtoolsSignalGraphNode>();
  protected readonly expandCluster = output<string>();
  protected readonly highlightDeps = output<{
    node: DevtoolsSignalGraphNode;
    direction: 'up' | 'down';
  }>();
  protected readonly close = output<void>();
  protected readonly showTransitiveDeps = output<SignalTransitiveDepsEvent>();

  protected readonly TYPE_CLASS_MAP = TYPE_CLASS_MAP;
  protected readonly CLUSTER_TYPE_CLASS_MAP = CLUSTER_TYPE_CLASS_MAP;

  protected readonly isSignalNode = isSignalNode;
  protected readonly isClusterNode = isClusterNode;

  protected readonly actionsVisible = computed(
    () => !!Object.values(this.availableActions()).find((a) => a),
  );

  protected readonly cluster = computed(() => {
    const node = this.node();
    if (isSignalNode(node) && node.clusterId) {
      return this.graph().clusters[node.clusterId]!;
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
      previewableNode = this.graph().nodes[selectedNode.previewNode] as DevtoolsSignalNode;
    } else {
      previewableNode = selectedNode;
    }

    return previewableNode;
  });

  protected readonly fallbackPreview = computed<string>(() => {
    const node = this.node();
    if (isSignalNode(node)) {
      return String(node.preview.value);
    }
    return '';
  });

  private getCompoundNodeValueHof(node: DevtoolsClusterNode) {
    const compoundNodes = (this.graph().nodes.filter(
      (n) => isSignalNode(n) && n.clusterId === node.id,
    ) || []) as DevtoolsSignalNode[];

    return (name: string) =>
      compoundNodes?.find((n) => n.label === name)?.preview.preview.replace(/"/g, '');
  }
}
