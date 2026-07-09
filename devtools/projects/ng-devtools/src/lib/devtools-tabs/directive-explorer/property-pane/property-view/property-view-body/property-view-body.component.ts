/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, ɵFramework as Framework, computed, input, output, signal} from '@angular/core';
import {MatExpansionModule} from '@angular/material/expansion';

import {DirectivePosition} from '../../../../../../../../protocol';
import {
  DirectivePropertyResolver,
  DirectiveTreeData,
} from '../../../property-resolver/directive-property-resolver';
import {DependencyViewerComponent} from './dependency-viewer/dependency-viewer.component';
import {DocsRefButtonComponent} from '../../../../../shared/docs-ref-button/docs-ref-button.component';
import {ObjectTreeExplorerComponent} from '../../../../../shared/object-tree-explorer/object-tree-explorer.component';
import {DevtoolsSignalGraphNode} from '../../../../../shared/signal-graph';
import {FlatNode} from '../../../../../shared/object-tree-explorer/object-tree-types';
import {PropActionsMenuComponent} from './prop-actions-menu/prop-actions-menu.component';

@Component({
  selector: 'ng-property-view-body',
  templateUrl: './property-view-body.component.html',
  styleUrls: ['./property-view-body.component.scss'],
  imports: [
    MatExpansionModule,
    DocsRefButtonComponent,
    DependencyViewerComponent,
    ObjectTreeExplorerComponent,
    PropActionsMenuComponent,
  ],
})
export class PropertyViewBodyComponent {
  readonly controller = input.required<DirectivePropertyResolver>();
  readonly directiveInputControls = input.required<DirectiveTreeData>();
  readonly directivePropControls = input.required<DirectiveTreeData>();
  readonly directiveOutputControls = input.required<DirectiveTreeData>();
  readonly directiveStateControls = input.required<DirectiveTreeData>();

  readonly inspect = output<{node: FlatNode; directivePosition: DirectivePosition}>();
  readonly showSignalGraph = output<DevtoolsSignalGraphNode>();

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

  handleInspect(node: FlatNode): void {
    this.inspect.emit({
      node,
      directivePosition: this.controller().directivePosition,
    });
  }
}
