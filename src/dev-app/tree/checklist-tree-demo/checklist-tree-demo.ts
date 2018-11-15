/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ChangeDetectorRef, ChangeDetectionStrategy, Component} from '@angular/core';
import {SelectionModel} from '@angular/cdk/collections';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlattener, MatTreeFlatDataSource} from '@angular/material/tree';
import {TodoItemNode, ChecklistDatabase} from './checklist-database';
import {BehaviorSubject} from 'rxjs';


/**
 * Checklist demo with flat tree
 */
@Component({
  moduleId: module.id,
  selector: 'checklist-tree-demo',
  templateUrl: 'checklist-tree-demo.html',
  styleUrls: ['checklist-tree-demo.css'],
  providers: [ChecklistDatabase],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChecklistTreeDemo {
  levels = new Map<TodoItemNode, number>();
  treeControl: FlatTreeControl<TodoItemNode>;

  treeFlattener: MatTreeFlattener<TodoItemNode, TodoItemNode>;

  dataSource: MatTreeFlatDataSource<TodoItemNode, TodoItemNode>;

  /** The selection for checklist */
  checklistSelection = new SelectionModel<TodoItemNode>(true /* multiple */);

  constructor(private database: ChecklistDatabase, private changeDetectorRef: ChangeDetectorRef) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
        this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<TodoItemNode>(
        this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    database.dataChange.subscribe(data => this.dataSource.data = data);
  }

  getLevel = (node: TodoItemNode): number => {
    return this.levels.get(node) || 0;
  }

  isExpandable = (node: TodoItemNode): boolean => {
    return node.children.value.length > 0;
  }

  getChildren = (node: TodoItemNode): BehaviorSubject<TodoItemNode[]> => {
    return node.children;
  }

  transformer = (node: TodoItemNode, level: number) => {
    this.levels.set(node, level);
    return node;
  }

  hasNoContent(_nodeData: TodoItemNode) { return _nodeData.item === ''; }

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
