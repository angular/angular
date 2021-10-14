/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {Component} from '@angular/core';
import {ThemePalette} from '@angular/material-experimental/mdc-core';
import {MatChipInputEvent, MatChipEditedEvent} from '@angular/material-experimental/mdc-chips';

export interface Person {
  name: string;
}

export interface DemoColor {
  name: string;
  color: ThemePalette;
}

@Component({
  selector: 'mdc-chips-demo',
  templateUrl: 'mdc-chips-demo.html',
  styleUrls: ['mdc-chips-demo.css'],
})
export class MdcChipsDemo {
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  disabledListboxes = false;
  disableInputs = false;
  editable = false;
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

  add(event: MatChipInputEvent): void {
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

  edit(person: Person, event: MatChipEditedEvent): void {
    if (!event.value.trim().length) {
      this.remove(person);
      return;
    }

    const index = this.people.indexOf(person);
    const newPeople = this.people.slice();
    newPeople[index] = {...newPeople[index], name: event.value};
    this.people = newPeople;
  }

  toggleVisible(): void {
    this.visible = false;
  }

  selectedColors: string[] = ['Primary', 'Warn'];
  selectedColor = 'Accent';
}
