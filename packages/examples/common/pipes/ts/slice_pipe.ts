/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';

// #docregion SlicePipe_string
@Component({
  selector: 'slice-string-pipe',
  template: `<div>
    <p>{{ str }}[0:4]: '{{ str | slice: 0 : 4 }}' - output is expected to be 'abcd'</p>
    <p>{{ str }}[4:0]: '{{ str | slice: 4 : 0 }}' - output is expected to be ''</p>
    <p>{{ str }}[-4]: '{{ str | slice: -4 }}' - output is expected to be 'ghij'</p>
    <p>{{ str }}[-4:-2]: '{{ str | slice: -4 : -2 }}' - output is expected to be 'gh'</p>
    <p>{{ str }}[-100]: '{{ str | slice: -100 }}' - output is expected to be 'abcdefghij'</p>
    <p>{{ str }}[100]: '{{ str | slice: 100 }}' - output is expected to be ''</p>
  </div>`,
  standalone: false,
})
export class SlicePipeStringComponent {
  str: string = 'abcdefghij';
}
// #enddocregion

// #docregion SlicePipe_list
@Component({
  selector: 'slice-list-pipe',
  template: `<ul>
    @for(i of collection | slice: 1 : 3; track $index) {
      <li>{{ i }}</li>
    } 
  </ul>`,
  standalone: false,
})
export class SlicePipeListComponent {
  collection: string[] = ['a', 'b', 'c', 'd'];
}
// #enddocregion
