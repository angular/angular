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
  contentChild,
  effect,
  input,
  output,
  TemplateRef,
} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {DataSource} from '@angular/cdk/collections';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatIcon} from '@angular/material/icon';
import {
  MatTree,
  MatTreeNode,
  MatTreeNodeDef,
  MatTreeNodePadding,
  MatTreeNodeToggle,
} from '@angular/material/tree';

import {FlatNode} from './object-tree-types';
import {PropertyPreviewComponent} from './property-preview/property-preview.component';
import {PropertyEditorComponent} from './property-editor/property-editor.component';

const CHILDREN_INDENT = 14; // px

/**
 * Renders an expandable object tree.
 * Accepts mat-tree `treeControl` or `childrenAccessor`,
 * along with a mandatory `dataSource`.
 *
 * Usage:
 *
 * ```
 * <ng-object-tree-explorer
 *   [dataSource]="dataSource()"
 *   [treeControl]="treeControl()"
 * >
 *   <ng-template let-node>
 *     <!-- Action buttons rendered on each prop row with `node` access -->
 *     <button (click)="doSomething(node)">Action</button>
 *   </ng-template>
 * </ng-object-tree-explorer>
 *
 * Styling:
 * - --ote-padding (CSS var) - container padding in `rem` (default: 0.5rem)
 * - --ote-row-indent (CSS var) - row indent/left margin in `rem` (default: 0rem)
 * - childrenIndent (input) - children indent in `px` (default: 14px)
 *
 */
@Component({
  selector: 'ng-object-tree-explorer',
  templateUrl: './object-tree-explorer.component.html',
  styleUrl: './object-tree-explorer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    MatTree,
    MatTreeNode,
    MatTreeNodeDef,
    MatTreeNodePadding,
    MatTreeNodeToggle,
    MatIcon,
    PropertyPreviewComponent,
    PropertyEditorComponent,
  ],
})
export class ObjectTreeExplorerComponent {
  protected readonly contentTemplateRef = contentChild(TemplateRef);

  protected readonly dataSource = input.required<DataSource<FlatNode> | FlatNode[]>();
  protected readonly treeControl = input<FlatTreeControl<FlatNode> | undefined>();
  protected readonly childrenAccessor = input<((datum: FlatNode) => FlatNode[]) | undefined>();
  protected readonly editingEnabled = input(false);
  protected readonly omitRootNodesNames = input(false);
  protected readonly childrenIndent = input(CHILDREN_INDENT);

  protected readonly propInspect = output<FlatNode>();
  protected readonly propValueUpdate = output<{
    node: FlatNode;
    newValue: unknown;
  }>();

  hasChild = (_: number, node: FlatNode): boolean => node.expandable;

  constructor() {
    effect(() => {
      if (!this.treeControl() && !this.childrenAccessor()) {
        throw new Error('The object tree explorer requires a "treeControl" or "childrenAccessor"');
      }
    });
  }
}
