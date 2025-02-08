/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';

// #docregion LowerUpperPipe
@Component({
  selector: 'lowerupper-pipe',
  template: `<div>
    <label>Name: </label><input #name (keyup)="change(name.value)" type="text" />
    <p>In lowercase:</p>
    <pre>'{{ value | lowercase }}'</pre>
    <p>In uppercase:</p>
    <pre>'{{ value | uppercase }}'</pre>
  </div>`,
  standalone: false,
})
export class LowerUpperPipeComponent {
  value: string = '';
  change(value: string) {
    this.value = value;
  }
}
// #enddocregion
