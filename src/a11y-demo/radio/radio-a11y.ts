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
  selector: 'radio-a11y',
  templateUrl: 'radio-a11y.html',
  styleUrls: ['radio-a11y.css'],
})
export class RadioAccessibilityDemo {
  favoriteSeason: string = 'Autumn';
  seasonOptions = [
    'Winter',
    'Spring',
    'Summer',
    'Autumn',
  ];
}
