/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'list-a11y',
  templateUrl: 'list-a11y.html',
  styleUrls: ['list-a11y.css']
})
export class ListAccessibilityDemo {
  items: string[] = [
    'Pepper',
    'Salt',
    'Paprika'
  ];

  messages = [
    {
      from: 'Nancy',
      subject: 'Brunch?',
      message: 'Did you want to go on Sunday? I was thinking that might work.',
      image: 'https://angular.io/generated/images/bios/julie-ralph.jpg'
    },
    {
      from: 'Mary',
      subject: 'Summer BBQ',
      message: 'Wish I could come, but I have some prior obligations.',
      image: 'https://angular.io/generated/images/bios/juleskremer.jpg'
    },
    {
      from: 'Bobby',
      subject: 'Oui oui',
      message: 'Do you have Paris reservations for the 15th? I just booked!',
      image: 'https://angular.io/generated/images/bios/jelbourn.jpg'
    }
  ];

  links = [
    {name: 'Inbox'},
    {name: 'Outbox'},
    {name: 'Spam'},
    {name: 'Trash'}

  ];

  folders = [
    {name: 'Imported', updated: 'Miles'},
    {name: 'Important', updated: 'Tina'},
    {name: 'Unread', updated: 'Jeremy'},
  ];

  notes = [
    {name: 'Update screenshots', updated: 'Kara'},
    {name: 'Install new application', updated: 'Andrew'},
  ];
}
