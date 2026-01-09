/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  ɵFramework as Framework,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';

import {DebugSignalGraphNode, DirectivePosition} from '../../../../../../../../protocol';
import {
  DirectivePropertyResolver,
  DirectiveTreeData,
} from '../../../property-resolver/directive-property-resolver';
import {DependencyViewerComponent} from './dependency-viewer/dependency-viewer.component';
import {DocsRefButtonComponent} from '../../../../../shared/docs-ref-button/docs-ref-button.component';
import {ObjectTreeExplorerComponent} from '../../../../../shared/object-tree-explorer/object-tree-explorer.component';
import {SUPPORTED_APIS} from '../../../../../application-providers/supported_apis';

import {SignalGraphManager} from '../../../signal-graph/signal-graph-manager';
import {FlatNode} from '../../../../../shared/object-tree-explorer/object-tree-types';

@Component({
  selector: 'ng-property-view-body',
  templateUrl: './property-view-body.component.html',
  styleUrls: ['./property-view-body.component.scss'],
  imports: [
    MatIcon,
    MatTooltip,
    MatExpansionModule,
    MatSnackBarModule,
    DocsRefButtonComponent,
    DependencyViewerComponent,
    ObjectTreeExplorerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyViewBodyComponent {
  private readonly _snackBar = inject(MatSnackBar);
  private readonly signalGraph = inject(SignalGraphManager);
  protected readonly supportedApis = inject(SUPPORTED_APIS);

  protected readonly signalGraphEnabled = () => this.supportedApis().signals;

  readonly controller = input.required<DirectivePropertyResolver>();
  readonly directiveInputControls = input.required<DirectiveTreeData>();
  readonly directivePropControls = input.required<DirectiveTreeData>();
  readonly directiveOutputControls = input.required<DirectiveTreeData>();
  readonly directiveStateControls = input.required<DirectiveTreeData>();

  readonly inspect = output<{node: FlatNode; directivePosition: DirectivePosition}>();
  readonly showSignalGraph = output<DebugSignalGraphNode>();

  protected readonly dependencies = computed(() => {
    const metadata = this.controller().directiveMetadata;
    if (!metadata) return [];
    if (!('dependencies' in metadata)) return [];
    return metadata.dependencies;
  });

  protected readonly panels = signal([
    {
      title: () => 'Inputs',
      controls: () => this.directiveInputControls(),
    },
    {
      title: () => 'Props',
      controls: () => this.directivePropControls(),
    },
    {
      title: () => 'Outputs',
      controls: () => this.directiveOutputControls(),
    },
    {
      title: () =>
        this.controller().directiveMetadata?.framework === Framework.Wiz ? 'State' : 'Properties',
      controls: () => this.directiveStateControls(),
    },
  ]);

  readonly controlsLoaded = computed(() => {
    return (
      !!this.directiveStateControls() &&
      !!this.directiveOutputControls() &&
      !!this.directiveInputControls()
    );
  });

  updateValue({node, newValue}: {node: FlatNode; newValue: unknown}): void {
    this.controller().updateValue(node, newValue);
  }

  logValue(e: Event, node: FlatNode): void {
    e.stopPropagation();
    this.controller().logValue(node);
    this._snackBar.open(`Logged value of '${node.prop.name}' to the console`, 'Dismiss', {
      duration: 2000,
      horizontalPosition: 'left',
    });
  }

  handleInspect(node: FlatNode): void {
    this.inspect.emit({
      node,
      directivePosition: this.controller().directivePosition,
    });
  }

  getSignalNode(node: FlatNode): DebugSignalGraphNode | null {
    if (node.prop.descriptor.containerType?.includes('Signal')) {
      return this.signalGraph.graph()?.nodes.find((sn) => sn.label === node.prop.name) ?? null;
    }
    return null;
  }
}
