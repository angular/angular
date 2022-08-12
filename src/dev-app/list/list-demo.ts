/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatLegacyButtonModule} from '@angular/material/legacy-button';
import {MatLegacyCheckboxModule} from '@angular/material/legacy-checkbox';
import {MatIconModule} from '@angular/material/icon';
import {
  MatLegacyListModule,
  MatLegacyListOptionCheckboxPosition,
} from '@angular/material/legacy-list';

@Component({
  selector: 'list-demo',
  templateUrl: 'list-demo.html',
  styleUrls: ['list-demo.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatLegacyButtonModule,
    MatLegacyCheckboxModule,
    MatIconModule,
    MatLegacyListModule,
  ],
})
export class ListDemo {
  items: string[] = ['Pepper', 'Salt', 'Paprika'];

  contacts: {name: string; headline: string}[] = [
    {name: 'Nancy', headline: 'Software engineer'},
    {name: 'Mary', headline: 'TPM'},
    {name: 'Bobby', headline: 'UX designer'},
  ];

  checkboxPosition: MatLegacyListOptionCheckboxPosition = 'before';

  messages: {from: string; subject: string; message: string; image: string}[] = [
    {
      from: 'Nancy',
      subject: 'Brunch?',
      message: 'Did you want to go on Sunday? I was thinking that might work.',
      image: 'https://angular.io/generated/images/bios/cindygreenekaplan.jpg',
    },
    {
      from: 'Mary',
      subject: 'Summer BBQ',
      message: 'Wish I could come, but I have some prior obligations.',
      image: 'https://angular.io/generated/images/bios/twerske.jpg',
    },
    {
      from: 'Bobby',
      subject: 'Oui oui',
      message: 'Do you have Paris reservations for the 15th? I just booked!',
      image: 'https://angular.io/generated/images/bios/jelbourn.jpg',
    },
  ];

  links: {name: string}[] = [{name: 'Inbox'}, {name: 'Outbox'}, {name: 'Spam'}, {name: 'Trash'}];

  thirdLine = false;
  infoClicked = false;
  selectionListDisabled = false;
  selectionListRippleDisabled = false;

  selectedOptions: string[] = ['apples'];
  changeEventCount = 0;
  modelChangeEventCount = 0;

  onSelectedOptionsChange(values: string[]) {
    this.selectedOptions = values;
    this.modelChangeEventCount++;
  }

  toggleCheckboxPosition() {
    this.checkboxPosition = this.checkboxPosition === 'before' ? 'after' : 'before';
  }

  favoriteOptions: string[] = [];

  alertItem(msg: string) {
    alert(msg);
  }
}
