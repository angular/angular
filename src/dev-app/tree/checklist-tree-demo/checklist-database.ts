/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';


/**
 * Node for to-do item
 */
export class TodoItemNode {
  children: BehaviorSubject<TodoItemNode[]>;
  constructor(public item: string, children?: TodoItemNode[], public parent?: TodoItemNode) {
    this.children = new BehaviorSubject(children === undefined ? [] : children);
  }
}

/**
 * The Json object for to-do list data.
 */
const TREE_DATA = [
  new TodoItemNode('Reminders', [
    new TodoItemNode('Cook dinner'),
    new TodoItemNode('Read the Material Design spec'),
    new TodoItemNode('Upgrade Application to Angular')
  ]),
  new TodoItemNode('Groceries', [
    new TodoItemNode('Organic eggs'),
    new TodoItemNode('Protein Powder'),
    new TodoItemNode('Almond Meal flour'),
    new TodoItemNode('Fruits', [
      new TodoItemNode('Apple'),
      new TodoItemNode('Orange'),
      new TodoItemNode('Berries', [
        new TodoItemNode('Blueberry'),
        new TodoItemNode('Raspberry')
      ])
    ])
  ])
];

/**
 * Checklist database, it can build a tree structured Json object.
 * Each node in Json object represents a to-do item or a category.
 * If a node is a category, it has children items and new items can be added under the category.
 */
@Injectable()
export class ChecklistDatabase {
  dataChange: BehaviorSubject<TodoItemNode[]> = new BehaviorSubject<TodoItemNode[]>(TREE_DATA);

  get data(): TodoItemNode[] {
    return this.dataChange.value;
  }

  /** Add an item to to-do list */
  insertItem(parent: TodoItemNode, name: string) {
    const child = new TodoItemNode(name, [], parent);
    const children = parent.children.value;
    children.push(child);
    parent.children.next(children);
    this.dataChange.next(this.data);
  }

  updateItem(node: TodoItemNode, name: string) {
    const newNode = new TodoItemNode(name, node.children.value, node.parent);
    if (node.parent) {
      const children = node.parent.children.value;
      const index = children.indexOf(node);
      children.splice(index, 1, newNode);
      node.parent.children.next(children);
      this.dataChange.next(this.data);
    }
  }
}
