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
  selector: 'progress-bar-a11y',
  templateUrl: 'progress-bar-a11y.html',
})
export class ProgressBarAccessibilityDemo {
  surveyProgress: number = 30;
  videoPlayValue: number = 20;
  videoBufferValue: number = 60;
}
