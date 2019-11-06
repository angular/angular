/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';


export interface Task {
  name: string;
  completed: boolean;
  subtasks?: Task[];
}

@Component({
  selector: 'checkbox-a11y',
  templateUrl: 'checkbox-a11y.html',
  styleUrls: ['checkbox-a11y.css'],
})
export class CheckboxAccessibilityDemo {

  tasks: Task[] = [
    {
      name: 'Reminders',
      completed: false,
      subtasks: [
        {name: 'Cook Dinner', completed: false},
        {name: 'Read the Material Design Spec', completed: false},
        {name: 'Upgrade Application to Angular', completed: false}
      ]
    },
    {
      name: 'Groceries',
      completed: false,
      subtasks: [
        {name: 'Organic Eggs', completed: false},
        {name: 'Protein Powder', completed: false},
        {name: 'Almond Meal Flour', completed: false}
      ]
    }
  ];

  allComplete(task: Task): boolean {
    const subtasks = task.subtasks;

    return task.completed || (subtasks != null && subtasks.every(t => t.completed));
  }

  someComplete(tasks: Task[] | undefined | null): boolean {
    if (tasks == null) {
      return false;
    }
    const numComplete = tasks.filter(t => t.completed).length;
    return numComplete > 0 && numComplete < tasks.length;
  }

  setAllCompleted(tasks: Task[] | undefined | null, completed: boolean): void {
    if (tasks == null) {
      return;
    }
    tasks.forEach(t => t.completed = completed);
  }
}
