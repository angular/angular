/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatLegacyCardModule} from '@angular/material/legacy-card';
import {MatLegacyCheckboxModule} from '@angular/material/legacy-checkbox';
import {MatLegacyChipInputEvent, MatLegacyChipsModule} from '@angular/material/legacy-chips';
import {ThemePalette} from '@angular/material/core';
import {MatLegacyFormFieldModule} from '@angular/material/legacy-form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';

export interface Person {
  name: string;
}

export interface DemoColor {
  name: string;
  color: ThemePalette;
}

@Component({
  selector: 'chips-demo',
  templateUrl: 'chips-demo.html',
  styleUrls: ['chips-demo.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatLegacyCardModule,
    MatLegacyCheckboxModule,
    MatLegacyChipsModule,
    MatLegacyFormFieldModule,
    MatIconModule,
    MatToolbarModule,
  ],
})
export class ChipsDemo {
  tabIndex = 0;
  visible = true;
  color: ThemePalette;
  selectable = true;
  removable = true;
  addOnBlur = true;
  message = '';

  // Enter, comma, semi-colon
  separatorKeysCodes = [ENTER, COMMA, 186];

  selectedPeople = null;

  people: Person[] = [
    {name: 'Kara'},
    {name: 'Jeremy'},
    {name: 'Topher'},
    {name: 'Elad'},
    {name: 'Kristiyan'},
    {name: 'Paul'},
  ];

  availableColors: DemoColor[] = [
    {name: 'none', color: undefined},
    {name: 'Primary', color: 'primary'},
    {name: 'Accent', color: 'accent'},
    {name: 'Warn', color: 'warn'},
  ];

  displayMessage(message: string): void {
    this.message = message;
  }

  add(event: MatLegacyChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our person
    if (value) {
      this.people.push({name: value});
    }

    // Clear the input value
    event.chipInput!.clear();
  }

  remove(person: Person): void {
    const index = this.people.indexOf(person);

    if (index >= 0) {
      this.people.splice(index, 1);
    }
  }

  removeColor(color: DemoColor) {
    let index = this.availableColors.indexOf(color);

    if (index >= 0) {
      this.availableColors.splice(index, 1);
    }

    index = this.selectedColors.indexOf(color.name);

    if (index >= 0) {
      this.selectedColors.splice(index, 1);
    }
  }

  toggleVisible(): void {
    this.visible = false;
  }
  selectedColors: string[] = ['Primary', 'Warn'];
  selectedColor = 'Accent';
}
