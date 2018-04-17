/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ChangeDetectorRef, ChangeDetectionStrategy, Component} from '@angular/core';
import {SelectionModel} from '@angular/cdk/collections';
import {NestedTreeControl} from '@angular/cdk/tree';
import {Observable} from 'rxjs';
import {ChecklistDatabase, TodoItemNode} from './checklist-database';


/**
 * Checklist demo with nested tree
 */
@Component({
  moduleId: module.id,
  selector: 'checklist-nested-tree-demo',
  templateUrl: 'checklist-nested-tree-demo.html',
  styleUrls: ['checklist-tree-demo.css'],
  providers: [ChecklistDatabase],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChecklistNestedTreeDemo {
  treeControl: NestedTreeControl<TodoItemNode>;

  dataSource: TodoItemNode[];

  /** The selection for checklist */
  checklistSelection = new SelectionModel<TodoItemNode>(true /* multiple */);

  constructor(private database: ChecklistDatabase, private changeDetectorRef: ChangeDetectorRef) {
    this.treeControl = new NestedTreeControl<TodoItemNode>(this.getChildren);
    this.dataSource = database.data;
  }

  getChildren = (node: TodoItemNode): Observable<TodoItemNode[]> => node.children;

  hasNoContent = (_nodeData: TodoItemNode) => { return _nodeData.item === ''; };

  /** Whether all the descendants of the node are selected */
  descendantsAllSelected(node: TodoItemNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    if (!descendants.length) {
      return this.checklistSelection.isSelected(node);
    }
    const selected = this.checklistSelection.isSelected(node);
    const allSelected = descendants.every(child => this.checklistSelection.isSelected(child));
    if (!selected && allSelected) {
      this.checklistSelection.select(node);
      this.changeDetectorRef.markForCheck();
    }
    return allSelected;
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: TodoItemNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    if (!descendants.length) {
      return false;
    }
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  todoItemSelectionToggle(node: TodoItemNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants, node)
      : this.checklistSelection.deselect(...descendants, node);
    this.changeDetectorRef.markForCheck();
  }

  /** Select the category so we can insert the new item. */
  addNewItem(node: TodoItemNode) {
    this.database.insertItem(node, '');
    this.treeControl.expand(node);
  }

  /** Save the node to database */
  saveNode(node: TodoItemNode, itemValue: string) {
    this.database.updateItem(node, itemValue);
  }
}
