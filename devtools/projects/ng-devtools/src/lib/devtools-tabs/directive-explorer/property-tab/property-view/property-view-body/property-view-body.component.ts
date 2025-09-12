/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CdkDragDrop, moveItemInArray, CdkDropList, CdkDrag} from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy,
  Component,
  ɵFramework as Framework,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import {DebugSignalGraphNode, DirectivePosition} from '../../../../../../../../protocol';

import {
  DirectivePropertyResolver,
  DirectiveTreeData,
} from '../../../property-resolver/directive-property-resolver';
import {FlatNode} from '../../../property-resolver/element-property-resolver';
import {PropertyViewTreeComponent} from './property-view-tree/property-view-tree.component';
import {MatExpansionModule} from '@angular/material/expansion';
import {DependencyViewerComponent} from './dependency-viewer/dependency-viewer.component';
import {DocsRefButtonComponent} from '../../../../../shared/docs-ref-button/docs-ref-button.component';

@Component({
  selector: 'ng-property-view-body',
  templateUrl: './property-view-body.component.html',
  styleUrls: ['./property-view-body.component.scss'],
  imports: [
    MatExpansionModule,
    CdkDropList,
    CdkDrag,
    PropertyViewTreeComponent,
    DocsRefButtonComponent,
    DependencyViewerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyViewBodyComponent {
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

  drop(event: CdkDragDrop<any, any>): void {
    const panels = this.panels();
    moveItemInArray(panels, event.previousIndex, event.currentIndex);
    this.panels.set(Array.from(panels)); // Clone array for immutable update.
  }

  handleInspect(node: FlatNode): void {
    this.inspect.emit({
      node,
      directivePosition: this.controller().directivePosition,
    });
  }
}
