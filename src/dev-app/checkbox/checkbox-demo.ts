/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive} from '@angular/core';
import {MatCheckboxModule, MAT_CHECKBOX_DEFAULT_OPTIONS} from '@angular/material/checkbox';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';
import {MatPseudoCheckboxModule, ThemePalette} from '@angular/material/core';
import {CommonModule} from '@angular/common';
import {CheckboxExamplesModule} from '@angular/components-examples/material/checkbox';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatLegacyFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule} from '@angular/material/legacy-input';
import {MatLegacySelectModule} from '@angular/material/legacy-select';

export interface Task {
  name: string;
  completed: boolean;
  subtasks?: Task[];
}

@Directive({
  selector: '[clickActionNoop]',
  providers: [{provide: MAT_CHECKBOX_DEFAULT_OPTIONS, useValue: {clickAction: 'noop'}}],
  standalone: true,
})
export class ClickActionNoop {}

@Directive({
  selector: '[clickActionCheck]',
  providers: [{provide: MAT_CHECKBOX_DEFAULT_OPTIONS, useValue: {clickAction: 'check'}}],
  standalone: true,
})
export class ClickActionCheck {}

@Directive({
  selector: '[animationsNoop]',
  providers: [{provide: ANIMATION_MODULE_TYPE, useValue: 'NoopAnimations'}],
  standalone: true,
})
export class AnimationsNoop {}

@Component({
  selector: 'mat-checkbox-demo-nested-checklist',
  styles: [
    `
    li {
      margin-bottom: 4px;
    }
  `,
  ],
  templateUrl: './nested-checklist.html',
  standalone: true,
  imports: [CommonModule, MatCheckboxModule, FormsModule],
})
export class MatCheckboxDemoNestedChecklist {
  tasks: Task[] = [
    {
      name: 'Reminders',
      completed: false,
      subtasks: [
        {name: 'Cook Dinner', completed: false},
        {name: 'Read the Material Design Spec', completed: false},
        {name: 'Upgrade Application to Angular', completed: false},
      ],
    },
    {
      name: 'Groceries',
      completed: false,
      subtasks: [
        {name: 'Organic Eggs', completed: false},
        {name: 'Protein Powder', completed: false},
        {name: 'Almond Meal Flour', completed: false},
      ],
    },
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
    tasks.forEach(t => (t.completed = completed));
  }
}

@Component({
  selector: 'mat-checkbox-demo',
  templateUrl: 'checkbox-demo.html',
  styleUrls: ['checkbox-demo.css'],
  standalone: true,
  imports: [
    CheckboxExamplesModule,
    CommonModule,
    FormsModule,
    MatCheckboxModule,
    MatLegacyFormFieldModule,
    MatLegacyInputModule,
    MatLegacySelectModule,
    MatPseudoCheckboxModule,
    ReactiveFormsModule,
    MatCheckboxDemoNestedChecklist,
    ClickActionNoop,
    ClickActionCheck,
    AnimationsNoop,
  ],
})
export class CheckboxDemo {
  isIndeterminate: boolean = false;
  isChecked: boolean = false;
  isDisabled: boolean = false;
  labelPosition: 'after' | 'before' = 'after';
  useAlternativeColor: boolean = false;

  demoRequired = false;
  demoLabelAfter = false;
  demoChecked = false;
  demoDisabled = false;
  demoIndeterminate = false;
  demoLabel: string;
  demoLabelledBy: string;
  demoId: string;
  demoName: string;
  demoValue: string;
  demoColor: ThemePalette = 'primary';
  demoDisableRipple = false;
  demoHideLabel = false;

  printResult() {
    if (this.isIndeterminate) {
      return 'Maybe!';
    }
    return this.isChecked ? 'Yes!' : 'No!';
  }

  checkboxColor() {
    return this.useAlternativeColor ? 'primary' : 'accent';
  }
}
